import 'dart:async';
import 'dart:convert';
import 'dart:html' as html;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../services/device_service.dart';
import '../../services/upload_service.dart';
import '../../widgets/powered_by_footer.dart';

class VideoUploadScreen extends StatefulWidget {
  final String videoPath;
  final String? environmentTag;

  const VideoUploadScreen({
    super.key,
    this.videoPath = '',
    this.environmentTag,
  });

  @override
  State<VideoUploadScreen> createState() => _VideoUploadScreenState();
}

class _VideoUploadScreenState extends State<VideoUploadScreen> {
  bool _isUploading = false;
  double _uploadProgress = 0.0;
  UploadResult? _uploadResult;
  String _activeVideoPath = '';
  String? _activeEnvTag;
  int _fileSize = 10485760; // 10 MB default

  // History of Uploads
  List<Map<String, dynamic>> _uploadsHistory = [];

  @override
  void initState() {
    super.initState();
    _activeVideoPath = widget.videoPath;
    _activeEnvTag = widget.environmentTag ?? 'Kitchen';
    _loadStoredHistory();
    _subscribeRealtime();
  }

  void _subscribeRealtime() {
    if (kIsWeb) {
      try {
        final bc = html.BroadcastChannel('platform_realtime_channel');
        bc.onMessage.listen((event) {
          _loadStoredHistory();
        });
      } catch (_) {}
    }
  }

  void _loadStoredHistory() {
    if (kIsWeb) {
      try {
        final raw = html.window.localStorage['platform_qc_submissions'];
        if (raw != null) {
          final List<dynamic> list = jsonDecode(raw);
          if (list.isNotEmpty) {
            setState(() {
              _uploadsHistory = list.map((item) {
                return {
                  'id': item['id'] ?? 'VID-000',
                  'title': item['title'] ?? 'Uploaded Video',
                  'env': item['env'] ?? 'Kitchen',
                  'status': item['status'] == 'Pending' ? 'Pending QC' : (item['status'] ?? 'Approved'),
                  'date': item['time'] ?? 'Just Now',
                  'size': item['size'] ?? '10 MB',
                  'duration': item['duration'] ?? '30:00 Mins',
                  'reason': item['rejectionReason'] ?? '',
                };
              }).toList();
            });
          }
        }
      } catch (e) {
        debugPrint('Error loading uploads history: $e');
      }
    }
  }

