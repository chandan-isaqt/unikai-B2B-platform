import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/app_config.dart';

class ApiService {
  static const FlutterSecureStorage _storage = FlutterSecureStorage();
  static const String tokenKey = 'unikai_jwt_token';

  late final Dio _dio;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 12),
        headers: {'Content-Type': 'application/json'},
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Always sync baseUrl in case user changed server IP in Settings
          options.baseUrl = AppConfig.apiBaseUrl;
          final token = await _storage.read(key: tokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Dio get client => _dio;

  static Future<void> saveToken(String token) async {
    await _storage.write(key: tokenKey, value: token);
  }

  static Future<String?> getToken() async {
    return _storage.read(key: tokenKey);
  }

  static Future<void> clearToken() async {
    await _storage.delete(key: tokenKey);
  }

  /// Parses Dio errors into the exact required messages from Section 34:
  /// - If MongoDB is offline: "Database connection unavailable. Please start MongoDB and try again."
  /// - If backend is offline: "Unable to connect to server."
  static String parseError(Object error) {
    if (error is DioException) {
      if (error.response != null) {
        final data = error.response?.data;
        if (error.response?.statusCode == 503 ||
            (data is Map &&
                (data['code'] == 'DB_UNAVAILABLE' || data['database'] == 'disconnected'))) {
          return 'Database connection unavailable. Please start MongoDB and try again.';
        }
        if (data is Map && data['message'] != null) {
          return data['message'].toString();
        }
        return 'Request failed (${error.response?.statusCode})';
      }
      return 'Unable to connect to server.';
    }
    return error.toString();
  }
}
