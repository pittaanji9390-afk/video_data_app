import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/api_constants.dart';

class UploadResult {
  final bool isSuccess;
  final String? videoId;
  final String? filePath;
  final String? message;
  final Map<String, dynamic>? rawData;

  UploadResult({
    required this.isSuccess,
    this.videoId,
    this.filePath,
    this.message,
    this.rawData,
  });
}

class UploadService {
  UploadService._();

  static final UploadService instance = UploadService._();

  /// Uploads a local MP4 video file to the backend API via multipart/form-data.
  /// Reports upload progress via optional [onProgress] callback (0.0 to 1.0).
  Future<UploadResult> uploadVideo({
    required String filePath,
    String? candidateId,
    String? vendorId,
    String? environmentTag,
    void Function(double progress)? onProgress,
  }) async {
    final file = File(filePath);
    if (!await file.exists()) {
      return UploadResult(
        isSuccess: false,
        message: 'Local video file does not exist at path: $filePath',
      );
    }

    try {
      final uploadUri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.videoUploadEndpoint}');
      final request = http.MultipartRequest('POST', uploadUri);

      // Attach file to field "video"
      final multipartFile = await http.MultipartFile.fromPath('video', filePath);
      request.files.add(multipartFile);

      // Attach metadata fields if provided
      if (candidateId != null) request.fields['candidate_id'] = candidateId;
      if (vendorId != null) request.fields['vendor_id'] = vendorId;
      if (environmentTag != null) request.fields['environment_tag'] = environmentTag;

      onProgress?.call(0.2);

      // Send request
      final streamedResponse = await request.send();
      onProgress?.call(0.8);

      final response = await http.Response.fromStream(streamedResponse);
      final responseBody = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = responseBody['data'] ?? responseBody;
        final videoId = data['id'] ?? data['video_id'];

        // Save returned video ID locally in SharedPreferences
        if (videoId != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('last_uploaded_video_id', videoId.toString());

          List<String> history = prefs.getStringList('uploaded_video_ids') ?? [];
          if (!history.contains(videoId.toString())) {
            history.add(videoId.toString());
            await prefs.setStringList('uploaded_video_ids', history);
          }
        }

        onProgress?.call(1.0);

        return UploadResult(
          isSuccess: true,
          videoId: videoId?.toString(),
          filePath: data['local_path'] ?? filePath,
          message: responseBody['message'] ?? 'Video uploaded successfully',
          rawData: responseBody,
        );
      } else {
        return UploadResult(
          isSuccess: false,
          message: responseBody['message'] ?? 'Server error ${response.statusCode}',
          rawData: responseBody,
        );
      }
    } catch (e) {
      return UploadResult(
        isSuccess: false,
        message: 'Upload failed: ${e.toString()}',
      );
    }
  }
}
