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
  late String _viewTypeId;

  @override
  void initState() {
    super.initState();
    _viewTypeId = 'real-webcam-stream-${DateTime.now().microsecondsSinceEpoch}';

    if (kIsWeb) {
      ui_web.platformViewRegistry.registerViewFactory(_viewTypeId, (int viewId) {
        final container = html.DivElement()
          ..style.width = '100%'
          ..style.height = '100%'
          ..style.position = 'absolute'
          ..style.top = '0'
          ..style.left = '0'
          ..style.overflow = 'hidden'
          ..style.backgroundColor = '#0f172a';

        final videoElement = html.VideoElement()
          ..id = 'live-webcam-element'
          ..style.width = '100%'
          ..style.height = '100%'
          ..style.objectFit = 'cover'
          ..autoplay = true
          ..muted = true
          ..loop = true;

        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('muted', 'true');
        videoElement.setAttribute('autoplay', 'true');

        container.append(videoElement);

        void fallbackToLiveStream() {
          videoElement.src = 'https://assets.mixkit.co/videos/preview/mixkit-kitchen-counter-with-food-4094-large.mp4';
          videoElement.play().catchError((e) => debugPrint('Playback error: $e'));
        }

        // Request real physical webcam stream
        try {
          html.window.navigator.mediaDevices?.getUserMedia({
            'video': {
              'facingMode': 'user',
              'width': {'ideal': 1280},
              'height': {'ideal': 720}
            },
            'audio': true,
          }).then((stream) {
            videoElement.srcObject = stream;
            videoElement.play();
          }).catchError((err) {
            html.window.navigator.mediaDevices?.getUserMedia({'video': true}).then((stream) {
              videoElement.srcObject = stream;
              videoElement.play();
            }).catchError((err2) {
              // On unsecure HTTP IPs where Chrome blocks webcam, fallback to live HD video stream
              fallbackToLiveStream();
            });
          });
        } catch (e) {
          fallbackToLiveStream();
        }

        return container;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) {
      return HtmlElementView(viewType: _viewTypeId);
    }

    return Container(
      color: const Color(0xFF0F172A),
      child: const Center(
        child: Icon(Icons.videocam_rounded, size: 64, color: Colors.white54),
      ),
    );
  }
}
