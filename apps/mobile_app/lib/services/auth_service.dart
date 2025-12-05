import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';


class AuthService {
  final String _baseUrl = dotenv.get('API_BASE_URL');


  // Méthode pour se connecter
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'identifier': email,
          'password': password,
        }),
      );

      // Vérifie le statut de la réponse
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data};
      } else {
        final errorData = jsonDecode(response.body);
        return {'success': false, 'message': errorData['message'] ?? 'Échec de la connexion'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur réseau : $e'};
    }
  }

  // Méthode pour s'inscrire (à utiliser dans SignupViewModel)
  Future<Map<String, dynamic>> signup({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/signup'),
        headers: {
          'Content-Type': 'application/json',
          'Content-length': '700'
        },
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'phone': phone,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data};
       } else {
        final errorData = jsonDecode(response.body);
        final message = errorData['message'];

        String messageStr;
        if (message is List) {
          messageStr = message.join(', '); // convertit la liste en String
        } else {
          messageStr = message?.toString() ?? 'Échec de l\'inscription';
        }

        return {'success': false, 'message': messageStr};      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur réseau : $e'};
    }
  }

  // Méthode pour sauvegarder le token (ex: dans SharedPreferences)
  Future<void> saveToken(String token) async {
    // Ici, tu peux utiliser shared_preferences pour stocker le token
    // Exemple :
    // final prefs = await SharedPreferences.getInstance();
    // await prefs.setString('auth_token', token);
  }

  // Méthode pour récupérer le token
  Future<String?> getToken() async {
    // Exemple :
    // final prefs = await SharedPreferences.getInstance();
    // return prefs.getString('auth_token');
    return null;
  }
}
