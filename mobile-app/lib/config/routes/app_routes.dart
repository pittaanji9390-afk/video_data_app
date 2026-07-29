import 'package:flutter/material.dart';
import '../../screens/admin/mobile_admin_dashboard_screen.dart';
import '../../screens/environment/environment_tag_screen.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/login/login_screen.dart';
import '../../screens/login/otp_login_screen.dart';
import '../../screens/permission/camera_permission_screen.dart';
import '../../screens/recording/video_recording_screen.dart';
import '../../screens/splash/splash_screen.dart';
import '../../screens/upload/video_upload_screen.dart';
import '../../screens/vendor/mobile_vendor_dashboard_screen.dart';

class AppRoutes {
  AppRoutes._();

  // Route Name Constants
  static const String splash = '/';
  static const String login = '/login';
  static const String otpLogin = '/otp-login';
  static const String home = '/home';
  static const String cameraPermission = '/camera-permission';
  static const String recordVideo = '/record-video';
  static const String environmentTag = '/environment-tag';
  static const String uploadVideo = '/upload-video';
  static const String adminDashboard = '/admin-dashboard';
  static const String vendorDashboard = '/vendor-dashboard';

  /// Named Routes Map
  static Map<String, WidgetBuilder> get routes {
    return {
      splash: (context) => const SplashScreen(),
      login: (context) => const LoginScreen(),
      otpLogin: (context) => const OTPLoginScreen(),
      home: (context) => const HomeScreen(),
      cameraPermission: (context) => const CameraPermissionScreen(),
      recordVideo: (context) => const VideoRecordingScreen(),
      environmentTag: (context) => const EnvironmentTagScreen(),
      adminDashboard: (context) => const MobileAdminDashboardScreen(),
      vendorDashboard: (context) => const MobileVendorDashboardScreen(),
    };
  }

  /// OnGenerateRoute for dynamic/parameterized route handling
  static Route<dynamic>? onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case login:
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case otpLogin:
        return MaterialPageRoute(builder: (_) => const OTPLoginScreen());
      case home:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case cameraPermission:
        return MaterialPageRoute(builder: (_) => const CameraPermissionScreen());
      case recordVideo:
        return MaterialPageRoute(builder: (_) => const VideoRecordingScreen());
      case environmentTag:
        return MaterialPageRoute(builder: (_) => const EnvironmentTagScreen());
      case adminDashboard:
        return MaterialPageRoute(builder: (_) => const MobileAdminDashboardScreen());
      case vendorDashboard:
        return MaterialPageRoute(builder: (_) => const MobileVendorDashboardScreen());
      case uploadVideo:
        final args = settings.arguments as Map<String, dynamic>?;
        final path = args?['videoPath'] as String? ?? '';
        final tag = args?['environmentTag'] as String?;
        return MaterialPageRoute(
          builder: (_) => VideoUploadScreen(
            videoPath: path,
            environmentTag: tag,
          ),
        );
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }
}
