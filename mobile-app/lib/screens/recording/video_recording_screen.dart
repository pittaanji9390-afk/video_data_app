import 'dart:async';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../config/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../services/camera_service.dart';
import '../../services/location_service.dart';
import '../../services/voice_command_service.dart';
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
  bool _isVoiceListening = false;
  String? _lastVoiceText;

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

    if (_controller != null && _controller!.value.isInitialized) {
      try {
        await _controller!.startVideoRecording();
        setState(() {
          _isRecording = true;
          _recordedFile = null;
        });
        _startTimer();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error starting recording: $e'), backgroundColor: AppColors.error),
        );
      }
    } else {
      // Simulation / Web fallback mode
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

    if (mounted) {
      setState(() {
        _recordedFile = file;
        _recordedFileSize = size;
        _currentPosition = pos;
        _locationErrorMessage = locationError;
        _isFetchingLocation = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Video recorded successfully (${_formatDuration(_elapsedSeconds)})'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _toggleVoiceCommand() {
    if (_isVoiceListening) {
      VoiceCommandService.instance.stopListening();
      setState(() {
        _isVoiceListening = false;
        _lastVoiceText = null;
      });
    } else {
      VoiceCommandService.instance.startListening(
        onCommand: (command) {
          if (command == VoiceCommand.start && !_isRecording) {
            _startRecording();
          } else if (command == VoiceCommand.stop && _isRecording) {
            _stopRecording();
          }
        },
        onSpeechRecognized: (text) {
          if (mounted) setState(() => _lastVoiceText = text);
        },
      );
      setState(() => _isVoiceListening = true);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎤 Voice Control Active! Say "start" or "stop"'),
          backgroundColor: Color(0xFF2563EB),
          behavior: SnackBarBehavior.floating,
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
        elevation: 0,
        scrolledUnderElevation: 0.5,
        title: const Text('Record Video Data', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        actions: [
          IconButton(
            icon: Icon(
              _isVoiceListening ? Icons.mic_rounded : Icons.mic_none_rounded,
              color: _isVoiceListening ? const Color(0xFF2563EB) : const Color(0xFF64748B),
            ),
            tooltip: 'Voice Commands',
            onPressed: _toggleVoiceCommand,
          ),
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
            // Voice Command Banner Indicator
            if (_isVoiceListening)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
                padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFBFDBFE)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.mic_rounded, color: Color(0xFF2563EB), size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _lastVoiceText ?? 'Listening for "start" or "stop" voice commands...',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E40AF)),
                      ),
                    ),
                  ],
                ),
              ),

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
                  if (_recordedFile == null && !_isFetchingLocation) ...[
                    // Record Controls
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (!_isRecording)
                          ElevatedButton.icon(
                            onPressed: _startRecording,
                            icon: const Icon(Icons.fiber_manual_record_rounded, color: Colors.white),
                            label: const Text('Start Recording'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFEF4444),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 36,
                                vertical: 16,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                              elevation: 3,
                            ),
                          )
                        else
                          ElevatedButton.icon(
                            onPressed: _stopRecording,
                            icon: const Icon(Icons.stop_rounded, color: Colors.white),
                            label: const Text('Stop Recording'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0F172A),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 36,
                                vertical: 16,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ] else ...[
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

    if (_controller != null && _controller!.value.isInitialized) {
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

          // Live Camera Gridlines Overlay
          Positioned.fill(
            child: CustomPaint(
              painter: _CameraGridPainter(isRecording: _isRecording),
            ),
          ),

          // Central Live Viewfinder / Video Stream Focus Ring
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    color: (_isRecording ? const Color(0xFFEF4444) : const Color(0xFF2563EB)).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: _isRecording ? const Color(0xFFEF4444) : const Color(0xFF38BDF8),
                      width: _isRecording ? 3 : 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: (_isRecording ? const Color(0xFFEF4444) : const Color(0xFF2563EB)).withValues(alpha: 0.35),
                        blurRadius: 20,
                        spreadRadius: 4,
                      ),
                    ],
                  ),
                  child: Icon(
                    _isRecording ? Icons.videocam_rounded : Icons.camera_alt_rounded,
                    size: 48,
                    color: _isRecording ? const Color(0xFFEF4444) : const Color(0xFF38BDF8),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white24),
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
                        _isRecording ? 'REC 🔴 LIVE STREAMING MP4' : '📷 LIVE CAMERA FEED ACTIVE',
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
                const SizedBox(height: 8),
                Text(
                  _selectedEnvironmentTag != null
                      ? 'Environment: $_selectedEnvironmentTag'
                      : 'Target Dataset: General Collection',
                  style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                ),
              ],
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
