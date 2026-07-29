import 'package:flutter/foundation.dart';

class ApiConstants {
  // Prevent instantiation
  ApiConstants._();

  /// Base URL for backend server
  /// Handles localhost for Web/Desktop/iOS vs 10.0.2.2 for Android Emulator
  static String get baseUrl {
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://192.168.1.23:5000';
    }
    return 'http://localhost:5000';
  }

  static const String apiVersion = '/api/v1';

  // API Endpoints
  static String get healthEndpoint => '/health';
  static String get adminsEndpoint => '$apiVersion/admins';
  static String get vendorsEndpoint => '$apiVersion/vendors';
  static String get candidatesEndpoint => '$apiVersion/candidates';
  static String get videosEndpoint => '$apiVersion/videos';
  static String get videoUploadEndpoint => '$apiVersion/videos/upload';
  static String get qcReviewsEndpoint => '$apiVersion/qc-reviews';
  static String get paymentsEndpoint => '$apiVersion/payments';

  // Request Headers
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
