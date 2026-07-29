import 'package:flutter/foundation.dart';

enum VoiceCommand { start, stop }

class VoiceCommandService {
  VoiceCommandService._();
  static final VoiceCommandService instance = VoiceCommandService._();

  bool _isListening = false;
  bool get isListening => _isListening;

  void Function(VoiceCommand command)? _onCommandDetected;
  void Function(String text)? _onSpeechRecognized;

  /// Start listening for voice commands ("start recording", "stop recording", "record", "stop")
  void startListening({
    required void Function(VoiceCommand command) onCommand,
    void Function(String text)? onSpeechRecognized,
  }) {
    _onCommandDetected = onCommand;
    _onSpeechRecognized = onSpeechRecognized;
    _isListening = true;

    if (kIsWeb) {
      // Simulate listening state for Web
      _onSpeechRecognized?.call("Voice Recognition Active ('start' / 'stop')");
    }
  }

  /// Manually trigger voice command for testing / web simulation
  void processSimulatedSpeech(String text) {
    if (!_isListening) return;

    final lower = text.trim().toLowerCase();
    _onSpeechRecognized?.call(text);

    if (lower.contains('start') || lower.contains('record') || lower.contains('begin')) {
      _onCommandDetected?.call(VoiceCommand.start);
    } else if (lower.contains('stop') || lower.contains('end') || lower.contains('finish')) {
      _onCommandDetected?.call(VoiceCommand.stop);
    }
  }

  /// Stop listening
  void stopListening() {
    _isListening = false;
    _onCommandDetected = null;
    _onSpeechRecognized = null;
  }
}
