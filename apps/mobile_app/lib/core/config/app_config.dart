import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';
  
  // Configuration PostgreSQL (si nécessaire)
  static String get postgresHost => dotenv.env['POSTGRES_HOST'] ?? 'localhost';
  static int get postgresPort => int.parse(dotenv.env['POSTGRES_PORT'] ?? '5432');
  static String get postgresDb => dotenv.env['POSTGRES_DB'] ?? 'beesure_db';
  static String get postgresUser => dotenv.env['POSTGRES_USER'] ?? '';
  static String get postgresPassword => dotenv.env['POSTGRES_PASSWORD'] ?? '';
  
  // Configuration MongoDB (si nécessaire)
  static String get mongoHost => dotenv.env['MONGO_HOST'] ?? 'localhost';
  static int get mongoPort => int.parse(dotenv.env['MONGO_PORT'] ?? '27017');
  static String get mongoDb => dotenv.env['MONGO_DB'] ?? 'beesure_mongo';
  static String get mongoUser => dotenv.env['MONGO_USER'] ?? '';
  static String get mongoPassword => dotenv.env['MONGO_PASSWORD'] ?? '';
  
  static String get environment => dotenv.env['ENVIRONMENT'] ?? 'development';
  
  static bool get isDevelopment => environment == 'development';
  static bool get isProduction => environment == 'production';
}