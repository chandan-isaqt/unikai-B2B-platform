class NutritionItemModel {
  final String name;
  final String value;

  const NutritionItemModel({
    required this.name,
    required this.value,
  });

  factory NutritionItemModel.fromJson(Map<String, dynamic> json) {
    return NutritionItemModel(
      name: (json['name'] ?? json['label'] ?? '').toString().trim(),
      value: (json['value'] ?? '').toString().trim(),
    );
  }
}

class AdditionalInfoItemModel {
  final String label;
  final String value;

  const AdditionalInfoItemModel({
    required this.label,
    required this.value,
  });

  factory AdditionalInfoItemModel.fromJson(Map<String, dynamic> json) {
    return AdditionalInfoItemModel(
      label: (json['label'] ?? json['name'] ?? '').toString().trim(),
      value: (json['value'] ?? '').toString().trim(),
    );
  }
}

class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String description;
  final int productCount;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description = '',
    this.productCount = 0,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      slug: (json['slug'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      productCount: int.tryParse((json['productCount'] ?? 0).toString()) ?? 0,
    );
  }
}

class BrandModel {
  final String id;
  final String name;
  final String slug;
  final String tagline;
  final String description;
  final String origin;
  final int productCount;

  const BrandModel({
    required this.id,
    required this.name,
    required this.slug,
    this.tagline = '',
    this.description = '',
    this.origin = 'GCC',
    this.productCount = 0,
  });

  factory BrandModel.fromJson(Map<String, dynamic> json) {
    return BrandModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      slug: (json['slug'] ?? '').toString(),
      tagline: (json['tagline'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      origin: (json['origin'] ?? 'GCC').toString(),
      productCount: int.tryParse((json['productCount'] ?? 0).toString()) ?? 0,
    );
  }
}

double? _parseNullablePositiveDouble(dynamic raw) {
  if (raw == null) return null;
  final str = raw.toString().trim();
  if (str.isEmpty || str == 'null') return null;
  final parsed = double.tryParse(str);
  if (parsed == null || parsed.isNaN || parsed <= 0) return null;
  return parsed;
}

int? _parseNullableInt(dynamic raw) {
  if (raw == null) return null;
  final str = raw.toString().trim();
  if (str.isEmpty || str == 'null') return null;
  final parsed = int.tryParse(str);
  if (parsed == null || parsed < 0) return null;
  return parsed;
}

class ProductModel {
  final String id;
  final String name;
  final String slug;
  final String sku;
  final String sourceUrl;
  final String sourceImageUrl;
  final String categoryName;
  final String categorySlug;
  final String subCategory;
  final String brandName;
  final String brandSlug;
  final List<String> images;
  final List<String> sizes;
  final String servingSize;
  final String description;
  final double? sellingPrice;
  final double? invoicePrice;
  final List<NutritionItemModel> nutrition;
  final String ingredients;
  final List<AdditionalInfoItemModel> additionalInformation;
  final int? stock;
  final bool isFeatured;
  final bool isPopular;
  final bool isActive;

  const ProductModel({
    required this.id,
    required this.name,
    required this.slug,
    this.sku = '',
    this.sourceUrl = '',
    this.sourceImageUrl = '',
    this.categoryName = '',
    this.categorySlug = '',
    this.subCategory = '',
    this.brandName = '',
    this.brandSlug = '',
    this.images = const [],
    this.sizes = const [],
    this.servingSize = '',
    this.description = '',
    this.sellingPrice,
    this.invoicePrice,
    this.nutrition = const [],
    this.ingredients = '',
    this.additionalInformation = const [],
    this.stock,
    this.isFeatured = false,
    this.isPopular = false,
    this.isActive = true,
  });

  double? get price => sellingPrice;

  String? get primaryImage {
    if (images.isNotEmpty && images.first.trim().isNotEmpty) {
      return images.first.trim();
    }
    if (sourceImageUrl.trim().isNotEmpty) {
      return sourceImageUrl.trim();
    }
    return null;
  }

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final cat = json['category'];
    final br = json['brand'];

    final rawNutri = json['nutrition'];
    final parsedNutrition = <NutritionItemModel>[];
    if (rawNutri is List) {
      for (final item in rawNutri) {
        if (item is Map) {
          final model = NutritionItemModel.fromJson(Map<String, dynamic>.from(item));
          if (model.name.isNotEmpty && model.value.isNotEmpty) {
            parsedNutrition.add(model);
          }
        }
      }
    }

    final rawAddInfo = json['additionalInformation'];
    final parsedAddInfo = <AdditionalInfoItemModel>[];
    if (rawAddInfo is List) {
      for (final item in rawAddInfo) {
        if (item is Map) {
          final model = AdditionalInfoItemModel.fromJson(Map<String, dynamic>.from(item));
          if (model.label.isNotEmpty && model.value.isNotEmpty) {
            parsedAddInfo.add(model);
          }
        }
      }
    }

