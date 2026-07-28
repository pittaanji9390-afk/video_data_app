import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  PermissionService._();

  static final PermissionService instance = PermissionService._();

  /// Checks the current status of camera permission
  Future<PermissionStatus> getCameraPermissionStatus() async {
    return await Permission.camera.status;
  }

  /// Requests camera permission from the OS
  Future<PermissionStatus> requestCameraPermission() async {
    final status = await Permission.camera.request();
    return status;
  }

  /// Opens system app settings when permission is permanently denied
  Future<bool> openAppSettings() async {
    return await openAppSettings();
  }
}
