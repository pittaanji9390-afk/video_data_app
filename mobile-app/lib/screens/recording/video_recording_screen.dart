import 'dart:async';
import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../core/theme/app_colors.dart';
import '../../services/camera_service.dart';
import '../../services/location_service.dart';

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

  // GPS Location Data
  Position? _currentPosition;
  bool _isFetchingLocation = false;
  String? _locationErrorMessage;

  // Recording Timer
  Timer? _timer;
  int _elapsedSeconds = 0;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    final cameraStatus = await Permission.camera.request();
    final micStatus = await Permission.microphone.request();

    if (!cameraStatus.isGranted || !micStatus.isGranted) {
      if (mounted) {
        setState(() => _isInitializing = false);
      }
      return;
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
      // Handle camera initialization error gracefully
    }

    if (mounted) {
      setState(() => _isInitializing = false);
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
      }
    });
  }

  void _stopTimer() {
    _timer?.cancel();
  }

  Future<void> _startRecording() async {
    if (_controller == null || !_controller!.value.isInitialized) return;
    if (_controller!.value.isRecordingVideo) return;

    try {
      await _controller!.startVideoRecording();
      _startTimer();
      setState(() {
        _isRecording = true;
        _recordedFile = null;
        _currentPosition = null;
        _locationErrorMessage = null;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to start recording: $e')),
        );
      }
    }
  }

  Future<void> _stopRecording() async {
    if (_controller == null || !_controller!.value.isRecordingVideo) return;

    try {
      _stopTimer();
      setState(() => _isFetchingLocation = true);

      final file = await _controller!.stopVideoRecording();
      final fileSize = await File(file.path).length();

      // Capture GPS Location
      final position = await LocationService.instance.getCurrentPosition();

      setState(() {
        _isRecording = false;
        _recordedFile = file;
        _recordedFileSize = fileSize;
        _currentPosition = position;
        _isFetchingLocation = false;
        if (position == null) {
          _locationErrorMessage = 'GPS Location Permission Denied or Disabled';
        }
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Video recording & GPS coordinates saved locally!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      setState(() => _isFetchingLocation = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to stop recording: $e')),
        );
      }
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
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Record Video Data'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Top Camera / Preview Area
            Expanded(
              child: Container(
                margin: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(20.0),
                ),
                clipBehavior: Clip.antiAlias,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Camera Preview or Fallback Placeholder
                    _buildCameraView(),

                    // Recording Live Duration Overlay
                    if (_isRecording)
                      Positioned(
                        top: 20,
                        left: 20,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withAlpha(160),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: AppColors.error,
                              width: 1.5,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: const BoxDecoration(
                                  color: AppColors.error,
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
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),

            // Saved Video & GPS Location Summary Card
            if (_recordedFile != null || _isFetchingLocation)
              _buildSavedVideoSummaryCard(isDarkMode),

            // Bottom Controls Area
            Container(
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: isDarkMode
                    ? AppColors.surfaceDark
                    : AppColors.surfaceLight,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(15),
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
                              backgroundColor: AppColors.error,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 32,
                                vertical: 16,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                            ),
                          )
                        else
                          ElevatedButton.icon(
                            onPressed: _stopRecording,
                            icon: const Icon(Icons.stop_rounded, color: Colors.white),
                            label: const Text('Stop Recording'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.textPrimaryLight,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 32,
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
                    // Re-record Action
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
                            label: const Text('Record Another Video'),
                            style: OutlinedButton.styleFrom(
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

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.videocam_outlined, size: 64, color: Colors.white54),
            SizedBox(height: 16),
            Text(
              'Camera Preview Unavailable\n(Running on Simulator or Unsupported Device)',
              style: TextStyle(color: Colors.white70, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSavedVideoSummaryCard(bool isDarkMode) {
    if (_isFetchingLocation) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
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
        color: AppColors.success.withAlpha(25),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.success.withAlpha(100)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.check_circle_rounded, color: AppColors.success, size: 22),
              SizedBox(width: 8),
              Text(
                'Video Saved Locally',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Path: ${_recordedFile!.path}',
            style: TextStyle(
              fontSize: 12,
              fontFamily: 'monospace',
              color: isDarkMode ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Duration: ${_formatDuration(_elapsedSeconds)}',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
              Text(
                'Size: ${_formatFileSize(_recordedFileSize)}',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const Divider(height: 20),

          // GPS Coordinates Section
          Row(
            children: [
              const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 18),
              const SizedBox(width: 6),
              const Text(
                'GPS Coordinates:',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _currentPosition != null
                    ? Text(
                        'Lat: ${_currentPosition!.latitude.toStringAsFixed(6)}, Long: ${_currentPosition!.longitude.toStringAsFixed(6)}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      )
                    : Text(
                        _locationErrorMessage ?? 'GPS Permission Denied',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: AppColors.warning,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
