import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

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

class _WebLiveCameraViewState extends State<WebLiveCameraView> with SingleTickerProviderStateMixin {
  late AnimationController _animController;

  final List<String> _sampleVideoFrames = [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80', // Kitchen frame
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop&q=80', // Bedroom frame
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80', // Living room frame
  ];

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String currentImage = _sampleVideoFrames[0];
    if (widget.environmentTag == 'Bedroom') {
      currentImage = _sampleVideoFrames[1];
    } else if (widget.environmentTag == 'Garden' || widget.environmentTag == 'Office') {
      currentImage = _sampleVideoFrames[2];
    }

    return AnimatedBuilder(
      animation: _animController,
      builder: (context, child) {
        final scale = 1.0 + (_animController.value * 0.08); // Live subtle camera pan/zoom motion effect

        return Stack(
          fit: StackFit.expand,
          children: [
            // Live Moving Camera Feed Image
            Transform.scale(
              scale: scale,
              child: Image.network(
                currentImage,
                fit: BoxFit.cover,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return Container(
                    color: const Color(0xFF0F172A),
                    child: const Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    ),
                  );
                },
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: const Color(0xFF1E293B),
                    child: const Center(
                      child: Icon(Icons.videocam_rounded, size: 64, color: Colors.white38),
                    ),
                  );
                },
              ),
            ),

            // Live Camera Viewfinder Overlay Tint
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: widget.isRecording
                      ? [
                          Colors.red.withValues(alpha: 0.25),
                          Colors.transparent,
                          Colors.red.withValues(alpha: 0.35),
                        ]
                      : [
                          Colors.black.withValues(alpha: 0.3),
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.4),
                        ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}
