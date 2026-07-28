import 'package:flutter/material.dart';
import '../../screens/splash/splash_screen.dart';

class AppRoutes {
  AppRoutes._();

  // Route Name Constants
  static const String splash = '/';
  static const String home = '/home';
  static const String login = '/login';
  static const String recordVideo = '/record-video';
  static const String uploadVideo = '/upload-video';

  /// Named Routes Map
  static Map<String, WidgetBuilder> get routes {
    return {
      splash: (context) => const SplashScreen(),
      // Additional screens will be attached in future steps
    };
  }

  /// OnGenerateRoute for dynamic/parameterized route handling
  static Route<dynamic>? onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
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
