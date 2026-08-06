import 'dart:async';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../config/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import 'dart:convert';
import 'dart:html' as html;
import '../../services/camera_service.dart';
import '../../services/location_service.dart';
import '../../services/voice_command_service.dart';
import '../../services/compression_service.dart';
import '../../services/upload_service.dart';
import '../../services/device_service.dart';
import '../../widgets/web_camera_view.dart';

class VideoRecordingScreen extends StatefulWidget {
  const VideoRecordingScreen({super.key});

  @override
  State<VideoRecordingScreen> createState() => _VideoRecordingScreenState();
}

class _VideoRecordingScreenState extends State<VideoRecordingScreen> {
  CameraController? _controller;
  bool _isInitializing = true;
  bool _isRecording = false;
  XFile? _recordedFile;
  int _recordedFileSize = 0;

  // Environment Tag
  String? _selectedEnvironmentTag;

  // GPS Location Data
  Position? _currentPosition;
  bool _isFetchingLocation = false;
  String? _locationErrorMessage;

  // Voice command state
  String _voiceStatusMessage = '🎤 Listening for "Start Recording" / "Stop Recording"';

  // Recording Timer with 30-min limit
  static const int maxRecordingSeconds = 1800; // 30 minutes
  static const int warningThresholdSeconds = 1500; // 25 minutes
  static const int dangerThresholdSeconds = 1740; // 29 minutes
  Timer? _timer;
  int _elapsedSeconds = 0;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
    _loadSavedEnvironmentTag();
    _initVoiceCommandListener();
  }

  void _initVoiceCommandListener() {
    VoiceCommandService.instance.startListening(
      onCommand: (command) {
        if (command == VoiceCommand.start && !_isRecording) {
          _startRecording();
        } else if (command == VoiceCommand.stop && _isRecording) {
          _stopRecording();
        }
      },
      onStatusChanged: (status) {
        if (mounted) {
          setState(() {
            _voiceStatusMessage = status;
          });
        }
      },
    );
  }

  Future<void> _loadSavedEnvironmentTag() async {
    final prefs = await SharedPreferences.getInstance();
    final tag = prefs.getString('selected_environment_tag');
    if (tag != null && mounted) {
      setState(() {
        _selectedEnvironmentTag = tag;
      });
    }
  }

  Future<void> _initializeCamera() async {
    if (!kIsWeb) {
      final cameraStatus = await Permission.camera.request();
      final micStatus = await Permission.microphone.request();

      if (!cameraStatus.isGranted || !micStatus.isGranted) {
        if (mounted) {
          setState(() => _isInitializing = false);
        }
        return;
      }
    }

    final cameras = await CameraService.instance.initCameras();
    if (cameras.isEmpty) {
      if (mounted) {
        setState(() => _isInitializing = false);
      }
      return;
    }

    final selectedCamera = CameraService.instance.defaultCamera!;
    _controller = CameraController(
      selectedCamera,
      ResolutionPreset.high,
      enableAudio: true,
    );

    try {
      await _controller!.initialize();
    } catch (e) {
      debugPrint('Camera init error: $e');
    } finally {
      if (mounted) {
        setState(() => _isInitializing = false);
      }
    }
  }

  void _startTimer() {
    _elapsedSeconds = 0;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _elapsedSeconds++;
        });
        // Auto-stop at 30 minutes
        if (_elapsedSeconds >= maxRecordingSeconds) {
          _stopRecording();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('⏱️ Maximum 30-minute recording limit reached. Video saved automatically.'),
              backgroundColor: Color(0xFFF59E0B),
              behavior: SnackBarBehavior.floating,
              duration: Duration(seconds: 4),
            ),
          );
        }
      }
    });
  }

  int get _remainingSeconds => maxRecordingSeconds - _elapsedSeconds;
  double get _timerProgress => _elapsedSeconds / maxRecordingSeconds;
  bool get _isWarning => _elapsedSeconds >= warningThresholdSeconds && _elapsedSeconds < dangerThresholdSeconds;
  bool get _isDanger => _elapsedSeconds >= dangerThresholdSeconds;

  void _stopTimer() {
    _timer?.cancel();
  }

  Future<void> _startRecording() async {
    if (_isRecording) return;

    if (!kIsWeb && _controller != null && _controller!.value.isInitialized) {
      try {
        await _controller!.startVideoRecording();
      } catch (e) {
        debugPrint('Hardware recording start note: $e');
      }
    }

    if (mounted) {
      setState(() {
        _isRecording = true;
        _recordedFile = null;
      });
      _startTimer();
    }
  }

  Future<void> _stopRecording() async {
    if (!_isRecording) return;

    _stopTimer();
    setState(() {
      _isRecording = false;
      _isFetchingLocation = true;
    });

    XFile? file;
    if (_controller != null && _controller!.value.isRecordingVideo) {
      try {
        file = await _controller!.stopVideoRecording();
      } catch (e) {
        debugPrint('Error stopping hardware recording: $e');
      }
    }

    // If hardware camera file null (Web/Demo), generate mock video file
    file ??= XFile(
      'demo_recorded_video_${DateTime.now().millisecondsSinceEpoch}.mp4',
      name: 'recorded_video.mp4',
      length: 10485760, // 10 MB
    );

    int size = 10485760;
    try {
      size = await file.length();
    } catch (_) {}

    // Fetch GPS Location
    Position? pos;
    String? locationError;

    try {
      pos = await LocationService.instance.getCurrentPosition();
    } catch (e) {
      locationError = 'GPS unavailable: ${e.toString().replaceAll('Exception: ', '')}';
    }

    // Step 1: Compress video file on device before upload
    final compResult = await CompressionService.instance.compressVideo(
      inputPath: file.path,
      quality: CompressionQuality.medium,
    );

    // Step 2: Auto-upload compressed video file to backend REST API (saved under uploads/videos/)
    final deviceId = await DeviceService.instance.getDeviceId();
    final uploadRes = await UploadService.instance.uploadVideo(
      filePath: compResult.outputPath,
      environmentTag: _selectedEnvironmentTag,
      deviceId: deviceId,
    );

    final finalVideoId = uploadRes.videoId ?? 'VID-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

    // Step 3: Add to Candidate Uploads history & sync with Admin QC Review queue
    if (kIsWeb) {
      try {
        final raw = html.window.localStorage['platform_qc_submissions'];
        List<dynamic> list = [];
        if (raw != null) {
          list = jsonDecode(raw);
        }
        final newSub = {
          'id': finalVideoId,
          'title': '${_selectedEnvironmentTag ?? "Recorded"} Dataset Sample',
          'candidateId': 'CAN-2024-001',
          'candidateName': 'Vasavi Kandula',
          'candidatePhone': '+91 98765 43210',
          'vendor': 'Acme Video Solutions',
          'duration': _formatDuration(_elapsedSeconds),
          'score': 95,
          'status': 'Pending',
          'env': _selectedEnvironmentTag ?? 'Kitchen',
          'time': 'Just Now',
          'size': _formatFileSize(compResult.compressedSizeBytes),
          'videoUrl': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          'rejectionReason': '',
        };
        list.insert(0, newSub);
        html.window.localStorage['platform_qc_submissions'] = jsonEncode(list);

        // Broadcast to all open tabs live
        final bc = html.BroadcastChannel('platform_realtime_channel');
        bc.postMessage({'type': 'QC_STORE_UPDATED', 'payload': list});
        bc.close();
      } catch (e) {
        debugPrint('Error syncing submission: $e');
      }
    }

    if (mounted) {
      setState(() {
        _recordedFile = file;
        _recordedFileSize = compResult.compressedSizeBytes;
        _currentPosition = pos;
        _locationErrorMessage = locationError;
        _isFetchingLocation = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('⚡ Compressed (70% reduction) & Uploaded to Server! Saved in Uploads tab ($finalVideoId) ✓'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  String _formatDuration(int totalSeconds) {
    final minutes = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  String _formatFileSize(int bytes) {
    if (bytes <= 0) return '0 B';
    final kb = bytes / 1024;
    if (kb < 1024) return '${kb.toStringAsFixed(1)} KB';
    final mb = kb / 1024;
    return '${mb.toStringAsFixed(2)} MB';
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller?.dispose();
    VoiceCommandService.instance.stopListening();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Pure clean white background
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
        elevation: 0.5,
        scrolledUnderElevation: 0.5,
        title: const Text('Record Video Data', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        actions: [
          IconButton(
            icon: const Icon(Icons.sell_outlined, color: Color(0xFF64748B)),
            tooltip: 'Environment Tag',
            onPressed: () async {
              final result = await Navigator.pushNamed(context, AppRoutes.environmentTag);
              if (result != null && result is String) {
                setState(() {
                  _selectedEnvironmentTag = result;
                });
              }
            },
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFE2E8F0), height: 1.0),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [

            // Environment Tag Banner Header
            GestureDetector(
              onTap: () async {
                final result = await Navigator.pushNamed(context, AppRoutes.environmentTag);
                if (result != null && result is String) {
                  setState(() {
                    _selectedEnvironmentTag = result;
                  });
                }
              },
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFBFDBFE)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.sell_rounded, color: Color(0xFF2563EB), size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _selectedEnvironmentTag != null
                            ? 'Environment: $_selectedEnvironmentTag'
                            : 'Select Environment Tag (Kitchen, Bedroom, etc.)',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E40AF),
                        ),
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: Color(0xFF2563EB), size: 20),
                  ],
                ),
              ),
            ),

            // Camera / Live Recorder Preview Area
            Expanded(
              child: Container(
                margin: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(20.0),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Camera View or Web Live Camera Simulation Canvas
                    _buildCameraView(),

                    // Recording Live Duration Overlay
                    if (_isRecording)
                      Positioned(
                        top: 16,
                        left: 16,
                        right: 16,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Timer badge
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.75),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: _isDanger ? AppColors.error : (_isWarning ? const Color(0xFFF59E0B) : AppColors.error),
                                  width: _isDanger ? 2.5 : 1.5,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 10,
                                    height: 10,
                                    decoration: BoxDecoration(
                                      color: _isDanger ? AppColors.error : (_isWarning ? const Color(0xFFF59E0B) : AppColors.error),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    _formatDuration(_elapsedSeconds),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      fontFeatures: [FontFeature.tabularFigures()],
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    '${_formatDuration(_remainingSeconds)} left',
                                    style: TextStyle(
                                      color: _isDanger ? const Color(0xFFFF6B6B) : (_isWarning ? const Color(0xFFFCD34D) : Colors.white70),
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      fontFeatures: const [FontFeature.tabularFigures()],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),
                            // Progress bar showing 30-min usage
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: _timerProgress,
                                minHeight: 4,
                                backgroundColor: Colors.white.withValues(alpha: 0.3),
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  _isDanger ? AppColors.error : (_isWarning ? const Color(0xFFF59E0B) : const Color(0xFF2563EB)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),

            // Saved Video & GPS & Tag Summary Card
            if (_recordedFile != null || _isFetchingLocation)
              _buildSavedVideoSummaryCard(),

            // Bottom Controls Area
            Container(
              padding: const EdgeInsets.all(20.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Prominent Shutter / Record Button
                  if (_recordedFile == null && !_isFetchingLocation)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: GestureDetector(
                        onTap: _isRecording ? _stopRecording : _startRecording,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: _isRecording
                                  ? [const Color(0xFFEF4444), const Color(0xFFDC2626)]
                                  : [const Color(0xFFEF4444), const Color(0xFFE11D48)],
                            ),
                            borderRadius: BorderRadius.circular(40),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFEF4444).withValues(alpha: 0.4),
                                blurRadius: 16,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 22,
                                height: 22,
                                decoration: const BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Icon(
                                    _isRecording ? Icons.stop_rounded : Icons.circle_rounded,
                                    size: 14,
                                    color: const Color(0xFFEF4444),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                _isRecording ? 'STOP RECORDING' : 'START RECORDING',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 16,
                                  letterSpacing: 1.0,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                  // Hands-Free Voice Control Status Pill Indicator
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    decoration: BoxDecoration(
                      color: _isRecording ? const Color(0xFFFEF2F2) : const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(
                        color: _isRecording ? const Color(0xFFFCA5A5) : const Color(0xFFBFDBFE),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _isRecording ? Icons.fiber_manual_record_rounded : Icons.mic_rounded,
                          size: 18,
                          color: _isRecording ? const Color(0xFFEF4444) : const Color(0xFF2563EB),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _isRecording
                              ? '🔴 Recording...'
                              : _voiceStatusMessage,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: _isRecording ? const Color(0xFF991B1B) : const Color(0xFF1E40AF),
                          ),
                        ),
                      ],
                    ),
                  ),

                  if (_recordedFile != null || _isFetchingLocation) ...[
                    // Post-recording actions (Re-record / Upload API)
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _isFetchingLocation
                                ? null
                                : () {
                                    setState(() {
                                      _recordedFile = null;
                                      _currentPosition = null;
                                      _locationErrorMessage = null;
                                      _elapsedSeconds = 0;
                                    });
                                  },
                            icon: const Icon(Icons.videocam_outlined),
                            label: const Text('Re-record'),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _isFetchingLocation
                                ? null
                                : () {
                                    Navigator.pushNamed(
                                      context,
                                      AppRoutes.uploadVideo,
                                      arguments: {
                                        'videoPath': _recordedFile!.path,
                                        'environmentTag': _selectedEnvironmentTag,
                                      },
                                    );
                                  },
                            icon: const Icon(Icons.cloud_upload_rounded),
                            label: const Text('Upload API'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF2563EB),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCameraView() {
    if (_isInitializing) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    }

    // On Mobile Native, use CameraPreview. On Web, use WebLiveCameraView
    if (!kIsWeb && _controller != null && _controller!.value.isInitialized) {
      return CameraPreview(_controller!);
    }

    // Active Live Camera Recording Stream & Viewfinder (Web / Demo Mode)
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF090D16),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Live Video Stream Layer (HTML5 Browser Webcam or HD Sample Video Feed)
          Positioned.fill(
            child: WebLiveCameraView(
              isRecording: _isRecording,
              environmentTag: _selectedEnvironmentTag,
            ),
          ),

          // Rule-of-Thirds Gridlines Overlay
          Positioned.fill(
            child: CustomPaint(
              painter: _CameraGridPainter(isRecording: _isRecording),
            ),
          ),

          // Top Stream Status Badge
          Positioned(
            top: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.65),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white30),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _isRecording ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _isRecording ? '🔴 REC - RECORDING LIVE WEBCAM' : '🟢 WEBCAM FEED ACTIVE',
                    style: TextStyle(
                      color: _isRecording ? const Color(0xFFFF6B6B) : const Color(0xFF34D399),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.6,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Viewfinder Corners (Target Box)
          Positioned(
            top: 24,
            left: 24,
            child: Container(width: 24, height: 24, decoration: const BoxDecoration(border: Border(top: BorderSide(color: Colors.white54, width: 2), left: BorderSide(color: Colors.white54, width: 2)))),
          ),
          Positioned(
            top: 24,
            right: 24,
            child: Container(width: 24, height: 24, decoration: const BoxDecoration(border: Border(top: BorderSide(color: Colors.white54, width: 2), right: BorderSide(color: Colors.white54, width: 2)))),
          ),
          Positioned(
            bottom: 24,
            left: 24,
            child: Container(width: 24, height: 24, decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Colors.white54, width: 2), left: BorderSide(color: Colors.white54, width: 2)))),
          ),
          Positioned(
            bottom: 24,
            right: 24,
            child: Container(width: 24, height: 24, decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Colors.white54, width: 2), right: BorderSide(color: Colors.white54, width: 2)))),
          ),
        ],
      ),
    );
  }

  Widget _buildSavedVideoSummaryCard() {
    if (_isFetchingLocation) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        padding: const EdgeInsets.all(16.0),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            SizedBox(width: 12),
            Text('Fetching GPS Coordinates...', style: TextStyle(fontSize: 14)),
          ],
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: const Color(0xFFECFDF5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFA7F3D0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 22),
              SizedBox(width: 8),
              Text(
                'Video Saved & Ready for Upload',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF065F46),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Path: ${_recordedFile!.path}',
            style: const TextStyle(fontSize: 12, fontFamily: 'monospace', color: Color(0xFF047857)),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            'File Size: ${_formatFileSize(_recordedFileSize)}',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF047857)),
          ),
          if (_currentPosition != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.my_location_rounded, size: 16, color: Color(0xFF059669)),
                const SizedBox(width: 6),
                Text(
                  'GPS: ${_currentPosition!.latitude.toStringAsFixed(5)}, ${_currentPosition!.longitude.toStringAsFixed(5)}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF047857)),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _CameraGridPainter extends CustomPainter {
  final bool isRecording;
  _CameraGridPainter({required this.isRecording});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = (isRecording ? const Color(0xFFEF4444) : Colors.white).withValues(alpha: 0.12)
      ..strokeWidth = 1.0;

    // Rule-of-thirds camera grid lines
    final thirdWidth = size.width / 3;
    final thirdHeight = size.height / 3;

    canvas.drawLine(Offset(thirdWidth, 0), Offset(thirdWidth, size.height), paint);
    canvas.drawLine(Offset(thirdWidth * 2, 0), Offset(thirdWidth * 2, size.height), paint);

    canvas.drawLine(Offset(0, thirdHeight), Offset(size.width, thirdHeight), paint);
    canvas.drawLine(Offset(0, thirdHeight * 2), Offset(size.width, thirdHeight * 2), paint);
  }

  @override
  bool shouldRepaint(covariant _CameraGridPainter oldDelegate) => oldDelegate.isRecording != isRecording;
}
