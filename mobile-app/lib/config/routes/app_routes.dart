import 'package:flutter/material.dart';
import '../../screens/login/login_screen.dart';
import '../../screens/splash/splash_screen.dart';

class AppRoutes {
  AppRoutes._();

  // Route Name Constants
  static const String splash = '/';
  static const String login = '/login';
  static const String home = '/home';
  static const String recordVideo = '/record-video';
  static const String uploadVideo = '/upload-video';

  /// Named Routes Map
  static Map<String, WidgetBuilder> get routes {
    return {
      splash: (context) => const SplashScreen(),
      login: (context) => const LoginScreen(),
    };
  }

  /// OnGenerateRoute for dynamic/parameterized route handling
  static Route<dynamic>? onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case login:
        return MaterialPageRoute(builder: (_) => const LoginScreen());
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
