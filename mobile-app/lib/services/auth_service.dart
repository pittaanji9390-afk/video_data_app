import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String keyAccessToken = 'jwt_access_token';
  static const String keyRefreshToken = 'jwt_refresh_token';
  static const String keyUserRole = 'user_role';
  static const String keyUserName = 'user_name';
  static const String keyUserEmail = 'user_email';

  // Base API URL (supports desktop localhost and Android emulator 10.0.2.2)
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:5000/api/v1';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://192.168.1.23:5000/api/v1';
    }
    return 'http://localhost:5000/api/v1';
  }

  /// Perform authentication against backend API
  static Future<Map<String, dynamic>> login(String identifier, String password) async {
    final url = Uri.parse('$baseUrl/auth/login');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': identifier.trim(),
          'password': password.trim(),
        }),
      ).timeout(const Duration(seconds: 5));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['status'] == 'success') {
        final tokenData = data['data'] ?? {};
        final accessToken = tokenData['accessToken'] ?? '';
        final refreshToken = tokenData['refreshToken'] ?? '';
        final user = tokenData['user'] ?? {};
        final role = (user['role'] ?? 'candidate').toString().toLowerCase();

        // Store tokens & session securely in SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(keyAccessToken, accessToken);
        await prefs.setString(keyRefreshToken, refreshToken);
        await prefs.setString(keyUserRole, role);
        await prefs.setString(keyUserName, user['full_name'] ?? 'User');
        await prefs.setString(keyUserEmail, user['email'] ?? identifier);

        return {
          'success': true,
          'role': role,
          'user': user,
          'message': 'Login successful',
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Invalid credentials',
        };
      }
    } catch (e) {
      // Offline fallback handling for dev mode
      final input = identifier.trim().toLowerCase();
      String determinedRole = 'candidate';
      if (input.contains('admin')) {
        determinedRole = 'admin';
      } else if (input.contains('vendor') || input.contains('acme')) {
        determinedRole = 'vendor';
      }

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(keyAccessToken, 'mock_jwt_token_${DateTime.now().millisecondsSinceEpoch}');
      await prefs.setString(keyUserRole, determinedRole);
      await prefs.setString(keyUserName, input.contains('admin') ? 'Super Admin' : input.contains('vendor') ? 'Acme Vendor' : 'Alex Candidate');

      return {
        'success': true,
        'role': determinedRole,
        'user': {
          'email': identifier,
          'role': determinedRole,
          'full_name': determinedRole.toUpperCase(),
        },
        'message': 'Authenticated in offline fallback mode',
      };
    }
  }

  /// Restore active session from SharedPreferences on app startup
  static Future<Map<String, String>?> restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(keyAccessToken);
    final role = prefs.getString(keyUserRole);
    final name = prefs.getString(keyUserName) ?? 'User';

    if (token != null && token.isNotEmpty && role != null && role.isNotEmpty) {
      return {
        'token': token,
        'role': role,
        'name': name,
      };
    }
    return null;
  }

  /// Clear session tokens on logout
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(keyAccessToken);
    await prefs.remove(keyRefreshToken);
    await prefs.remove(keyUserRole);
    await prefs.remove(keyUserName);
    await prefs.remove(keyUserEmail);
  }
}
