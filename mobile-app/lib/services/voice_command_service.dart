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
      // First request microphone permission from browser
      try {
        html.window.navigator.mediaDevices?.getUserMedia({'audio': true}).then((stream) {
          debugPrint('Microphone permission granted for Speech Recognition');
        }).catchError((err) {
          debugPrint('Microphone access note: $err');
        });
      } catch (_) {}

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
                _onSpeechRecognized?.call('Recognized Speech: "$transcript"');

                if (transcript.contains('start') ||
                    transcript.contains('record') ||
                    transcript.contains('begin') ||
                    transcript.contains('go') ||
                    transcript.contains('action')) {
                  _onCommandDetected?.call(VoiceCommand.start);
                } else if (transcript.contains('stop') ||
                    transcript.contains('end') ||
                    transcript.contains('finish') ||
                    transcript.contains('cut') ||
                    transcript.contains('pause')) {
                  _onCommandDetected?.call(VoiceCommand.stop);
                }
              }
            }
          });

          // Auto-restart speech recognition if browser stops after silence
          _webSpeechRecognition.onEnd.listen((_) {
            if (_isListening) {
              try {
                _webSpeechRecognition.start();
              } catch (_) {}
            }
          });

          _webSpeechRecognition.onError.listen((e) {
            debugPrint('Web Speech Error: $e');
            if (_isListening) {
              try {
                _webSpeechRecognition.start();
              } catch (_) {}
            }
          });

          _webSpeechRecognition.start();
          _onSpeechRecognized?.call('🎤 Listening continuously for "Start" or "Stop"...');
        } else {
          _onSpeechRecognized?.call('🎤 Voice Control Active — Use "Say Start" or "Say Stop" buttons');
        }
      } catch (e) {
        debugPrint('Web Speech API Init Exception: $e');
        _onSpeechRecognized?.call('🎤 Voice Control Active — Use "Say Start" or "Say Stop" buttons');
      }
    }
  }

  /// Manually trigger voice command for testing / web simulation
  void processSimulatedSpeech(String text) {
    if (!_isListening) return;

    final lower = text.trim().toLowerCase();
    _onSpeechRecognized?.call('Voice Trigger: "$text"');

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
