import 'dart:io';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../services/upload_service.dart';

class VideoUploadScreen extends StatefulWidget {
  final String videoPath;
  final String? environmentTag;

  const VideoUploadScreen({
    super.key,
    required this.videoPath,
    this.environmentTag,
  });

  @override
  State<VideoUploadScreen> createState() => _VideoUploadScreenState();
}

class _VideoUploadScreenState extends State<VideoUploadScreen> {
  bool _isUploading = false;
  double _uploadProgress = 0.0;
  UploadResult? _uploadResult;
  int _fileSize = 0;

  @override
  void initState() {
    super.initState();
    _checkFileStats();
  }

  Future<void> _checkFileStats() async {
    final file = File(widget.videoPath);
    if (await file.exists()) {
      final len = await file.length();
      if (mounted) {
        setState(() {
          _fileSize = len;
        });
      }
    }
  }

  Future<void> _startUpload() async {
    setState(() {
      _isUploading = true;
      _uploadProgress = 0.1;
      _uploadResult = null;
    });

    // Simulate progress updates for visual feedback
    final progressTimer = Stream.periodic(const Duration(milliseconds: 300), (i) => (i + 2) * 0.1)
        .listen((p) {
      if (_isUploading && p < 0.9) {
        setState(() => _uploadProgress = p);
      }
    });

    final result = await UploadService.instance.uploadVideo(
      filePath: widget.videoPath,
      environmentTag: widget.environmentTag,
    );

    progressTimer.cancel();

    if (mounted) {
      setState(() {
        _isUploading = false;
        _uploadProgress = result.isSuccess ? 1.0 : 0.0;
        _uploadResult = result;
      });

      if (result.isSuccess) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upload Complete! Video ID: ${result.videoId}'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.message ?? 'Upload failed'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  String _formatFileSize(int bytes) {
    if (bytes <= 0) return '0 B';
    final kb = bytes / 1024;
    if (kb < 1024) return '${kb.toStringAsFixed(1)} KB';
    final mb = kb / 1024;
    return '${mb.toStringAsFixed(2)} MB';
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Video to Backend'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Video File Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: isDarkMode ? AppColors.surfaceDark : AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDarkMode ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(10),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.video_file_rounded, color: AppColors.primary, size: 28),
                            SizedBox(width: 12),
                            Text(
                              'Selected Local Video',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'File Path:',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isDarkMode ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.videoPath,
                          style: const TextStyle(
                            fontSize: 12,
                            fontFamily: 'monospace',
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'File Size: ${_formatFileSize(_fileSize)}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                            if (widget.environmentTag != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withAlpha(30),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  widget.environmentTag!,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Upload Progress Indicator
                  if (_isUploading) ...[
                    Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Uploading Video to Local Backend...',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              '${(_uploadProgress * 100).toInt()}%',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: LinearProgressIndicator(
                            value: _uploadProgress,
                            minHeight: 10,
                            backgroundColor: AppColors.primary.withAlpha(40),
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                  ],

                  // Upload Result Status Card
                  if (_uploadResult != null) _buildResultCard(isDarkMode),

                  // Action Buttons
                  if (!_isUploading) ...[
                    ElevatedButton.icon(
                      onPressed: _startUpload,
                      icon: const Icon(Icons.cloud_upload_rounded),
                      label: Text(_uploadResult == null ? 'Upload Video to Backend' : 'Re-upload Video'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResultCard(bool isDarkMode) {
    final result = _uploadResult!;
    final isSuccess = result.isSuccess;

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isSuccess ? AppColors.success.withAlpha(25) : AppColors.error.withAlpha(25),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSuccess ? AppColors.success.withAlpha(100) : AppColors.error.withAlpha(100),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isSuccess ? Icons.check_circle_rounded : Icons.error_rounded,
                color: isSuccess ? AppColors.success : AppColors.error,
                size: 24,
              ),
              const SizedBox(width: 10),
              Text(
                isSuccess ? 'Upload Successful!' : 'Upload Failed',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isSuccess ? AppColors.success : AppColors.error,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            result.message ?? '',
            style: const TextStyle(fontSize: 13, height: 1.4),
          ),
          if (isSuccess && result.videoId != null) ...[
            const Divider(height: 20),
            Row(
              children: [
                const Text(
                  'Saved Video ID: ',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
                Expanded(
                  child: Text(
                    result.videoId!,
                    style: const TextStyle(
                      fontSize: 13,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
