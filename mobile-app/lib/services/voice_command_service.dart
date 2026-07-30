import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'dart:async';
import 'dart:html' as html;

enum VoiceCommand { start, stop }

class VoiceCommandService {
  VoiceCommandService._();
  static final VoiceCommandService instance = VoiceCommandService._();

  final SpeechToText _speechToText = SpeechToText();
  bool _isInitialized = false;
  bool _isListening = false;
  bool get isListening => _isListening;

  void Function(VoiceCommand command)? _onCommandDetected;
  void Function(String statusMessage)? _onStatusChanged;
  dynamic _webSpeechRecognition;

  /// Initialize and start continuous speech recognition
  Future<void> startListening({
    required void Function(VoiceCommand command) onCommand,
    void Function(String statusMessage)? onStatusChanged,
  }) async {
    _onCommandDetected = onCommand;
    _onStatusChanged = onStatusChanged;
    _isListening = true;

    if (kIsWeb) {
      _initWebSpeechRecognition();
      return;
    }

    // Native Mobile Speech-to-Text Setup
    try {
      if (!_isInitialized) {
        _isInitialized = await _speechToText.initialize(
          onError: (errorNotification) {
            debugPrint('Speech-to-text Error: ${errorNotification.errorMsg}');
            _restartListeningIfNeeded();
          },
          onStatus: (status) {
            debugPrint('Speech-to-text Status: $status');
            if (status == 'done' || status == 'notListening') {
              _restartListeningIfNeeded();
            }
          },
        ).catchError((err) {
          debugPrint('Speech initialize catchError: $err');
          return false;
        });
      }
    } catch (e) {
      debugPrint('Speech initialize exception: $e');
      _isInitialized = false;
    }

    _startListeningLoop();
  }

  void _initWebSpeechRecognition() {
    try {
      if (html.SpeechRecognition.supported) {
        _webSpeechRecognition = html.SpeechRecognition()
          ..continuous = true
          ..interimResults = true
          ..maxAlternatives = 1
          ..lang = 'en-US';

        _webSpeechRecognition.onResult.listen((event) {
          try {
            final results = event.results;
            if (results != null) {
              final len = results.length ?? 0;
              for (var i = 0; i < len; i++) {
                try {
                  final item = results[i];
                  if (item != null) {
                    final alt = item[0];
                    final transcript = (alt?.transcript ?? '').toString().toLowerCase().trim();
                    if (transcript.contains('start recording') || transcript == 'start' || transcript.contains('start')) {
                      _onCommandDetected?.call(VoiceCommand.start);
                    } else if (transcript.contains('stop recording') || transcript == 'stop' || transcript.contains('stop')) {
                      _onCommandDetected?.call(VoiceCommand.stop);
                    }
                  }
                } catch (_) {}
              }
            }
          } catch (_) {}
        });

        _webSpeechRecognition.onEnd.listen((_) {
          if (_isListening) {
            Future.delayed(const Duration(milliseconds: 300), () {
              if (_isListening) {
                try {
                  _webSpeechRecognition.start();
                } catch (_) {}
              }
            });
          }
        });

        _webSpeechRecognition.onError.listen((e) {
          debugPrint('Web Speech Error: $e');
          if (_isListening) {
            Future.delayed(const Duration(milliseconds: 500), () {
              if (_isListening) {
                try {
                  _webSpeechRecognition.start();
                } catch (_) {}
              }
            });
          }
        });

        try {
          _webSpeechRecognition.start();
        } catch (_) {}
        _onStatusChanged?.call('🎤 Listening for "Start Recording" / "Stop Recording"');
      } else {
        _onStatusChanged?.call('🎤 Voice Recognition Active');
      }
    } catch (e) {
      debugPrint('Web speech exception: $e');
      _onStatusChanged?.call('🎤 Voice Recognition Active');
    }
  }

  void _startListeningLoop() {
    if (!_isInitialized || kIsWeb) return;
    _isListening = true;

    try {
      _speechToText.listen(
        onResult: (result) {
          final recognizedWords = result.recognizedWords.trim().toLowerCase();
          
          if (recognizedWords.contains('start recording') || recognizedWords == 'start') {
            _onCommandDetected?.call(VoiceCommand.start);
          } else if (recognizedWords.contains('stop recording') || recognizedWords == 'stop') {
            _onCommandDetected?.call(VoiceCommand.stop);
          }
        },
        listenFor: const Duration(seconds: 30),
        pauseFor: const Duration(seconds: 3),
        partialResults: true,
        cancelOnError: false,
        listenMode: ListenMode.confirmation,
      ).catchError((err) {
        debugPrint('Speech listen catchError: $err');
      });
      _onStatusChanged?.call('🎤 Listening for "Start Recording" / "Stop Recording"');
    } catch (e) {
      debugPrint('Error launching speech recognition: $e');
    }
  }

  void _restartListeningIfNeeded() {
    if (_isListening && !kIsWeb) {
      Future.delayed(const Duration(milliseconds: 500), () {
        if (_isListening) {
          _startListeningLoop();
        }
      });
    }
  }

  /// Manually trigger voice command for testing / web simulation
  void processSimulatedSpeech(String text) {
    if (!_isListening) return;
    final lower = text.trim().toLowerCase();

    if (lower.contains('start recording') || lower == 'start') {
      _onCommandDetected?.call(VoiceCommand.start);
    } else if (lower.contains('stop recording') || lower == 'stop') {
      _onCommandDetected?.call(VoiceCommand.stop);
    }
  }

  /// Stop listening completely
  void stopListening() {
    _isListening = false;
    if (kIsWeb && _webSpeechRecognition != null) {
      try {
        _webSpeechRecognition.stop();
      } catch (_) {}
    } else {
      try {
        _speechToText.stop().catchError((_) {});
      } catch (_) {}
    }
    _onCommandDetected = null;
    _onStatusChanged = null;
  }
}
