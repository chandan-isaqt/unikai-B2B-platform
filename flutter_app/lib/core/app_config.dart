import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:shared_preferences/shared_preferences.dart';

class AppConfig {
  static const String _customApiUrlKey = 'unikai_custom_api_base_url';

  /// Compile-time override if passed via --dart-define=API_BASE_URL=http://192.168.1.50:5000/api
  static const String envApiUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');

// static const String androidEmulatorUrl =
//     'http://192.168.0.104:5001/api';

static const String androidEmulatorUrl =
    'http://10.222.115.243:5001/api';
  static const String iosSimulatorUrl = 'http://localhost:5001/api';

  static String _activeApiBaseUrl = '';

  static String get defaultPlatformApiUrl {
    if (envApiUrl.isNotEmpty) return envApiUrl;
    if (kIsWeb) return iosSimulatorUrl;
    try {
      if (Platform.isAndroid) {
        return androidEmulatorUrl;
      }
    } catch (_) {}
    return iosSimulatorUrl;
  }

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_customApiUrlKey);
    if (saved != null && saved.trim().isNotEmpty) {
      _activeApiBaseUrl = saved.trim();
    } else {
      _activeApiBaseUrl = defaultPlatformApiUrl;
    }
  }

  static String get apiBaseUrl {
    if (_activeApiBaseUrl.isEmpty) {
      return defaultPlatformApiUrl;
    }
    return _activeApiBaseUrl;
  }

  static String get serverRootUrl {
    final base = apiBaseUrl;
    if (base.endsWith('/api')) {
      return base.substring(0, base.length - 4);
    }
    return base;
  }

  static Future<void> setCustomApiBaseUrl(String url) async {
    final clean = url.trim().replaceAll(RegExp(r'/$'), '');
    _activeApiBaseUrl = clean;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_customApiUrlKey, clean);
  }

  static Future<void> resetToDefault() async {
    _activeApiBaseUrl = defaultPlatformApiUrl;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_customApiUrlKey);
  }

  static String resolveImageUrl(String? path) {
    if (path == null || path.trim().isEmpty) {
      return '';
    }
    final clean = path.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }
    final normalized = clean.startsWith('/') ? clean : '/$clean';
    return '$serverRootUrl$normalized';
  }

  static bool hasValidPrice(num? amount) {
    if (amount == null) return false;
    final val = amount.toDouble();
    return !val.isNaN && val > 0;
  }

  static String formatOMR(num? amount) {
    if (!hasValidPrice(amount)) return '';
    return 'OMR ${amount!.toDouble().toStringAsFixed(3)}';
  }
}
