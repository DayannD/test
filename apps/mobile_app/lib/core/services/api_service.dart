import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import '../config/app_config.dart';

class ApiService {
  static final Logger _logger = Logger();
  static const Duration _timeout = Duration(seconds: 30);

  static String get _baseUrl => AppConfig.apiBaseUrl;

  // Headers par défaut
  static Map<String, String> get _defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // GET Request
  static Future<Map<String, dynamic>> get(String endpoint, {Map<String, String>? headers}) async {
    try {
      final url = Uri.parse('$_baseUrl$endpoint');
      _logger.d('GET: $url');

      final response = await http
          .get(url, headers: {..._defaultHeaders, ...?headers})
          .timeout(_timeout);

      return _handleResponse(response);
    } catch (e) {
      _logger.e('GET Error: $e');
      rethrow;
    }
  }

  // POST Request
  static Future<Map<String, dynamic>> post(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final url = Uri.parse('$_baseUrl$endpoint');
      _logger.d('POST: $url');
      _logger.d('Body: $body');

      final response = await http
          .post(
            url,
            headers: {..._defaultHeaders, ...?headers},
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeout);

      return _handleResponse(response);
    } catch (e) {
      _logger.e('POST Error: $e');
      rethrow;
    }
  }

  // PUT Request
  static Future<Map<String, dynamic>> put(
    String endpoint, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    try {
      final url = Uri.parse('$_baseUrl$endpoint');
      _logger.d('PUT: $url');

      final response = await http
          .put(
            url,
            headers: {..._defaultHeaders, ...?headers},
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeout);

      return _handleResponse(response);
    } catch (e) {
      _logger.e('PUT Error: $e');
      rethrow;
    }
  }

  // DELETE Request
  static Future<Map<String, dynamic>> delete(
    String endpoint, {
    Map<String, String>? headers,
  }) async {
    try {
      final url = Uri.parse('$_baseUrl$endpoint');
      _logger.d('DELETE: $url');

      final response = await http
          .delete(url, headers: {..._defaultHeaders, ...?headers})
          .timeout(_timeout);

      return _handleResponse(response);
    } catch (e) {
      _logger.e('DELETE Error: $e');
      rethrow;
    }
  }

  // Gestionnaire de réponse
  static Map<String, dynamic> _handleResponse(http.Response response) {
    _logger.d('Response Status: ${response.statusCode}');
    _logger.d('Response Body: ${response.body}');

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) {
        return {'success': true};
      }
      try {
        return jsonDecode(response.body);
      } catch (e) {
        _logger.w('Failed to decode JSON response: $e');
        return {'data': response.body};
      }
    } else {
      Map<String, dynamic> errorData;
      try {
        errorData = jsonDecode(response.body);
      } catch (e) {
        errorData = {'message': 'Erreur ${response.statusCode}'};
      }
      
      throw ApiException(
        statusCode: response.statusCode,
        message: errorData['message'] ?? 'Erreur inconnue',
        data: errorData,
      );
    }
  }
}

// Exception personnalisée pour les erreurs API
class ApiException implements Exception {
  final int statusCode;
  final String message;
  final Map<String, dynamic>? data;

  ApiException({
    required this.statusCode,
    required this.message,
    this.data,
  });

  @override
  String toString() => 'ApiException($statusCode): $message';
}