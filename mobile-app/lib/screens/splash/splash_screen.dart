import 'package:flutter/material.dart';
import '../../config/routes/app_routes.dart';
import '../../widgets/powered_by_footer.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkSessionAndNavigate();
  }

  Future<void> _checkSessionAndNavigate() async {
    // Smooth splash load delay (1.5s) to display branding
    await Future.delayed(const Duration(milliseconds: 1500));

    if (!mounted) return;

    // Navigate to Onboarding screens flow before login
    Navigator.pushReplacementNamed(context, AppRoutes.onboarding);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1D4ED8),
      body: SafeArea(
        child: SizedBox(
          width: double.infinity,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(50),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.videocam_rounded,
                  size: 52,
                  color: Color(0xFF1D4ED8),
                ),
              ),
              const SizedBox(height: 28),
              const Text(
                'Video Data\nCollection Platform',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Collect. Upload. Earn.',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.white70,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 60),
              const Text(
                'Loading...',
                style: TextStyle(fontSize: 12, color: Colors.white70),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: 140,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: const LinearProgressIndicator(
                    backgroundColor: Colors.white24,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    minHeight: 4,
                  ),
                ),
              ),
              const SizedBox(height: 30),
              const PoweredByFooter(
                textColor: Colors.white70,
                brandColor: Colors.white,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
