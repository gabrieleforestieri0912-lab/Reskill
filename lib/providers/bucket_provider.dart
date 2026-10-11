import 'package:flutter/foundation.dart';

import '../models/bucket.dart';
import '../services/api_client.dart';

/// Stato dei bucket dell'utente e delle operazioni CRUD correlate.
class BucketProvider extends ChangeNotifier {
  List<Bucket> _buckets = [];
  bool _loading = false;
  String? _error;

  List<Bucket> get buckets => _buckets;
  bool get loading => _loading;
  String? get error => _error;

  Bucket? byId(String id) {
    try {
      return _buckets.firstWhere((b) => b.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<void> fetch() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      _buckets = await Api.instance.getBuckets();
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Errore di rete';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<Bucket> create(String name, String description) async {
    final bucket = await Api.instance.createBucket(name, description);
    _buckets = [bucket, ..._buckets];
    notifyListeners();
    return bucket;
  }

  Future<void> delete(String id) async {
    await Api.instance.deleteBucket(id);
    _buckets = _buckets.where((b) => b.id != id).toList();
    notifyListeners();
  }

  /// Aggiorna un bucket nella lista locale dopo la generazione della Skill.
  void updateLocal(Bucket updated) {
    _buckets = _buckets.map((b) => b.id == updated.id ? updated : b).toList();
    notifyListeners();
  }

  void replace(Bucket bucket) => updateLocal(bucket);

  /// Aggiunge una fonte e ritorna il bucket aggiornato.
  Future<Bucket> addSource(String bucketId, Map<String, dynamic> fields) async {
    await Api.instance.addSource(bucketId, fields);
    // Ricarica il bucket singolo (le fonti sono incluse dallo backend).
    final refreshed = await _fetchBucketById(bucketId);
    if (refreshed != null) updateLocal(refreshed);
    return refreshed!;
  }

  Future<void> deleteSource(String bucketId, String sourceId) async {
    await Api.instance.deleteSource(sourceId);
    final refreshed = await _fetchBucketById(bucketId);
    if (refreshed != null) updateLocal(refreshed);
  }

  Future<Bucket?> _fetchBucketById(String id) async {
    try {
      final all = await Api.instance.getBuckets();
      return all.firstWhere((b) => b.id == id);
    } catch (_) {
      return null;
    }
  }
}
