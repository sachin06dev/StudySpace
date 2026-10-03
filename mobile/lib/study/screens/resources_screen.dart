import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/design_system/app_colors.dart';
import '../../core/design_system/app_radii.dart';
import '../../core/design_system/app_typography.dart';
import '../../core/design_system/components/app_button.dart';
import '../../core/design_system/components/app_chip.dart';
import '../../core/design_system/components/app_dialog.dart';
import '../../core/design_system/components/app_empty_state.dart';
import '../../core/services/feedback_service.dart';
import '../models/website_resource.dart';
import '../providers/study_provider.dart';

class ResourcesScreen extends StatefulWidget {
  const ResourcesScreen({super.key});

  @override
  State<ResourcesScreen> createState() => _ResourcesScreenState();
}

class _ResourcesScreenState extends State<ResourcesScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _selectedCategory = 'all';

  final List<String> _categories = [
    'all',
    'documentation',
    'course',
    'reference',
    'practice',
    'college',
    'other',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _formatCategoryLabel(String cat) {
    if (cat == 'all') return 'All Links';
    return cat[0].toUpperCase() + cat.substring(1);
  }

  void _showAddResourceDialog() {
    FeedbackService.instance.selection();
    final urlCtrl = TextEditingController();
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    String selectedCat = 'documentation';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            backgroundColor: AppColors.card(ctx),
            shape: RoundedRectangleBorder(borderRadius: AppRadii.xl),
            title: Text(
              'Save Study Link',
              style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w700),
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bookmark documentation, courses, articles, or cheat sheets.',
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: urlCtrl,
                    decoration: InputDecoration(
                      labelText: 'Resource URL',
                      hintText: 'https://docs.flutter.dev/...',
                      border: OutlineInputBorder(borderRadius: AppRadii.lg),
                      prefixIcon: const Icon(Icons.link_rounded, size: 20),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    onChanged: (val) {
                      if (titleCtrl.text.isEmpty && val.trim().isNotEmpty) {
                        try {
                          final clean = val.trim().startsWith('http') ? val.trim() : 'https://${val.trim()}';
                          final uri = Uri.parse(clean);
                          if (uri.host.isNotEmpty) {
                            setDialogState(() {
                              titleCtrl.text = uri.host.replaceFirst(RegExp(r'^www\.'), '');
                            });
                          }
                        } catch (_) {}
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: titleCtrl,
                    decoration: InputDecoration(
                      labelText: 'Title',
                      hintText: 'e.g. Flutter Documentation',
                      border: OutlineInputBorder(borderRadius: AppRadii.lg),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: selectedCat,
                    decoration: InputDecoration(
                      labelText: 'Category',
                      border: OutlineInputBorder(borderRadius: AppRadii.lg),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    items: _categories.where((c) => c != 'all').map((cat) {
                      return DropdownMenuItem(
                        value: cat,
                        child: Text(_formatCategoryLabel(cat)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setDialogState(() => selectedCat = val);
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: descCtrl,
                    maxLines: 2,
                    decoration: InputDecoration(
                      labelText: 'Description (Optional)',
                      hintText: 'Key notes, formulas, or takeaways...',
                      border: OutlineInputBorder(borderRadius: AppRadii.lg),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary(context),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: AppRadii.md),
                ),
                onPressed: () async {
                  final url = urlCtrl.text.trim();
                  if (url.isEmpty) return;

                  final title = titleCtrl.text.trim().isNotEmpty ? titleCtrl.text.trim() : url;

                  Navigator.of(ctx).pop();
                  FeedbackService.instance.light();

                  await context.read<StudyProvider>().addResource(
                    url: url,
                    title: title,
                    description: descCtrl.text.trim(),
                    category: selectedCat,
                  );

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Resource saved to library'),
                        behavior: SnackBarBehavior.floating,
                      ),
                    );
                  }
                },
                child: const Text('Save Link'),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _openUrl(String rawUrl) async {
    FeedbackService.instance.selection();
    final cleanUrl = rawUrl.startsWith(RegExp(r'https?:\/\/', caseSensitive: false))
        ? rawUrl
        : 'https://$rawUrl';
    final uri = Uri.parse(cleanUrl);
    try {
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (e) {
      debugPrint('Error launching URL: $e');
      try {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      } catch (_) {}
    }
  }

  void _confirmDeleteResource(BuildContext context, WebsiteResource res) {
    AppDialog.show(
      context,
      title: 'Delete Resource',
      description: 'Are you sure you want to remove "${res.title}" from saved resources?',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmVariant: AppButtonVariant.danger,
      onConfirm: () async {
        FeedbackService.instance.medium();
        await context.read<StudyProvider>().deleteResource(res.id);
      },
    );
  }

  List<WebsiteResource> _filterResources(List<WebsiteResource> resources) {
    return resources.where((r) {
      if (_selectedCategory != 'all' && r.displayCategory != _selectedCategory) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchTitle = r.title.toLowerCase().contains(q);
        final matchDomain = r.domain.toLowerCase().contains(q);
        final matchDesc = (r.description ?? '').toLowerCase().contains(q);
        if (!matchTitle && !matchDomain && !matchDesc) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final studyProvider = context.watch<StudyProvider>();
    final resources = studyProvider.resources;
    final filtered = _filterResources(resources);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Saved Resources',
              style: AppTypography.headingMd.copyWith(fontWeight: FontWeight.w700),
            ),
            Text(
              '${resources.length} study links',
              style: AppTypography.caption.copyWith(color: AppColors.textMuted(context)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Refresh',
            onPressed: () => studyProvider.loadData(),
          ),
        ],
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton(
        tooltip: 'Add Link',
        backgroundColor: AppColors.primary(context),
        foregroundColor: Colors.white,
        onPressed: _showAddResourceDialog,
        child: const Icon(Icons.add_link_rounded, size: 24),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val.trim()),
                decoration: InputDecoration(
                  hintText: 'Search resources by title or domain...',
                  prefixIcon: Icon(Icons.search_rounded, size: 20, color: AppColors.textMuted(context)),
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
                    borderSide: BorderSide(color: AppColors.border(context)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: AppRadii.lg,
                    borderSide: BorderSide(color: AppColors.border(context)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: AppRadii.lg,
                    borderSide: BorderSide(color: AppColors.primary(context), width: 1.5),
                  ),
                ),
              ),
            ),

            // Category Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Row(
                children: _categories.map((cat) {
                  final isSelected = cat == _selectedCategory;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: AppChip(
                      label: _formatCategoryLabel(cat),
                      variant: isSelected ? AppChipTone.primary : AppChipTone.neutral,
                      onTap: () {
                        FeedbackService.instance.selection();
                        setState(() => _selectedCategory = cat);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),

            // Resources List
            Expanded(
              child: filtered.isEmpty
                  ? Center(
                      child: AppEmptyState(
                        icon: Icons.bookmark_border_rounded,
                        title: _searchQuery.isNotEmpty || _selectedCategory != 'all'
                            ? 'No matching resources'
                            : 'No saved resources yet',
                        message: _searchQuery.isNotEmpty || _selectedCategory != 'all'
                            ? 'Try a different search keyword or category filter.'
                            : 'Save documentation, textbooks, research portals, and cheat sheets.',
                        actionLabel: _searchQuery.isNotEmpty ? null : 'Add First Resource',
                        onAction: _searchQuery.isNotEmpty ? null : _showAddResourceDialog,
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (ctx, i) {
                        final res = filtered[i];
                        return _buildResourceRow(ctx, res, isDark);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResourceRow(BuildContext context, WebsiteResource res, bool isDark) {
    return Container(
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
          onTap: () => _openUrl(res.url),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Favicon / Icon Box
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 36,
                    height: 36,
                    color: AppColors.surfaceRaised(context),
                    child: res.faviconUrl != null && res.faviconUrl!.isNotEmpty
                        ? Image.network(
                            res.faviconUrl!,
                            width: 36,
                            height: 36,
                            fit: BoxFit.contain,
                            errorBuilder: (_, __, ___) => Icon(
                              Icons.language_rounded,
                              size: 20,
                              color: AppColors.primary(context),
                            ),
                          )
                        : Icon(
                            Icons.language_rounded,
                            size: 20,
                            color: AppColors.primary(context),
                          ),
                  ),
                ),
                const SizedBox(width: 12),

                // Info Column
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        res.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.bodySm.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary(context),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              res.domain,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: AppTypography.caption.copyWith(
                                fontSize: 11,
                                color: AppColors.primary(context),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '·  ${_formatCategoryLabel(res.displayCategory)}',
                            style: AppTypography.caption.copyWith(
                              fontSize: 11,
                              color: AppColors.textMuted(context),
                            ),
                          ),
                        ],
                      ),
                      if (res.description != null && res.description!.isNotEmpty) ...[
                        const SizedBox(height: 3),
                        Text(
                          res.description!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.caption.copyWith(
                            fontSize: 11,
                            color: AppColors.textMuted(context),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                // Actions Menu
                IconButton(
                  icon: Icon(
                    Icons.open_in_new_rounded,
                    size: 18,
                    color: AppColors.primary(context),
                  ),
                  tooltip: 'Open in Browser',
                  onPressed: () => _openUrl(res.url),
                ),
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert_rounded, size: 18, color: AppColors.textMuted(context)),
                  onSelected: (action) {
                    if (action == 'open') {
                      _openUrl(res.url);
                    } else if (action == 'delete') {
                      _confirmDeleteResource(context, res);
                    }
                  },
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(
                      value: 'open',
                      child: Row(
                        children: [
                          Icon(Icons.open_in_new_rounded, size: 16),
                          SizedBox(width: 8),
                          Text('Open in Browser', style: TextStyle(fontSize: 13)),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_outline_rounded, size: 16, color: AppColors.danger),
                          SizedBox(width: 8),
                          Text('Delete', style: TextStyle(color: AppColors.danger, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
