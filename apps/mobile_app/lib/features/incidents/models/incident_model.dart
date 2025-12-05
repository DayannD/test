import 'package:json_annotation/json_annotation.dart';
import '../../../core/models/base_model.dart';

part 'incident_model.g.dart';

@JsonSerializable()
class Incident extends BaseModel {
  final String? id;
  final String title;
  final String description;
  final String status;
  final String priority;
  final double? latitude;
  final double? longitude;
  final String? address;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? userId;
  final List<String>? images;
  final Map<String, dynamic>? metadata;

  Incident({
    this.id,
    required this.title,
    required this.description,
    this.status = 'open',
    this.priority = 'medium',
    this.latitude,
    this.longitude,
    this.address,
    required this.createdAt,
    required this.updatedAt,
    this.userId,
    this.images,
    this.metadata,
  });

  factory Incident.fromJson(Map<String, dynamic> json) => _$IncidentFromJson(json);

  @override
  Map<String, dynamic> toJson() => _$IncidentToJson(this);

  // Méthode pour créer un nouvel incident
  factory Incident.create({
    required String title,
    required String description,
    String status = 'open',
    String priority = 'medium',
    double? latitude,
    double? longitude,
    String? address,
    String? userId,
    List<String>? images,
    Map<String, dynamic>? metadata,
  }) {
    final now = DateTime.now();
    return Incident(
      title: title,
      description: description,
      status: status,
      priority: priority,
      latitude: latitude,
      longitude: longitude,
      address: address,
      createdAt: now,
      updatedAt: now,
      userId: userId,
      images: images,
      metadata: metadata,
    );
  }

  // Méthode pour copier avec des modifications
  Incident copyWith({
    String? id,
    String? title,
    String? description,
    String? status,
    String? priority,
    double? latitude,
    double? longitude,
    String? address,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? userId,
    List<String>? images,
    Map<String, dynamic>? metadata,
  }) {
    return Incident(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      userId: userId ?? this.userId,
      images: images ?? this.images,
      metadata: metadata ?? this.metadata,
    );
  }

  // Getters utiles
  bool get hasLocation => latitude != null && longitude != null;
  bool get hasImages => images != null && images!.isNotEmpty;
  bool get isOpen => status == 'open';
  bool get isClosed => status == 'closed';
  bool get isInProgress => status == 'in_progress';
  
  String get priorityLabel {
    switch (priority) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyen';
      case 'high':
        return 'Élevé';
      case 'urgent':
        return 'Urgent';
      default:
        return 'Moyen';
    }
  }

  String get statusLabel {
    switch (status) {
      case 'open':
        return 'Ouvert';
      case 'in_progress':
        return 'En cours';
      case 'closed':
        return 'Fermé';
      default:
        return 'Ouvert';
    }
  }
}