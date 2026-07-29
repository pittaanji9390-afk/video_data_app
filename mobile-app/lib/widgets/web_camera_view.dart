import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
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
  static const String _viewTypeId = 'web-camera-player-view';

  @override
  void initState() {
    super.initState();
    if (kIsWeb && !_registered) {
      _registered = true;
      ui_web.platformViewRegistry.registerViewFactory(_viewTypeId, (int viewId) {
        final container = html.DivElement()
          ..style.width = '100%'
          ..style.height = '100%'
          ..style.position = 'relative'
          ..style.backgroundColor = '#0f172a'
          ..style.overflow = 'hidden';

        final videoElement = html.VideoElement()
          ..style.width = '100%'
          ..style.height = '100%'
          ..style.objectFit = 'cover'
          ..autoplay = true
          ..muted = true
          ..loop = true
          ..src = 'https://assets.mixkit.co/videos/preview/mixkit-kitchen-counter-with-food-4094-large.mp4';

        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('muted', 'true');
        videoElement.setAttribute('autoplay', 'true');

        container.append(videoElement);

        // Try getting live browser webcam media stream
        try {
          html.window.navigator.mediaDevices?.getUserMedia({'video': true, 'audio': false}).then((stream) {
            videoElement.srcObject = stream;
            videoElement.play();
          }).catchError((err) {
            debugPrint('Webcam fallback stream active: $err');
            videoElement.play();
          });
        } catch (e) {
          debugPrint('MediaDevices error: $e');
        }

        return container;
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
          // Subtle camera viewfinder vignette
          IgnorePointer(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.black.withValues(alpha: 0.35),
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.45),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
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
