import '../../../core/services/api_service.dart';
import '../../../core/models/base_model.dart';
import '../models/incident_model.dart';

class IncidentService {
  static const String _endpoint = '/incidents';

  // Récupérer tous les incidents
  static Future<List<Incident>> getAllIncidents({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await ApiService.get('$_endpoint?page=$page&limit=$limit');
      
      if (response['data'] is List) {
        return (response['data'] as List)
            .map((json) => Incident.fromJson(json))
            .toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Erreur lors du chargement des incidents: $e');
    }
  }

  // Récupérer un incident par ID
  static Future<Incident> getIncidentById(String id) async {
    try {
      final response = await ApiService.get('$_endpoint/$id');
      return Incident.fromJson(response['data']);
    } catch (e) {
      throw Exception('Erreur lors du chargement de l\'incident: $e');
    }
  }

  // Créer un nouvel incident
  static Future<Incident> createIncident(Incident incident) async {
    try {
      final response = await ApiService.post(
        _endpoint,
        body: incident.toJson(),
      );
      return Incident.fromJson(response['data']);
    } catch (e) {
      throw Exception('Erreur lors de la création de l\'incident: $e');
    }
  }

  // Mettre à jour un incident
  static Future<Incident> updateIncident(String id, Incident incident) async {
    try {
      final response = await ApiService.put(
        '$_endpoint/$id',
        body: incident.toJson(),
      );
      return Incident.fromJson(response['data']);
    } catch (e) {
      throw Exception('Erreur lors de la mise à jour de l\'incident: $e');
    }
  }

  // Supprimer un incident
  static Future<void> deleteIncident(String id) async {
    try {
      await ApiService.delete('$_endpoint/$id');
    } catch (e) {
      throw Exception('Erreur lors de la suppression de l\'incident: $e');
    }
  }

  // Rechercher des incidents
  static Future<List<Incident>> searchIncidents(String query) async {
    try {
      final response = await ApiService.get('$_endpoint/search?q=$query');
      
      if (response['data'] is List) {
        return (response['data'] as List)
            .map((json) => Incident.fromJson(json))
            .toList();
      }
      
      return [];
    } catch (e) {
      throw Exception('Erreur lors de la recherche d\'incidents: $e');
    }
  }
}