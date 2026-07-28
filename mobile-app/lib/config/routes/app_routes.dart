import 'package:flutter/material.dart';
import '../../screens/environment/environment_tag_screen.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/login/login_screen.dart';
import '../../screens/permission/camera_permission_screen.dart';
import '../../screens/recording/video_recording_screen.dart';
import '../../screens/splash/splash_screen.dart';

class AppRoutes {
  AppRoutes._();

  // Route Name Constants
  static const String splash = '/';
  static const String login = '/login';
  static const String home = '/home';
  static const String cameraPermission = '/camera-permission';
  static const String recordVideo = '/record-video';
  static const String environmentTag = '/environment-tag';
  static const String uploadVideo = '/upload-video';

  /// Named Routes Map
  static Map<String, WidgetBuilder> get routes {
    return {
      splash: (context) => const SplashScreen(),
      login: (context) => const LoginScreen(),
      home: (context) => const HomeScreen(),
      cameraPermission: (context) => const CameraPermissionScreen(),
      recordVideo: (context) => const VideoRecordingScreen(),
      environmentTag: (context) => const EnvironmentTagScreen(),
    };
  }

  /// OnGenerateRoute for dynamic/parameterized route handling
  static Route<dynamic>? onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case login:
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case home:
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case cameraPermission:
        return MaterialPageRoute(builder: (_) => const CameraPermissionScreen());
      case recordVideo:
        return MaterialPageRoute(builder: (_) => const VideoRecordingScreen());
      case environmentTag:
        return MaterialPageRoute(builder: (_) => const EnvironmentTagScreen());
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
