import '../models/models.dart';
import '../services/api_service.dart';

class UnikaiRepository {
  final ApiService _api;

  UnikaiRepository(this._api);

  // Health Check
  Future<Map<String, dynamic>> checkHealth() async {
    try {
      final res = await _api.client.get('/health');
      return Map<String, dynamic>.from(res.data);
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  // Salesman
  Future<SalesmanModel> getSalesman() async {
    try {
      final res = await _api.client.get('/salesman');
      return SalesmanModel.fromJson(res.data['salesman']);
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  // Categories
  Future<List<CategoryModel>> getCategories() async {
    try {
      final res = await _api.client.get('/categories');
      final list = (res.data['categories'] as List?) ?? [];
      return list.map((e) => CategoryModel.fromJson(Map<String, dynamic>.from(e))).toList();
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  // Brands
  Future<List<BrandModel>> getBrands() async {
    try {
      final res = await _api.client.get('/brands');
      final list = (res.data['brands'] as List?) ?? [];
      return list.map((e) => BrandModel.fromJson(Map<String, dynamic>.from(e))).toList();
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  // Products
  Future<List<ProductModel>> getProducts({
    String? search,
    String? category,
    String? brand,
    String? size,
    bool? isFeatured,
    bool? isPopular,
    String sort = 'newest',
    int limit = 50,
  }) async {
    try {
      final params = <String, dynamic>{
        'limit': limit,
        'sort': sort,
      };
      if (search != null && search.trim().isNotEmpty) params['search'] = search.trim();
      if (category != null && category.isNotEmpty) params['category'] = category;
      if (brand != null && brand.isNotEmpty) params['brand'] = brand;
      if (size != null && size.isNotEmpty) params['size'] = size;
      if (isFeatured == true) params['isFeatured'] = 'true';
      if (isPopular == true) params['isPopular'] = 'true';

      final res = await _api.client.get('/products', queryParameters: params);
      final list = (res.data['products'] as List?) ?? [];
      return list.map((e) => ProductModel.fromJson(Map<String, dynamic>.from(e))).toList();
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  Future<ProductModel> getProductBySlugOrId(String slugOrId) async {
    try {
      final res = await _api.client.get('/products/$slugOrId');
      return ProductModel.fromJson(Map<String, dynamic>.from(res.data['product']));
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  // Auth
  Future<UserModel> login(String email, String password) async {
    try {
      final res = await _api.client.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      final token = res.data['token']?.toString() ?? '';
      await ApiService.saveToken(token);
      return UserModel.fromJson(Map<String, dynamic>.from(res.data['user']));
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  Future<UserModel> register({
    required String name,
    required String companyName,
    required String email,
    required String phone,
    required String password,
    required String street,
    required String city,
  }) async {
    try {
      final res = await _api.client.post('/auth/register', data: {
        'name': name,
        'companyName': companyName,
        'email': email,
        'phone': phone,
        'password': password,
        'address': street.isNotEmpty
            ? {
                'label': 'Primary Warehouse',
                'companyName': companyName,
                'street': street,
                'city': city,
                'country': 'Oman',
              }
            : null,
      });
      final token = res.data['token']?.toString() ?? '';
      await ApiService.saveToken(token);
      return UserModel.fromJson(Map<String, dynamic>.from(res.data['user']));
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  Future<UserModel?> getMe() async {
    final token = await ApiService.getToken();
    if (token == null || token.isEmpty) return null;
    try {
      final res = await _api.client.get('/auth/me');
      return UserModel.fromJson(Map<String, dynamic>.from(res.data['user']));
    } catch (_) {
      return null;
    }
  }

  Future<String> requestPasswordReset(String email) async {
    try {
      final res = await _api.client.post('/auth/forgot-password', data: {'email': email});
      return (res.data['resetToken'] ?? '').toString();
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  Future<void> resetPassword({
    required String email,
    required String resetToken,
    required String newPassword,
  }) async {
    try {
      await _api.client.post('/auth/reset-password', data: {
        'email': email,
        'resetToken': resetToken,
        'newPassword': newPassword,
      });
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  Future<void> logout() async {
    try {
      await _api.client.post('/auth/logout');
    } catch (_) {}
    await ApiService.clearToken();
  }

  // Addresses
  Future<List<AddressModel>> getAddresses() async {
    try {
      final res = await _api.client.get('/users/addresses');
      final list = (res.data['addresses'] as List?) ?? [];
      return list.map((e) => AddressModel.fromJson(Map<String, dynamic>.from(e))).toList();
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  Future<List<AddressModel>> addAddress({
    required String label,
    required String companyName,
    required String fullName,
    required String phone,
    required String street,
    required String city,
    bool isDefault = true,
  }) async {
    try {
      final res = await _api.client.post('/users/addresses', data: {
        'label': label,
        'companyName': companyName,
        'fullName': fullName,
        'phone': phone,
        'street': street,
        'city': city,
        'country': 'Oman',
        'isDefault': isDefault,
      });
      final list = (res.data['addresses'] as List?) ?? [];
      return list.map((e) => AddressModel.fromJson(Map<String, dynamic>.from(e))).toList();
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  Future<List<AddressModel>> deleteAddress(String id) async {
    try {
      final res = await _api.client.delete('/users/addresses/$id');
      final list = (res.data['addresses'] as List?) ?? [];
      return list.map((e) => AddressModel.fromJson(Map<String, dynamic>.from(e))).toList();
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  // Orders & WhatsApp
  Future<Map<String, dynamic>> createOrder({
    required String customerName,
    required String customerPhone,
    required String street,
    required String city,
    required List<CartItemModel> items,
    String orderChannel = 'FLUTTER',
    String notes = '',
  }) async {
    try {
      final res = await _api.client.post('/orders', data: {
        'customerName': customerName,
        'customerPhone': customerPhone,
        'address': {
          'fullName': customerName,
          'phone': customerPhone,
          'street': street,
          'city': city,
          'country': 'Oman',
        },
        'orderChannel': orderChannel,
        'notes': notes,
        'items': items
            .map((i) => {
                  'productId': i.productId,
                  'size': i.size,
                  'quantity': i.quantity,
                })
            .toList(),
      });
      return Map<String, dynamic>.from(res.data);
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  Future<Map<String, dynamic>> generateWhatsAppPreview({
    required List<CartItemModel> items,
    required String customerName,
    required String customerPhone,
    required String address,
  }) async {
    try {
      final res = await _api.client.post('/orders/whatsapp-preview', data: {
        'items': items.map((i) => i.toJson()).toList(),
        'customer': {
          'name': customerName,
          'phone': customerPhone,
          'address': address,
        },
      });
      return Map<String, dynamic>.from(res.data['whatsapp']);
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  Future<List<OrderModel>> getMyOrders() async {
    try {
      final res = await _api.client.get('/orders/my-orders');
      final list = (res.data['orders'] as List?) ?? [];
      return list.map((e) => OrderModel.fromJson(Map<String, dynamic>.from(e))).toList();
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }

  Future<OrderModel> getOrderById(String id) async {
    try {
      final res = await _api.client.get('/orders/$id');
      return OrderModel.fromJson(Map<String, dynamic>.from(res.data['order']));
    } catch (e) {
      throw ApiService.parseError(e);
    }
  }
}