    final rawImages = (json['images'] as List?)
            ?.map((e) => e.toString().trim())
            .where((s) => s.isNotEmpty)
            .toList() ??
        [];
    final srcImg = (json['sourceImageUrl'] ?? '').toString().trim();
    if (rawImages.isEmpty && srcImg.isNotEmpty) {
      rawImages.add(srcImg);
    }

    final rawSizes = (json['sizes'] as List?)
            ?.map((e) => e.toString().trim())
            .where((s) => s.isNotEmpty)
            .toList() ??
        [];

    return ProductModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      slug: (json['slug'] ?? '').toString(),
      sku: (json['sku'] ?? '').toString(),
      sourceUrl: (json['sourceUrl'] ?? '').toString(),
      sourceImageUrl: srcImg,
      categoryName: cat is Map ? (cat['name'] ?? '').toString() : '',
      categorySlug: cat is Map ? (cat['slug'] ?? '').toString() : '',
      subCategory: (json['subCategory'] ?? '').toString(),
      brandName: br is Map ? (br['name'] ?? '').toString() : '',
      brandSlug: br is Map ? (br['slug'] ?? '').toString() : '',
      images: rawImages,
      sizes: rawSizes,
      servingSize: (json['servingSize'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      sellingPrice: _parseNullablePositiveDouble(json['sellingPrice'] ?? json['price']),
      invoicePrice: _parseNullablePositiveDouble(json['invoicePrice']),
      nutrition: parsedNutrition,
      ingredients: (json['ingredients'] ?? '').toString(),
      additionalInformation: parsedAddInfo,
      stock: _parseNullableInt(json['stock']),
      isFeatured: json['isFeatured'] == true,
      isPopular: json['isPopular'] == true,
      isActive: json['isActive'] != false,
    );
  }
}

class AddressModel {
  final String id;
  final String label;
  final String companyName;
  final String fullName;
  final String phone;
  final String street;
  final String area;
  final String city;
  final String country;
  final bool isDefault;

  const AddressModel({
    required this.id,
    this.label = 'Primary Warehouse',
    this.companyName = '',
    required this.fullName,
    required this.phone,
    required this.street,
    this.area = '',
    this.city = 'Muscat',
    this.country = 'Oman',
    this.isDefault = false,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      label: (json['label'] ?? 'Delivery Address').toString(),
      companyName: (json['companyName'] ?? '').toString(),
      fullName: (json['fullName'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      street: (json['street'] ?? '').toString(),
      area: (json['area'] ?? '').toString(),
      city: (json['city'] ?? 'Muscat').toString(),
      country: (json['country'] ?? 'Oman').toString(),
      isDefault: json['isDefault'] == true,
    );
  }
}

class UserModel {
  final String id;
  final String name;
  final String companyName;
  final String email;
  final String phone;
  final String role;
  final String? lastLoginAt;
  final List<AddressModel> addresses;

  const UserModel({
    required this.id,
    required this.name,
    this.companyName = '',
    required this.email,
    this.phone = '',
    this.role = 'CUSTOMER',
    this.lastLoginAt,
    this.addresses = const [],
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final addrList = (json['addresses'] as List?)
            ?.whereType<Map<String, dynamic>>()
            .map(AddressModel.fromJson)
            .toList() ??
        [];

    return UserModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      companyName: (json['companyName'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      role: (json['role'] ?? 'CUSTOMER').toString(),
      lastLoginAt: json['lastLoginAt']?.toString(),
      addresses: addrList,
    );
  }
}

class CartItemModel {
  final String productId;
  final String name;
  final String slug;
  final String sku;
  final String image;
  final String size;
  final double? sellingPrice;
  final double? invoicePrice;
  final int quantity;

  const CartItemModel({
    required this.productId,
    required this.name,
    this.slug = '',
    this.sku = '',
    this.image = '',
    this.size = '',
    this.sellingPrice,
    this.invoicePrice,
    required this.quantity,
  });

  double? get price => sellingPrice;

  double? get subtotal {
    if (sellingPrice == null || sellingPrice! <= 0) return null;
    return double.parse((sellingPrice! * quantity).toStringAsFixed(3));
  }

  CartItemModel copyWith({int? quantity}) {
    return CartItemModel(
      productId: productId,
      name: name,
      slug: slug,
      sku: sku,
      image: image,
      size: size,
      sellingPrice: sellingPrice,
      invoicePrice: invoicePrice,
      quantity: quantity ?? this.quantity,
    );
  }

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'name': name,
        'slug': slug,
        'sku': sku,
        'image': image,
        'size': size,
        'sellingPrice': sellingPrice,
        'price': sellingPrice,
        'invoicePrice': invoicePrice,
        'quantity': quantity,
      };

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    final prod = json['product'];
    return CartItemModel(
      productId: (json['productId'] ?? (prod is Map ? prod['_id'] : prod) ?? '').toString(),
      name: (json['name'] ?? (prod is Map ? prod['name'] : '') ?? '').toString(),
      slug: (json['slug'] ?? (prod is Map ? prod['slug'] : '') ?? '').toString(),
      sku: (json['sku'] ?? (prod is Map ? prod['sku'] : '') ?? '').toString(),
      image: (json['image'] ??
              (prod is Map && (prod['images'] as List?)?.isNotEmpty == true
                  ? prod['images'][0]
                  : (prod is Map ? prod['sourceImageUrl'] : '')) ??
              '')
          .toString(),
      size: (json['size'] ?? '').toString(),
      sellingPrice: _parseNullablePositiveDouble(json['sellingPrice'] ?? json['price']),
      invoicePrice: _parseNullablePositiveDouble(json['invoicePrice']),
      quantity: int.tryParse((json['quantity'] ?? 1).toString()) ?? 1,
    );
  }
}

class OrderItemModel {
  final String productName;
  final String size;
  final double? sellingPrice;
  final double? invoicePrice;
  final int quantity;
  final double? subtotal;
  final String image;

  const OrderItemModel({
    required this.productName,
    this.size = '',
    this.sellingPrice,
    this.invoicePrice,
    required this.quantity,
    this.subtotal,
    this.image = '',
  });

  double? get price => sellingPrice;

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      productName: (json['productName'] ?? '').toString(),
      size: (json['size'] ?? '').toString(),
      sellingPrice: _parseNullablePositiveDouble(json['sellingPrice'] ?? json['price']),
      invoicePrice: _parseNullablePositiveDouble(json['invoicePrice']),
      quantity: int.tryParse((json['quantity'] ?? 1).toString()) ?? 1,
      subtotal: _parseNullablePositiveDouble(json['subtotal']),
      image: (json['image'] ?? '').toString(),
    );
  }
}

class OrderModel {
  final String id;
  final String orderNumber;
  final String customerName;
  final String customerPhone;
  final String addressText;
  final List<OrderItemModel> items;
  final int totalQuantity;
  final double? total;
  final String status;
  final String orderChannel;
  final String createdAt;

