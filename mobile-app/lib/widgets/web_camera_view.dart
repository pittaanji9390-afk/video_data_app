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
          ..style.backgroundColor = '#000000';

        final videoElement = html.VideoElement()
          ..id = 'live-webcam-element'
          ..style.width = '100%'
          ..style.height = '100%'
          ..style.objectFit = 'cover'
          ..autoplay = true
          ..muted = true;

        videoElement.setAttribute('playsinline', 'true');

        container.append(videoElement);

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
            debugPrint('Trying video-only stream: $err');
            html.window.navigator.mediaDevices?.getUserMedia({'video': true}).then((stream) {
              videoElement.srcObject = stream;
              videoElement.play();
            }).catchError((err2) {
              debugPrint('Webcam permission error: $err2');
            });
          });
        } catch (e) {
          debugPrint('getUserMedia error: $e');
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
      color: Colors.black,
      child: const Center(
        child: Icon(Icons.videocam_rounded, size: 64, color: Colors.white54),
      ),
    );
  }
}
