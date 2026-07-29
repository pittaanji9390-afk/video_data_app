import 'package:flutter/foundation.dart';
import 'dart:html' as html;

enum VoiceCommand { start, stop }

class VoiceCommandService {
  VoiceCommandService._();
  static final VoiceCommandService instance = VoiceCommandService._();

  bool _isListening = false;
  bool get isListening => _isListening;

  void Function(VoiceCommand command)? _onCommandDetected;
  void Function(String text)? _onSpeechRecognized;
  dynamic _webSpeechRecognition;

  /// Start listening for voice commands ("start", "stop", "record")
  void startListening({
    required void Function(VoiceCommand command) onCommand,
    void Function(String text)? onSpeechRecognized,
  }) {
    _onCommandDetected = onCommand;
    _onSpeechRecognized = onSpeechRecognized;
    _isListening = true;

    if (kIsWeb) {
      try {
        if (html.SpeechRecognition.supported) {
          _webSpeechRecognition = html.SpeechRecognition()
            ..continuous = true
            ..interimResults = true
            ..lang = 'en-US';

          _webSpeechRecognition.onResult.listen((event) {
            final results = event.results;
            if (results != null && results.isNotEmpty) {
              for (var i = 0; i < results.length; i++) {
                final transcript = results[i][0].transcript?.toLowerCase() ?? '';
                _onSpeechRecognized?.call('Recognized: "$transcript"');

                if (transcript.contains('start') || transcript.contains('record') || transcript.contains('begin')) {
                  _onCommandDetected?.call(VoiceCommand.start);
                } else if (transcript.contains('stop') || transcript.contains('end') || transcript.contains('finish')) {
                  _onCommandDetected?.call(VoiceCommand.stop);
                }
              }
            }
          });

          _webSpeechRecognition.start();
          _onSpeechRecognized?.call('🎤 Listening for voice commands ("Start", "Stop")...');
        } else {
          _onSpeechRecognized?.call('🎤 Voice Recognition Active ("Start" / "Stop")');
        }
      } catch (e) {
        debugPrint('Web Speech API Error: $e');
        _onSpeechRecognized?.call('🎤 Voice Control Active ("Start" / "Stop")');
      }
    }
  }

  /// Manually trigger voice command for testing / web simulation
  void processSimulatedSpeech(String text) {
    if (!_isListening) return;

    final lower = text.trim().toLowerCase();
    _onSpeechRecognized?.call('Voice Command: "$text"');

    if (lower.contains('start') || lower.contains('record') || lower.contains('begin')) {
      _onCommandDetected?.call(VoiceCommand.start);
    } else if (lower.contains('stop') || lower.contains('end') || lower.contains('finish')) {
      _onCommandDetected?.call(VoiceCommand.stop);
    }
  }

  /// Stop listening
  void stopListening() {
    _isListening = false;
    if (kIsWeb && _webSpeechRecognition != null) {
      try {
        _webSpeechRecognition.stop();
      } catch (_) {}
    }
    _onCommandDetected = null;
    _onSpeechRecognized = null;
  }
}