  const OrderModel({
    required this.id,
    required this.orderNumber,
    required this.customerName,
    required this.customerPhone,
    required this.addressText,
    required this.items,
    required this.totalQuantity,
    this.total,
    required this.status,
    this.orderChannel = 'FLUTTER',
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final addr = json['address'];
    final addrStr = addr is Map
        ? '${addr['street'] ?? ''}, ${addr['city'] ?? 'Muscat'}, ${addr['country'] ?? 'Oman'}'
        : 'Muscat, Oman';

    return OrderModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      orderNumber: (json['orderNumber'] ?? '').toString(),
      customerName: (json['customerName'] ?? '').toString(),
      customerPhone: (json['customerPhone'] ?? '').toString(),
      addressText: addrStr,
      items: (json['items'] as List?)
              ?.whereType<Map<String, dynamic>>()
              .map(OrderItemModel.fromJson)
              .toList() ??
          [],
      totalQuantity: int.tryParse((json['totalQuantity'] ?? 0).toString()) ?? 0,
      total: _parseNullablePositiveDouble(json['total']),
      status: (json['status'] ?? 'Pending').toString(),
      orderChannel: (json['orderChannel'] ?? 'FLUTTER').toString(),
      createdAt: (json['createdAt'] ?? '').toString(),
    );
  }
}

class SalesmanModel {
  final String name;
  final String title;
  final String phone;
  final String whatsappNumber;
  final String email;
  final String region;
  final String workingHours;
  final bool isActive;

  const SalesmanModel({
    this.name = 'Sachin',
    this.title = 'Senior B2B Sales Executive - Oman & GCC',
    this.phone = '+96891234567',
    this.whatsappNumber = '+96891234567',
    this.email = 'sachin.sales@unikai.local',
    this.region = 'Muscat, Oman & GCC',
    this.workingHours = 'Sun - Thu: 7:30 AM - 6:30 PM',
    this.isActive = true,
  });

  factory SalesmanModel.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const SalesmanModel();
    return SalesmanModel(
      name: (json['name'] ?? 'Sachin').toString(),
      title: (json['title'] ?? 'Senior B2B Sales Executive').toString(),
      phone: (json['phone'] ?? '+96891234567').toString(),
      whatsappNumber: (json['whatsappNumber'] ?? '+96891234567').toString(),
      email: (json['email'] ?? 'sachin.sales@unikai.local').toString(),
      region: (json['region'] ?? 'Muscat, Oman').toString(),
      workingHours: (json['workingHours'] ?? 'Sun - Thu: 7:30 AM - 6:30 PM').toString(),
      isActive: json['isActive'] != false,
    );
  }
}
