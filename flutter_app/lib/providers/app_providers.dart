import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../repositories/unikai_repository.dart';

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

final repositoryProvider = Provider<UnikaiRepository>((ref) {
  return UnikaiRepository(ref.watch(apiServiceProvider));
});

// Salesman Provider (fetches Sachin info from /api/salesman)
final salesmanProvider = FutureProvider<SalesmanModel>((ref) async {
  return ref.watch(repositoryProvider).getSalesman();
});

// Categories Provider (fetches from /api/categories)
final categoriesProvider = FutureProvider<List<CategoryModel>>((ref) async {
  return ref.watch(repositoryProvider).getCategories();
});

// Brands Provider (fetches from /api/brands)
final brandsProvider = FutureProvider<List<BrandModel>>((ref) async {
  return ref.watch(repositoryProvider).getBrands();
});

// Featured Products Provider
final featuredProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  return ref.watch(repositoryProvider).getProducts(isFeatured: true, limit: 12);
});

// All Products Provider
final allProductsProvider = FutureProvider<List<ProductModel>>((ref) async {
  return ref.watch(repositoryProvider).getProducts(limit: 100);
});

// Auth State Notifier
class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;
}

class AuthNotifier extends StateNotifier<AuthState> {
  final UnikaiRepository _repo;

  AuthNotifier(this._repo) : super(const AuthState(isLoading: true)) {
    loadCurrentUser();
  }

  Future<void> loadCurrentUser() async {
    state = const AuthState(isLoading: true);
    final user = await _repo.getMe();
    state = AuthState(user: user, isLoading: false);
  }

  Future<bool> login(String email, String password) async {
    state = AuthState(user: state.user, isLoading: true);
    try {
      final user = await _repo.login(email, password);
      state = AuthState(user: user, isLoading: false);
      return true;
    } catch (e) {
      state = AuthState(user: null, isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String companyName,
    required String email,
    required String phone,
    required String password,
    required String street,
    required String city,
  }) async {
    state = AuthState(user: state.user, isLoading: true);
    try {
      final user = await _repo.register(
        name: name,
        companyName: companyName,
        email: email,
        phone: phone,
        password: password,
        street: street,
        city: city,
      );
      state = AuthState(user: user, isLoading: false);
      return true;
    } catch (e) {
      state = AuthState(user: null, isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthState(user: null, isLoading: false);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(repositoryProvider));
});

// Cart State Notifier (persists in SharedPreferences & syncs with order flow)
class CartNotifier extends StateNotifier<List<CartItemModel>> {
  static const String _cartPrefsKey = 'unikai_flutter_cart';

  CartNotifier() : super([]) {
    _loadLocalCart();
  }

  Future<void> _loadLocalCart() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_cartPrefsKey);
    if (raw != null && raw.isNotEmpty) {
      try {
        final decoded = jsonDecode(raw) as List;
        state = decoded
            .map((e) => CartItemModel.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      } catch (_) {}
    }
  }

  Future<void> _saveLocalCart() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _cartPrefsKey,
      jsonEncode(state.map((e) => e.toJson()).toList()),
    );
  }

  void addItem(ProductModel product, String size, int quantity) {
    final selectedSize = size.trim().isNotEmpty
        ? size.trim()
        : (product.sizes.isNotEmpty ? product.sizes.first : '');
    final idx = state.indexWhere(
      (i) => i.productId == product.id && i.size == selectedSize,
    );

    if (idx > -1) {
      final updated = [...state];
      updated[idx] = updated[idx].copyWith(quantity: updated[idx].quantity + quantity);
      state = updated;
    } else {
      state = [
        ...state,
        CartItemModel(
          productId: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          image: product.primaryImage ?? '',
          size: selectedSize,
          sellingPrice: product.sellingPrice,
          invoicePrice: product.invoicePrice,
          quantity: quantity,
        ),
      ];
    }
    _saveLocalCart();
  }

  void updateQuantity(String productId, String size, int quantity) {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }
    state = state.map((item) {
      if (item.productId == productId && item.size == size) {
        return item.copyWith(quantity: quantity);
      }
      return item;
    }).toList();
    _saveLocalCart();
  }

  void removeItem(String productId, String size) {
    state = state
        .where((item) => !(item.productId == productId && item.size == size))
        .toList();
    _saveLocalCart();
  }

  void clearCart() {
    state = [];
    _saveLocalCart();
  }

  int get totalQuantity => state.fold(0, (sum, i) => sum + i.quantity);

  double? get totalAmount {
    final sum = state.fold<double>(0.0, (acc, i) => acc + (i.subtotal ?? 0.0));
    if (sum <= 0) return null;
    return double.parse(sum.toStringAsFixed(3));
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItemModel>>((ref) {
  return CartNotifier();
});
