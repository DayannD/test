import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../views/success_page.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class LoginViewModel with ChangeNotifier {
  final AuthService _authService = AuthService();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final _storage = const FlutterSecureStorage();

  // État du formulaire
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  // Erreurs de validation
  String? _emailError;
  String? _passwordError;
  String? get emailError => _emailError;
  String? get passwordError => _passwordError;

  // Méthode pour valider les champs
  bool _validateFields() {
    bool isValid = true;
    _emailError = null;
    _passwordError = null;

    if (emailController.text.isEmpty) {
      _emailError = "L'email est obligatoire";
      isValid = false;
    } else if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(emailController.text)) {
      _emailError = "Email invalide";
      isValid = false;
    }

    if (passwordController.text.isEmpty) {
      _passwordError = "Le mot de passe est obligatoire";
      isValid = false;
    } else if (passwordController.text.length < 6) {
      _passwordError = "Le mot de passe est incorècte (min 6 caractère)";
      isValid = false;
    }

    notifyListeners();
    return isValid;
  }

  // Méthode pour se connecter
  Future<void> login(BuildContext context) async {

    if (!_validateFields()) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final result = await _authService.login(
      emailController.text,
      passwordController.text,
    );

    _isLoading = false;
    if (result['success']) {
      // Sauvegarder le token
      final String accessTokenAPI = result['data']['accessToken'];
      final String refreshTokenAPI = result['data']['refreshToken'];
      await _storage.write(key: 'accessToken', value: accessTokenAPI);
      await _storage.write(key: 'refreshToken', value: refreshTokenAPI);

      // Redirection vers la page d'accueil
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => SuccessPage()),
      );
    } else {
      _errorMessage = result['message'];
      notifyListeners();
    }

    // Nettoyer les controllers
    @override
    void dispose() {
      emailController.dispose();
      passwordController.dispose();
      super.dispose();
    }
  }
}
