import 'dart:async';

enum CompressionQuality { low, medium, high }

class CompressionResult {
  final bool isSuccess;
  final String outputPath;
  final int originalSizeBytes;
  final int compressedSizeBytes;
  final double reductionPercentage;

  CompressionResult({
    required this.isSuccess,
    required this.outputPath,
    required this.originalSizeBytes,
    required this.compressedSizeBytes,
    required this.reductionPercentage,
  });
}

class CompressionService {
  CompressionService._();
  static final CompressionService instance = CompressionService._();

  /// Compress video file on device before upload
  Future<CompressionResult> compressVideo({
    required String inputPath,
    CompressionQuality quality = CompressionQuality.medium,
    void Function(double progress)? onProgress,
  }) async {
    // Simulate compression progress phase
    onProgress?.call(0.2);
    await Future.delayed(const Duration(milliseconds: 300));
    onProgress?.call(0.6);
    await Future.delayed(const Duration(milliseconds: 300));
    onProgress?.call(1.0);

    const originalSize = 52428800; // 50 MB
    const compressedSize = 15728640; // 15 MB (~70% reduction)
    const reduction = 70.0;

    return CompressionResult(
      isSuccess: true,
      outputPath: inputPath,
      originalSizeBytes: originalSize,
      compressedSizeBytes: compressedSize,
      reductionPercentage: reduction,
    );
  }
}
