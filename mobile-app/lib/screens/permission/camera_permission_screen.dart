import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../core/theme/app_colors.dart';

class CameraPermissionScreen extends StatefulWidget {
  const CameraPermissionScreen({super.key});

  @override
  State<CameraPermissionScreen> createState() => _CameraPermissionScreenState();
}

class _CameraPermissionScreenState extends State<CameraPermissionScreen> {
  PermissionStatus _status = PermissionStatus.denied;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkInitialStatus();
  }

  Future<void> _checkInitialStatus() async {
    final status = await Permission.camera.status;
    setState(() {
      _status = status;
      _isLoading = false;
    });
  }

  Future<void> _requestPermission() async {
    setState(() => _isLoading = true);
    final newStatus = await Permission.camera.request();
    setState(() {
      _status = newStatus;
      _isLoading = false;
    });

    if (mounted) {
      if (newStatus.isGranted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Camera permission granted successfully!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else if (newStatus.isDenied) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Camera permission was denied.'),
            backgroundColor: AppColors.warning,
            behavior: SnackBarBehavior.floating,
          ),
        );
      } else if (newStatus.isPermanentlyDenied) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Permission permanently denied. Please enable in App Settings.'),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _openSettings() async {
    await openAppSettings();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Camera Permission'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 450),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Dynamic Status Icon Header
                        _buildStatusIcon(),
                        const SizedBox(height: 32),

                        // Title
                        Text(
                          _getStatusTitle(),
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: isDarkMode
                                ? AppColors.textPrimaryDark
                                : AppColors.textPrimaryLight,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),

                        // Description / Explanation
                        Text(
                          _getStatusDescription(),
                          style: TextStyle(
                            fontSize: 14,
                            height: 1.5,
                            color: isDarkMode
                                ? AppColors.textSecondaryDark
                                : AppColors.textSecondaryLight,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 40),

                        // Action Button
                        _buildActionButton(),
                      ],
                    ),
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildStatusIcon() {
    IconData iconData = Icons.camera_alt_outlined;
    Color iconColor = AppColors.primary;
    Color bgBgColor = AppColors.primary.withAlpha(30);

    if (_status.isGranted) {
      iconData = Icons.check_circle_rounded;
      iconColor = AppColors.success;
      bgBgColor = AppColors.success.withAlpha(30);
    } else if (_status.isPermanentlyDenied) {
      iconData = Icons.settings_applications_rounded;
      iconColor = AppColors.error;
      bgBgColor = AppColors.error.withAlpha(30);
    } else if (_status.isDenied) {
      iconData = Icons.no_photography_rounded;
      iconColor = AppColors.warning;
      bgBgColor = AppColors.warning.withAlpha(30);
    }

    return Container(
      height: 110,
      width: 110,
      decoration: BoxDecoration(
        color: bgBgColor,
        shape: BoxShape.circle,
      ),
      child: Icon(
        iconData,
        size: 56,
        color: iconColor,
      ),
    );
  }

  String _getStatusTitle() {
    if (_status.isGranted) {
      return 'Permission Granted';
    } else if (_status.isPermanentlyDenied) {
      return 'Permission Permanently Denied';
    } else if (_status.isDenied) {
      return 'Camera Access Required';
    }
    return 'Request Camera Access';
  }

  String _getStatusDescription() {
    if (_status.isGranted) {
      return 'Camera permission is active and granted. You are ready to capture video samples.';
    } else if (_status.isPermanentlyDenied) {
      return 'Camera access is permanently blocked in your device settings.\n\nPlease tap "Open App Settings" below to manually enable Camera access.';
    } else if (_status.isDenied) {
      return 'Camera access was denied. To record videos for data collection, camera permission is required.';
    }
    return 'This app needs access to your camera to record high-quality video data samples.';
  }

  Widget _buildActionButton() {
    if (_status.isGranted) {
      return ElevatedButton.icon(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Camera ready. (Video recording step in next feature)'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        },
        icon: const Icon(Icons.videocam_rounded),
        label: const Text('Camera Ready (Granted)'),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.success,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }

    if (_status.isPermanentlyDenied) {
      return ElevatedButton.icon(
        onPressed: _openSettings,
        icon: const Icon(Icons.settings_rounded),
        label: const Text('Open App Settings'),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.error,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }

    return ElevatedButton.icon(
      onPressed: _requestPermission,
      icon: const Icon(Icons.security_rounded),
      label: const Text('Grant Camera Permission'),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
