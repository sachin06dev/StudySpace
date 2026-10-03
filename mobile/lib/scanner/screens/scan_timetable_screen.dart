import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/timetable_scanner_service.dart';
import 'scanned_timetable_review_screen.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_spacing.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_card.dart';
import '../../core/services/feedback_service.dart';
import '../../timetable/widgets/add_slot_sheet.dart';

class ScanTimetableScreen extends StatefulWidget {
  const ScanTimetableScreen({super.key});

  @override
  State<ScanTimetableScreen> createState() => _ScanTimetableScreenState();
}

class _ScanTimetableScreenState extends State<ScanTimetableScreen> {
  final ImagePicker _picker = ImagePicker();
  final TimetableScannerService _scannerService = TimetableScannerService();

  File? _selectedImage;
  bool _isProcessing = false;
  String? _errorMessage;

  Future<void> _pickImage(ImageSource source) async {
    FeedbackService.instance.selection();
    setState(() => _errorMessage = null);

    try {
      final picked = await _picker.pickImage(
        source: source,
        maxWidth: 2048,
        maxHeight: 2048,
        imageQuality: 88,
      );

      if (picked != null) {
        setState(() {
          _selectedImage = File(picked.path);
        });
        _processImage();
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Could not access camera/gallery: $e';
      });
    }
  }

  Future<void> _processImage() async {
    if (_selectedImage == null) return;

    setState(() {
      _isProcessing = true;
      _errorMessage = null;
    });

    try {
      final result = await _scannerService.scanImage(_selectedImage!);
      FeedbackService.instance.scanSuccess();

      if (mounted) {
        setState(() {
          _isProcessing = false;
        });

        // Navigate to review screen
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => ScannedTimetableReviewScreen(scanResult: result),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Timetable'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'AI Vision Timetable Scanner',
                style: AppTypography.heading2.copyWith(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 6),
              Text(
                'Snap a photo or upload an image of your schedule. Gemini AI extracts courses, timings, and rooms automatically.',
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textMuted(context),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              Expanded(
                child: Center(
                  child: _isProcessing
                      ? Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: AppColors.primary(context).withValues(alpha: 0.12),
                                shape: BoxShape.circle,
                              ),
                              child: const CircularProgressIndicator(strokeWidth: 3),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              'Reading your timetable...',
                              textAlign: TextAlign.center,
                              style: AppTypography.heading3.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Identifying class slots, subjects, and professor details',
                              textAlign: TextAlign.center,
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textMuted(context),
                              ),
                            ),
                          ],
                        )
                      : _errorMessage != null
                          ? AppCard(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: AppColors.danger.withValues(alpha: 0.12),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.error_outline_rounded,
                                      color: AppColors.danger,
                                      size: 36,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'Scanner Notice',
                                    style: AppTypography.heading3.copyWith(fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    _errorMessage!,
                                    textAlign: TextAlign.center,
                                    style: AppTypography.bodySmall.copyWith(
                                      color: AppColors.textMuted(context),
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton(
                                          onPressed: () {
                                            FeedbackService.instance.selection();
                                            Navigator.of(context).pop();
                                            AddSlotSheet.show(context);
                                          },
                                          child: const Text('Add Manually'),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: ElevatedButton(
                                          onPressed: () {
                                            FeedbackService.instance.selection();
                                            setState(() => _errorMessage = null);
                                          },
                                          child: const Text('Try Again'),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            )
                          : Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (_selectedImage != null) ...[
                                  ClipRRect(
                                    borderRadius: AppRadii.lg,
                                    child: Image.file(
                                      _selectedImage!,
                                      height: 220,
                                      width: double.infinity,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                ] else ...[
                                  Container(
                                    padding: const EdgeInsets.all(28),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceMuted(context),
                                      borderRadius: AppRadii.xl,
                                      border: Border.all(color: AppColors.border(context)),
                                    ),
                                    child: Column(
                                      children: [
                                        Icon(
                                          Icons.document_scanner_rounded,
                                          size: 56,
                                          color: AppColors.primary(context),
                                        ),
                                        const SizedBox(height: 14),
                                        Text(
                                          'Ready to Scan',
                                          style: AppTypography.heading3.copyWith(fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Choose Camera to take a photo or Gallery to select a saved image.',
                                          textAlign: TextAlign.center,
                                          style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                ],
                              ],
                            ),
                ),
              ),

              // Capture Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isProcessing ? null : () => _pickImage(ImageSource.camera),
                      icon: const Icon(Icons.camera_alt_rounded, size: 20),
                      label: const Text('Camera'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _isProcessing ? null : () => _pickImage(ImageSource.gallery),
                      icon: const Icon(Icons.photo_library_rounded, size: 20),
                      label: const Text('Gallery'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary(context),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
