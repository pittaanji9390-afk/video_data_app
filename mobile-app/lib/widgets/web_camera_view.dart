import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

// Conditional import for web HTML element view
import 'dart:ui_web' as ui_web;
import 'dart:html' as html;

class WebLiveCameraView extends StatefulWidget {
  final bool isRecording;
  final String? environmentTag;

  const WebLiveCameraView({
    super.key,
    required this.isRecording,
    this.environmentTag,
  });

  @override
  State<WebLiveCameraView> createState() => _WebLiveCameraViewState();
}

class _WebLiveCameraViewState extends State<WebLiveCameraView> {
  static bool _registered = false;
  static const String _viewTypeId = 'web-live-camera-stream-view';

  @override
  void initState() {
    super.initState();
    if (kIsWeb && !_registered) {
      _registered = true;
      ui_web.platformViewRegistry.registerViewFactory(_viewTypeId, (int viewId) {
        final videoElement = html.VideoElement()
          ..style.width = '100%'
          ..style.height = '100%'
          ..style.objectFit = 'cover'
          ..autoplay = true
          ..muted = true
          ..loop = true
          ..src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

        // Try getting live browser webcam media stream
        try {
          html.window.navigator.mediaDevices?.getUserMedia({'video': true, 'audio': false}).then((stream) {
            videoElement.srcObject = stream;
            videoElement.play();
          }).catchError((err) {
            debugPrint('Webcam fallback to live video stream: $err');
          });
        } catch (e) {
          debugPrint('MediaDevices error: $e');
        }

        return videoElement;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      return Stack(
        fit: StackFit.expand,
        children: [
          const HtmlElementView(viewType: _viewTypeId),
          // Gradient Vignette Overlay for camera viewfinder
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.black.withValues(alpha: 0.4),
                  Colors.transparent,
                  Colors.black.withValues(alpha: 0.5),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ],
      );
    }

    return Container(
      color: Colors.black,
      child: const Center(
        child: Icon(Icons.videocam_rounded, size: 64, color: Colors.white54),
      ),
    );
  }
}
