import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../views/login_page.dart';


class SignupViewModel with ChangeNotifier {
  final AuthService _authService = AuthService();
  final TextEditingController firstNameController = TextEditingController();
  final TextEditingController lastNameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController countryCodeController = TextEditingController(text: '+33');
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  // État du formulaire
  bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _obscurePassword = true;
  bool get obscurePassword => _obscurePassword;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  // Erreurs de validation
  String? _firstNameError;
  String? _lastNameError;
  String? _emailError;
  String? _phoneError;
  String? _passwordError;

  String? get firstNameError => _firstNameError;
  String? get lastNameError => _lastNameError;
  String? get emailError => _emailError;
  String? get phoneError => _phoneError;
  String? get passwordError => _passwordError;

  // Méthode pour valider les champs
  bool _validateFields() {
    bool isValid = true;
    _firstNameError = null;
    _lastNameError = null;
    _emailError = null;
    _phoneError = null;
    _passwordError = null;

    if (firstNameController.text.isEmpty) {
      _firstNameError = "Le prénom est obligatoire";
      isValid = false;
    }

    if (lastNameController.text.isEmpty) {
      _lastNameError = "Le nom est obligatoire";
      isValid = false;
    }

    if (emailController.text.isEmpty) {
      _emailError = "L'email est obligatoire";
      isValid = false;
    } else if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(emailController.text)) {
      _emailError = "Email invalide";
      isValid = false;
    }

    if (phoneController.text.isEmpty) {
      _phoneError = "Le numéro de téléphone est obligatoire";
      isValid = false;
    } else if (!RegExp(r'^0[0-9]{9}$').hasMatch(phoneController.text)) {
      _phoneError = "Numéro de téléphone invalide";
      isValid = false;
    }

    if (passwordController.text.isEmpty) {
      _passwordError = "Le mot de passe est obligatoire";
      isValid = false;
    } else if (passwordController.text.length < 6) {
      _passwordError = "Le mot de passe est incorècte";
      isValid = false;
    }

    notifyListeners();
    return isValid;
  }

  // Méthode pour s'inscrire
  Future<void> signup(BuildContext context) async {
    if (!_validateFields()) return;

    _isLoading = true;
    notifyListeners();

    final result = await _authService.signup(
      firstName: firstNameController.text,
      lastName: lastNameController.text,
      email: emailController.text,
      phone: '${countryCodeController.text}${phoneController.text}',
      password: passwordController.text,
    );


    _isLoading = false;

    if (result['success']) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => LoginPage()),
      );
    } else {
      _errorMessage = result['message'];
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_errorMessage!),
          backgroundColor: Colors.redAccent,
        ),
      );
      notifyListeners();
    }
  }

  void togglePasswordVisibility() {
    _obscurePassword = !_obscurePassword;
    notifyListeners();
  }

  // Nettoyer les controllers
  @override
  void dispose() {
    firstNameController.dispose();
    lastNameController.dispose();
    emailController.dispose();
    countryCodeController.dispose();
    phoneController.dispose();
    passwordController.dispose();
    super.dispose();
  }
}