  Future<void> _pickAndSelectFile() async {
    final mockName = 'gallery_recording_${DateTime.now().millisecondsSinceEpoch}.mp4';
    setState(() {
      _activeVideoPath = mockName;
      _activeEnvTag = _activeEnvTag ?? 'Kitchen';
      _uploadResult = null;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Selected video file: $mockName'),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _startUpload() async {
    if (_isUploading) return;

    setState(() {
      _isUploading = true;
      _uploadProgress = 0.0;
      _uploadResult = null;
    });

    Timer? progressTimer;
    progressTimer = Timer.periodic(const Duration(milliseconds: 100), (t) {
      if (mounted) {
        setState(() {
          _uploadProgress += 0.08;
          if (_uploadProgress >= 0.9) {
            progressTimer?.cancel();
          }
        });
      }
    });

    final deviceId = await DeviceService.instance.getDeviceId();

    final result = await UploadService.instance.uploadVideo(
      filePath: _activeVideoPath.isEmpty ? 'recorded_sample.mp4' : _activeVideoPath,
      environmentTag: _activeEnvTag,
      deviceId: deviceId,
    );

    progressTimer.cancel();

    if (mounted) {
      setState(() {
        _isUploading = false;
        _uploadProgress = result.isSuccess ? 1.0 : 0.0;
        _uploadResult = result;
      });

      if (result.isSuccess) {
        final newVideoId = result.videoId ?? 'VID-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

        // Add to history
        final newHistoryItem = {
          'id': newVideoId,
          'title': '${_activeEnvTag ?? "Recorded"} Dataset Sample',
          'env': _activeEnvTag ?? 'Kitchen',
          'status': 'Pending QC',
          'date': 'Just Now',
          'size': '10.0 MB',
          'duration': '30:00 Mins',
        };

        setState(() {
          _uploadsHistory.insert(0, newHistoryItem);
        });

        // Sync to Admin QC Review queue
        if (kIsWeb) {
          try {
            final raw = html.window.localStorage['platform_qc_submissions'];
            List<dynamic> list = [];
            if (raw != null) {
              list = jsonDecode(raw);
            }
            final newSub = {
              'id': newVideoId,
              'title': '${_activeEnvTag ?? "Recorded"} Dataset Sample',
              'candidateId': 'CAN-2024-001',
              'candidateName': 'Vasavi Kandula',
              'candidatePhone': '+91 98765 43210',
              'vendor': 'Acme Video Solutions',
              'duration': '30:00 Mins',
              'score': 94,
              'status': 'Pending',
              'env': _activeEnvTag ?? 'Kitchen',
              'time': 'Just Now',
              'size': '10.0 MB',
              'videoUrl': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              'rejectionReason': '',
            };
            list.insert(0, newSub);
            html.window.localStorage['platform_qc_submissions'] = jsonEncode(list);

            // Broadcast to all open tabs in real-time
            try {
              final bc = html.BroadcastChannel('platform_realtime_channel');
              bc.postMessage({'type': 'QC_STORE_UPDATED', 'payload': list});
              bc.close();
            } catch (_) {}
          } catch (e) {
            debugPrint('Error syncing QC submission: $e');
          }
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upload Complete! Video ID: $newVideoId (Sent to Admin QC)'),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'My Uploads & Video Dispatch',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Color(0xFF0F172A),
            fontSize: 18,
          ),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        elevation: 0.5,
        scrolledUnderElevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF2563EB)),
            onPressed: () {
              _loadStoredHistory();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Uploads list updated ✓'), duration: Duration(seconds: 1)),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Summary Stats Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(color: const Color(0xFF2563EB).withAlpha(60), blurRadius: 14, offset: const Offset(0, 4)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('DATASET UPLOADS SUMMARY', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 0.8)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Total Videos', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text('${_uploadsHistory.length}', style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('QC Approved', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text(
                              '${_uploadsHistory.where((i) => i['status'] == 'Approved').length}',
                              style: const TextStyle(color: Color(0xFF34D399), fontSize: 26, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Pending QC', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text(
                              '${_uploadsHistory.where((i) => i['status'] == 'Pending QC' || i['status'] == 'Pending').length}',
                              style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 26, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // All Uploads Section Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'All Uploaded Videos',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimaryLight),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(20),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${_uploadsHistory.length} Total',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // All Uploads List Cards
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _uploadsHistory.length,
                itemBuilder: (ctx, idx) {
                  final item = _uploadsHistory[idx];
                  final status = item['status'] as String;

                  Color statusColor = AppColors.success;
                  if (status == 'Pending QC' || status == 'Pending') {
                    statusColor = const Color(0xFFF59E0B);
                  } else if (status == 'Rejected') {
                    statusColor = AppColors.error;
                  }

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 8, offset: const Offset(0, 2)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundColor: statusColor.withAlpha(20),
                                  child: Icon(
                                    status == 'Approved'
                                        ? Icons.check_circle_rounded
                                        : (status == 'Rejected' ? Icons.cancel_rounded : Icons.hourglass_top_rounded),
                                    color: statusColor,
                                    size: 20,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item['title'] as String,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textPrimaryLight),
                                    ),
                                    Text(
                                      'ID: ${item['id']}',
                                      style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: AppColors.textSecondaryLight),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: statusColor.withAlpha(20),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                status,
                                style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.calendar_today_rounded, size: 14, color: Colors.grey),
                                const SizedBox(width: 4),
                                Text(item['date'] as String, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                              ],
                            ),
                            Row(
                              children: [
                                const Icon(Icons.timer_rounded, size: 14, color: Colors.grey),
                                const SizedBox(width: 4),
                                Text(item['duration'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                const SizedBox(width: 12),
                                const Icon(Icons.sd_card_rounded, size: 14, color: Colors.grey),
                                const SizedBox(width: 4),
                                Text(item['size'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ],
                        ),
                        if (status == 'Rejected' && (item['reason'] as String).isNotEmpty) ...[
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.error.withAlpha(15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.info_outline_rounded, size: 16, color: AppColors.error),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    'Rejection Reason: ${item['reason']}',
                                    style: const TextStyle(fontSize: 12, color: AppColors.error, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),
              const PoweredByFooter(),
            ],
          ),
        ),
      ),
    );
  }
}
