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
  List<Map<String, dynamic>> _uploadsHistory = [
    {
      'id': 'VID-2024-901',
      'title': 'Kitchen Cooking Sample',
      'env': 'Kitchen',
      'status': 'Approved',
      'date': 'Today, 10:30 AM',
      'size': '10.5 MB',
      'duration': '30:00 Mins',
    },
    {
      'id': 'VID-2024-902',
      'title': 'Bedroom Ambient Sample',
      'env': 'Bedroom',
      'status': 'Pending QC',
      'date': 'Today, 09:15 AM',
      'size': '15.2 MB',
      'duration': '24:18 Mins',
    },
    {
      'id': 'VID-2024-903',
      'title': 'Garden Outdoor Sample',
      'env': 'Garden',
      'status': 'Approved',
      'date': 'Yesterday, 04:45 PM',
      'size': '18.0 MB',
      'duration': '30:00 Mins',
    },
    {
      'id': 'VID-2024-904',
      'title': 'Bathroom Lighting Test',
      'env': 'Bathroom',
      'status': 'Rejected',
      'date': '2 days ago',
      'size': '8.4 MB',
      'duration': '12:00 Mins',
      'reason': 'Low lighting in frame',
    },
  ];

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
        title: const Text('My Uploads & Video Dispatch', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimaryLight,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
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
              // Top Action Card: Pick / Dispatch Video
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withAlpha(8), blurRadius: 12, offset: const Offset(0, 4)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: Color(0xFFEFF6FF),
                              child: Icon(Icons.cloud_upload_rounded, color: AppColors.primary),
                            ),
                            SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Dispatch Video File', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimaryLight)),
                                Text('Upload MP4 to REST API Server', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                              ],
                            ),
                          ],
                        ),
                        OutlinedButton.icon(
                          onPressed: _pickAndSelectFile,
                          icon: const Icon(Icons.add_photo_alternate_rounded, size: 18),
                          label: const Text('Select File'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primary,
                            side: const BorderSide(color: AppColors.primary),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    if (_activeVideoPath.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    'File: $_activeVideoPath',
                                    style: const TextStyle(fontSize: 12, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withAlpha(25),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    _activeEnvTag ?? 'Kitchen',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    if (_isUploading) ...[
                      Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Uploading MP4 Video to Backend API...', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                              Text('${(_uploadProgress * 100).toInt()}%', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: LinearProgressIndicator(
                              value: _uploadProgress,
                              minHeight: 8,
                              backgroundColor: AppColors.primary.withAlpha(30),
                              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                    ],

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isUploading ? null : _startUpload,
                        icon: const Icon(Icons.cloud_upload_rounded),
                        label: Text(
                          _activeVideoPath.isEmpty
                              ? 'Upload Default Dataset Video'
                              : (_uploadResult == null ? 'Upload Video to Backend' : 'Re-Upload Video'),
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

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
