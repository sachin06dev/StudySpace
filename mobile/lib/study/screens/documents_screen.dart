import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_button.dart';
import '../../core/design_system/components/app_chip.dart';
import '../../core/design_system/components/app_dialog.dart';
import '../../core/design_system/components/app_empty_state.dart';
import '../../core/design_system/components/app_loading_state.dart';
import '../../core/services/feedback_service.dart';
import '../models/study_document.dart';
import '../providers/study_provider.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedCategory = 'all';
  String? _loadingDocId;

  static const List<Map<String, String>> _categories = [
    {'key': 'all', 'label': 'All Files'},
    {'key': 'lecture_notes', 'label': 'Lecture Notes'},
    {'key': 'textbook', 'label': 'Textbook'},
    {'key': 'syllabus', 'label': 'Syllabus'},
    {'key': 'research_paper', 'label': 'Research Paper'},
    {'key': 'assignment', 'label': 'Assignment'},
    {'key': 'past_paper', 'label': 'Past Paper'},
    {'key': 'slides', 'label': 'Slides'},
    {'key': 'other', 'label': 'Other'},
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<StudyDocument> _filterDocuments(List<StudyDocument> docs) {
    return docs.where((doc) {
      final docCat = (doc.category ?? 'other').toLowerCase();
      if (_selectedCategory != 'all' && docCat != _selectedCategory.toLowerCase()) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchTitle = doc.title.toLowerCase().contains(q);
        final matchFile = doc.filename.toLowerCase().contains(q);
        final matchCat = docCat.contains(q);
        if (!matchTitle && !matchFile && !matchCat) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  Future<void> _openDocument(BuildContext context, StudyDocument doc) async {
    FeedbackService.instance.selection();
    setState(() => _loadingDocId = doc.id);

    try {
      final studyProvider = context.read<StudyProvider>();
      final url = await studyProvider.getDocumentDownloadUrl(doc.id);

      if (!mounted) return;
      setState(() => _loadingDocId = null);

      if (url == null || url.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Could not generate document link. Check your internet connection.'),
            backgroundColor: AppColors.danger,
          ),
        );
        return;
      }

      final uri = Uri.parse(url);
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loadingDocId = null);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error opening document: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    }
  }

  void _confirmDelete(BuildContext context, StudyDocument doc) {
    AppDialog.show(
      context,
      title: 'Delete Document',
      description: 'Are you sure you want to remove "${doc.title}"? This cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmVariant: AppButtonVariant.danger,
      onConfirm: () async {
        FeedbackService.instance.medium();
        await context.read<StudyProvider>().deleteDocument(doc.id);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Deleted "${doc.title}"'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      },
    );
  }

  Future<void> _pickAndUploadPdf(BuildContext context) async {
    FeedbackService.instance.selection();
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
      );

      if (result == null || result.files.isEmpty) {
        return;
      }

      final file = result.files.first;
      final filePath = file.path;
      final fileName = file.name;
      final fileSize = file.size;

      if (filePath == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not access selected file.')),
        );
        return;
      }

      // Check file extension
      if (!fileName.toLowerCase().endsWith('.pdf')) {
        if (!mounted) return;
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Invalid File Type'),
            content: const Text('Only PDF documents (.pdf) can be uploaded on mobile.'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK')),
            ],
          ),
        );
        return;
      }

      // Check file size limit: 10 MB strict
      const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
      if (fileSize > maxSizeBytes) {
        if (!mounted) return;
        final sizeMb = (fileSize / (1024 * 1024)).toStringAsFixed(1);
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('File Exceeds 10 MB Limit'),
            content: Text(
              'The selected file is $sizeMb MB.\n\nMobile PDF uploads are limited to 10 MB to ensure fast, reliable synchronization. Please optimize or compress the PDF before uploading.',
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK')),
            ],
          ),
        );
        return;
      }

      // Show upload metadata confirmation bottom sheet
      if (!mounted) return;
      await _showUploadConfirmationSheet(context, filePath, fileName, fileSize);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to select file: $e'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  Future<void> _showUploadConfirmationSheet(
    BuildContext context,
    String filePath,
    String fileName,
    int fileSize,
  ) async {
    final titleCtrl = TextEditingController(
      text: fileName.contains('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName,
    );
    final descCtrl = TextEditingController();
    String category = 'lecture_notes';
    bool isUploading = false;

    final formattedSize = fileSize < 1024 * 1024
        ? '${(fileSize / 1024).toStringAsFixed(1)} KB'
        : '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => StatefulBuilder(
        builder: (ctx, setSheetState) {
          final isDark = AppColors.isDark(ctx);

          return Container(
            decoration: BoxDecoration(
              color: AppColors.card(ctx),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadii.xlVal)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.15),
                  blurRadius: 20,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 12,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Handle
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: AppColors.textMuted(ctx).withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),

                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.primary(ctx).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.upload_file_rounded, color: AppColors.primaryLight, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Upload Document',
                                style: AppTypography.heading3.copyWith(
                                  color: AppColors.textPrimary(ctx),
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              Text(
                                '$fileName • $formattedSize',
                                style: AppTypography.caption.copyWith(color: AppColors.textMuted(ctx)),
                              ),
                            ],
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: isUploading ? null : () => Navigator.pop(sheetContext),
                        color: AppColors.textMuted(ctx),
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),

                  // Title field
                  Text(
                    'DOCUMENT TITLE',
                    style: AppTypography.overline.copyWith(color: AppColors.textMuted(ctx)),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: titleCtrl,
                    enabled: !isUploading,
                    decoration: InputDecoration(
                      hintText: 'Enter title for this document',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Category Selector
                  Text(
                    'CATEGORY',
                    style: AppTypography.overline.copyWith(color: AppColors.textMuted(ctx)),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted(ctx),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border(ctx)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: category,
                        isExpanded: true,
                        dropdownColor: AppColors.card(ctx),
                        items: _categories
                            .where((c) => c['key'] != 'all')
                            .map(
                              (c) => DropdownMenuItem(
                                value: c['key'],
                                child: Text(c['label']!, style: TextStyle(color: AppColors.textPrimary(ctx))),
                              ),
                            )
                            .toList(),
                        onChanged: isUploading
                            ? null
                            : (val) {
                                if (val != null) setSheetState(() => category = val);
                              },
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Description / Notes (Optional)
                  Text(
                    'DESCRIPTION (OPTIONAL)',
                    style: AppTypography.overline.copyWith(color: AppColors.textMuted(ctx)),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: descCtrl,
                    enabled: !isUploading,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Add study notes or tags...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),

                  const SizedBox(height: 22),

                  // Upload Button
                  ElevatedButton.icon(
                    onPressed: isUploading
                        ? null
                        : () async {
                            setSheetState(() => isUploading = true);
                            try {
                              FeedbackService.instance.selection();
                              final studyProvider = context.read<StudyProvider>();
                              await studyProvider.uploadDocument(
                                filePath: filePath,
                                fileName: fileName,
                                fileSizeBytes: fileSize,
                                title: titleCtrl.text.trim().isNotEmpty ? titleCtrl.text.trim() : fileName,
                                category: category,
                                description: descCtrl.text.trim(),
                              );

                              if (context.mounted) {
                                Navigator.pop(sheetContext);
                                FeedbackService.instance.light();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Uploaded "${titleCtrl.text.trim()}" to Academic Vault'),
                                    backgroundColor: AppColors.success,
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                              }
                            } catch (e) {
                              setSheetState(() => isUploading = false);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Upload failed: ${e.toString().replaceAll("Exception: ", "")}'),
                                    backgroundColor: AppColors.danger,
                                    behavior: SnackBarBehavior.floating,
                                  ),
                                );
                              }
                            }
                          },
                    icon: isUploading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.cloud_upload_rounded, size: 20),
                    label: Text(
                      isUploading ? 'Uploading to Vault...' : 'Upload PDF (Max 10 MB)',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary(ctx),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final studyProvider = context.watch<StudyProvider>();
    final allDocs = studyProvider.documents;
    final filteredDocs = _filterDocuments(allDocs);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Top 3 recent documents for quick shelf
    final recentDocs = allDocs.take(3).toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Academic Vault',
              style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w700),
            ),
            Text(
              '${allDocs.length} ${allDocs.length == 1 ? 'document' : 'documents'}',
              style: AppTypography.caption.copyWith(
                color: AppColors.textMuted(context),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.upload_file_rounded),
            tooltip: 'Upload PDF',
            onPressed: () => _pickAndUploadPdf(context),
          ),
        ],
        elevation: 0,
      ),
      body: SafeArea(
        child: studyProvider.isLoading && allDocs.isEmpty
            ? const Center(child: AppLoadingState(message: 'Loading academic vault...'))
            : RefreshIndicator(
                onRefresh: () => studyProvider.loadData(),
                child: CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: [
                    // 1. Search Bar
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                        child: TextField(
                          controller: _searchController,
                          onChanged: (val) => setState(() => _searchQuery = val.trim()),
                          decoration: InputDecoration(
                            hintText: 'Search documents by title or type...',
                            prefixIcon: Icon(
                              Icons.search_rounded,
                              size: 20,
                              color: AppColors.textMuted(context),
                            ),
                            suffixIcon: _searchQuery.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, size: 18),
                                    onPressed: () {
                                      _searchController.clear();
                                      setState(() => _searchQuery = '');
                                    },
                                  )
                                : null,
                            filled: true,
                            fillColor: AppColors.surfaceMuted(context),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            border: OutlineInputBorder(
                              borderRadius: AppRadii.lg,
                              borderSide: BorderSide(
                                color: AppColors.border(context),
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: AppRadii.lg,
                              borderSide: BorderSide(
                                color: AppColors.border(context),
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: AppRadii.lg,
                              borderSide: BorderSide(
                                color: AppColors.primary(context),
                                width: 1.5,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                    // 2. Category Filter Chips
                    SliverToBoxAdapter(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        child: Row(
                          children: _categories.map((cat) {
                            final isSelected = _selectedCategory == cat['key'];
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: AppChip(
                                label: cat['label']!,
                                variant: isSelected ? AppChipTone.primary : AppChipTone.neutral,
                                onTap: () {
                                  FeedbackService.instance.selection();
                                  setState(() => _selectedCategory = cat['key']!);
                                },
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ),

                    // 3. Recently Uploaded Shelf (only when no search query and category is all)
                    if (_searchQuery.isEmpty && _selectedCategory == 'all' && recentDocs.isNotEmpty) ...[
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
                          child: Text(
                            'RECENTLY UPLOADED',
                            style: AppTypography.overline.copyWith(
                              letterSpacing: 1.0,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textMuted(context),
                            ),
                          ),
                        ),
                      ),
                      SliverToBoxAdapter(
                        child: SizedBox(
                          height: 108,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: recentDocs.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 10),
                            itemBuilder: (ctx, idx) {
                              final doc = recentDocs[idx];
                              return _buildRecentCard(ctx, doc, isDark);
                            },
                          ),
                        ),
                      ),
                      const SliverToBoxAdapter(child: SizedBox(height: 12)),
                    ],

                    // 4. Section header for documents list
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _selectedCategory == 'all'
                                  ? (_searchQuery.isEmpty ? 'ALL VAULT DOCUMENTS' : 'SEARCH RESULTS')
                                  : '${_selectedCategory.replaceAll('_', ' ').toUpperCase()} DOCUMENTS',
                              style: AppTypography.overline.copyWith(
                                letterSpacing: 1.0,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textMuted(context),
                              ),
                            ),
                            Text(
                              '${filteredDocs.length} items',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textMuted(context),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // 5. Document List Rows or Empty State
                    if (filteredDocs.isEmpty)
                      SliverFillRemaining(
                        hasScrollBody: false,
                        child: Center(
                          child: AppEmptyState(
                            icon: Icons.folder_open_rounded,
                            title: _searchQuery.isNotEmpty
                                ? 'No matching documents'
                                : 'No study documents yet',
                            message: _searchQuery.isNotEmpty
                                ? 'Try searching for a different keyword or filter category.'
                                : 'Upload your lecture notes, syllabi, or textbooks (PDF, max 10 MB) to access them anywhere.',
                            actionLabel: _searchQuery.isEmpty ? 'Upload PDF' : null,
                            onAction: _searchQuery.isEmpty ? () => _pickAndUploadPdf(context) : null,
                          ),
                        ),
                      )
                    else
                      SliverPadding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (ctx, idx) {
                              final doc = filteredDocs[idx];
                              return _buildDocumentRow(ctx, doc, isDark);
                            },
                            childCount: filteredDocs.length,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
      ),
      floatingActionButton: FloatingActionButton(
        tooltip: 'Upload PDF',
        onPressed: () => _pickAndUploadPdf(context),
        backgroundColor: AppColors.primary(context),
        foregroundColor: Colors.white,
        child: const Icon(Icons.upload_file_rounded, size: 24),
      ),
    );
  }

  Widget _buildRecentCard(BuildContext context, StudyDocument doc, bool isDark) {
    final isOpening = _loadingDocId == doc.id;

    return Container(
      width: 220,
      decoration: BoxDecoration(
        color: AppColors.card(context),
        borderRadius: AppRadii.lg,
        border: Border.all(
          color: AppColors.border(context),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: AppRadii.lg,
          onTap: isOpening ? null : () => _openDocument(context, doc),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildTypeBadge(doc.fileTypeBadge, isDark),
                    if (isOpening)
                      const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    else
                      Icon(
                        Icons.open_in_new_rounded,
                        size: 14,
                        color: AppColors.textMuted(context),
                      ),
                  ],
                ),
                Text(
                  doc.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.bodySm.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary(context),
                  ),
                ),
                Text(
                  '${doc.formattedSize} · ${_formatCategory(doc.category)}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.caption.copyWith(
                    fontSize: 11,
                    color: AppColors.textMuted(context),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDocumentRow(BuildContext context, StudyDocument doc, bool isDark) {
    final isOpening = _loadingDocId == doc.id;
    final formattedDate = _formatDate(doc.createdAt);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.card(context),
        borderRadius: AppRadii.lg,
        border: Border.all(
          color: AppColors.border(context),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: AppRadii.lg,
          onTap: isOpening ? null : () => _openDocument(context, doc),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                // File Type Badge
                _buildTypeBadge(doc.fileTypeBadge, isDark),
                const SizedBox(width: 12),

                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        doc.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.bodySm.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary(context),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              _formatCategory(doc.category),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTypography.caption.copyWith(
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: AppColors.primary(context),
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '·  ${doc.formattedSize}  ·  $formattedDate',
                            style: AppTypography.caption.copyWith(
                              fontSize: 11,
                              color: AppColors.textMuted(context),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Actions
                if (isOpening)
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                else ...[
                  IconButton(
                    icon: Icon(
                      Icons.open_in_new_rounded,
                      size: 18,
                      color: AppColors.primary(context),
                    ),
                    tooltip: 'Open Document',
                    onPressed: () => _openDocument(context, doc),
                  ),
                  PopupMenuButton<String>(
                    icon: Icon(
                      Icons.more_vert_rounded,
                      size: 18,
                      color: AppColors.textMuted(context),
                    ),
                    onSelected: (val) {
                      if (val == 'delete') {
                        _confirmDelete(context, doc);
                      }
                    },
                    itemBuilder: (ctx) => [
                      PopupMenuItem(
                        value: 'delete',
                        child: Row(
                          children: [
                            Icon(Icons.delete_outline_rounded, size: 16, color: AppColors.danger),
                            const SizedBox(width: 8),
                            Text('Delete', style: TextStyle(color: AppColors.danger, fontSize: 13)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTypeBadge(String type, bool isDark) {
    Color bg;
    Color fg;

    switch (type.toUpperCase()) {
      case 'PDF':
        bg = isDark ? const Color(0x26EF4444) : const Color(0x1AEF4444);
        fg = const Color(0xFFEF4444);
        break;
      case 'DOCX':
      case 'DOC':
        bg = isDark ? const Color(0x263B82F6) : const Color(0x1A3B82F6);
        fg = const Color(0xFF3B82F6);
        break;
      case 'PPTX':
      case 'PPT':
        bg = isDark ? const Color(0x26F97316) : const Color(0x1AF97316);
        fg = const Color(0xFFF97316);
        break;
      case 'EPUB':
        bg = isDark ? const Color(0x268B5CF6) : const Color(0x1A8B5CF6);
        fg = const Color(0xFF8B5CF6);
        break;
      case 'PNG':
      case 'JPG':
      case 'JPEG':
        bg = isDark ? const Color(0x2610B981) : const Color(0x1A10B981);
        fg = const Color(0xFF10B981);
        break;
      default:
        bg = isDark ? const Color(0x266B7280) : const Color(0x1A6B7280);
        fg = const Color(0xFF6B7280);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3.5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        type.toUpperCase(),
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.6,
          color: fg,
        ),
      ),
    );
  }

  String _formatCategory(String? cat) {
    if (cat == null || cat.isEmpty) return 'General';
    return cat
        .replaceAll('_', ' ')
        .split(' ')
        .map((w) => w.isNotEmpty ? '${w[0].toUpperCase()}${w.substring(1).toLowerCase()}' : '')
        .join(' ');
  }

  String _formatDate(String? isoString) {
    if (isoString == null || isoString.isEmpty) return '';
    try {
      final dt = DateTime.parse(isoString);
      return DateFormat('MMM d').format(dt);
    } catch (_) {
      return '';
    }
  }
}
