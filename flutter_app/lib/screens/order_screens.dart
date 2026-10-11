import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/app_config.dart';
import '../models/models.dart';
import '../providers/app_providers.dart';
import '../theme/app_theme.dart';
import '../widgets/common_widgets.dart';

// 10. CART / ORDER BASKET SCREEN (Screen 6 in Showcase)
class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);
    final auth = ref.watch(authProvider);
    final totalQty = notifier.totalQuantity;
    final totalAmount = notifier.totalAmount;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Row(
          children: [
            const Text(
              'Order Basket',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
            ),
            if (totalQty > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: UnikaiTheme.sky,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$totalQty items',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (items.isNotEmpty)
            IconButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Clear Basket?'),
                    content: const Text('Are you sure you want to remove all items from your basket?'),
                    actions: [
                      TextButton(onPressed: () => ctx.pop(), child: const Text('Cancel')),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                        onPressed: () {
                          notifier.clearCart();
                          ctx.pop();
                        },
                        child: const Text('Clear All'),
                      ),
                    ],
                  ),
                );
              },
              icon: const Icon(Icons.delete_outline_rounded),
              tooltip: 'Clear Basket',
            ),
        ],
      ),
      body: items.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 84,
                      height: 84,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(
                        Icons.shopping_bag_outlined,
                        size: 44,
                        color: UnikaiTheme.sky,
                      ),
                    ),
                    const SizedBox(height: 18),
                    const Text(
                      'Your Order Basket is Empty',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: UnikaiTheme.navy,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Explore our official dairy, juices, ice cream and pantry catalogue to add items.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: UnikaiTheme.navy,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () => context.go('/products'),
                      child: const Text('Browse Catalogue', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ),
            )
          : Stack(
              children: [
                ListView(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
                  children: [
                    // Guest Notice (if not logged in)
                    if (!auth.isAuthenticated)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFBFDBFE)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline_rounded, color: UnikaiTheme.sky, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Ordering as Guest: Items are saved locally. You can log in anytime.',
                                style: TextStyle(fontSize: 12, color: Colors.blue.shade900, fontWeight: FontWeight.w500),
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Items List
                    ...items.map((item) {
                      final hasItemPrice = AppConfig.hasValidPrice(item.sellingPrice);
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            // Thumbnail
                            Container(
                              width: 64,
                              height: 64,
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: UnikaiProductImage(imagePath: item.image),
                            ),
                            const SizedBox(width: 12),

                            // Item details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 14,
                                      color: UnikaiTheme.navy,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 3),
                                  if (item.size.isNotEmpty)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF1F5F9),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        item.size,
                                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                                      ),
                                    ),
                                  const SizedBox(height: 4),
                                  if (hasItemPrice)
                                    Text(
                                      AppConfig.formatOMR(item.sellingPrice),
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: UnikaiTheme.navy,
                                      ),
                                    )
                                  else
                                    const Text(
                                      'Price on request',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF166534),
                                      ),
                                    ),
                                ],
                              ),
                            ),

                            // Stepper [-] [qty] [+]
                            Container(
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: Icon(
                                      item.quantity <= 1 ? Icons.delete_outline_rounded : Icons.remove,
                                      size: 16,
                                      color: item.quantity <= 1 ? Colors.red : const Color(0xFF475569),
                                    ),
                                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                    padding: EdgeInsets.zero,
                                    onPressed: () {
                                      notifier.updateQuantity(
                                        item.productId,
                                        item.size,
                                        item.quantity - 1,
                                      );
                                    },
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 4),
                                    child: Text(
                                      '${item.quantity}',
                                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.add, size: 16, color: Color(0xFF475569)),
                                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                    padding: EdgeInsets.zero,
                                    onPressed: () {
                                      notifier.updateQuantity(
                                        item.productId,
                                        item.size,
                                        item.quantity + 1,
                                      );
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }),

                    const SizedBox(height: 12),

                    // Order Summary Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Order Summary',
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: UnikaiTheme.navy),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Items:', style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
                              Text('$totalQty units', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: UnikaiTheme.navy)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Delivery Method:', style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
                              const Text('Cold-Chain Fleet (Free)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: UnikaiTheme.emerald)),
                            ],
                          ),
                          if (AppConfig.hasValidPrice(totalAmount)) ...[
                            const SizedBox(height: 6),
                            const Divider(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Estimated Subtotal:', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: UnikaiTheme.navy)),
                                Text(
                                  AppConfig.formatOMR(totalAmount),
                                  style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: UnikaiTheme.navy),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Amber Wholesale Note
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFFBEB),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline_rounded, color: Color(0xFFD97706), size: 18),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Commercial wholesale discount tiers confirmed by assigned salesman upon review.',
                              style: TextStyle(fontSize: 11, color: Color(0xFF92400E), fontWeight: FontWeight.w500),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                // Sticky Bottom Checkout CTA Bar
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: const Border(top: BorderSide(color: Color(0xFFE2E8F0))),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 10,
                          offset: const Offset(0, -4),
                        ),
                      ],
                    ),
                    child: SafeArea(
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '$totalQty units selected',
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                ),
                                Text(
                                  AppConfig.hasValidPrice(totalAmount)
                                      ? AppConfig.formatOMR(totalAmount)
                                      : 'Price on Request',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    color: UnikaiTheme.navy,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: UnikaiTheme.navy,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              elevation: 2,
                            ),
                            onPressed: () => context.push('/checkout'),
                            child: const Row(
                              children: [
                                Text('Proceed to Order', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                SizedBox(width: 8),
                                Icon(Icons.arrow_forward_rounded, size: 16),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

// 11. CHECKOUT / CONTACT SALESMAN SCREEN (Screen 7 in Showcase)
class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _businessCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _streetCtrl = TextEditingController();
  final _cityCtrl = TextEditingController(text: 'Muscat');
  final _notesCtrl = TextEditingController();
  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    if (user != null) {
      _businessCtrl.text = user.companyName;
      _nameCtrl.text = user.name;
      _phoneCtrl.text = user.phone;
      if (user.addresses.isNotEmpty) {
        _streetCtrl.text = user.addresses.first.street;
        _cityCtrl.text = user.addresses.first.city;
      }
    } else {
      _nameCtrl.text = 'Guest Buyer';
      _phoneCtrl.text = '+968 ';
      _streetCtrl.text = 'Main Street Warehouse';
    }
  }

  Future<void> _submitOrder() async {
    final items = ref.read(cartProvider);
    if (items.isEmpty) return;

    if (_nameCtrl.text.trim().isEmpty ||
        _phoneCtrl.text.trim().isEmpty ||
        _streetCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Please provide contact name, phone, and delivery address.');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final res = await ref.read(repositoryProvider).createOrder(
            customerName: _nameCtrl.text.trim(),
            customerPhone: _phoneCtrl.text.trim(),
            street: _streetCtrl.text.trim(),
            city: _cityCtrl.text.trim(),
            items: items,
            notes: _notesCtrl.text.trim(),
          );
      final orderNum = res['order']?['orderNumber']?.toString() ?? 'UNK-ORDER';
      ref.read(cartProvider.notifier).clearCart();
      if (mounted) {
        context.go('/order-confirmation?orderNumber=$orderNum');
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _orderViaWhatsApp(SalesmanModel salesman) async {
    final items = ref.read(cartProvider);
    if (items.isEmpty) return;

    final cleanPhone = salesman.whatsappNumber.replaceAll(RegExp(r'[^\d]'), '');
    final bName = _businessCtrl.text.trim().isNotEmpty ? _businessCtrl.text.trim() : 'Store/Supermarket';
    final cName = _nameCtrl.text.trim().isNotEmpty ? _nameCtrl.text.trim() : 'Wholesale Buyer';
    final addr = '${_streetCtrl.text.trim()}, ${_cityCtrl.text.trim()}';

    final buffer = StringBuffer();
    buffer.writeln('🥛 *UNIKAI B2B WHOLESALE ORDER SHEET*');
    buffer.writeln('----------------------------------------');
    buffer.writeln('🏬 *Business:* $bName');
    buffer.writeln('👤 *Contact:* $cName');
    buffer.writeln('📞 *Phone:* ${_phoneCtrl.text.trim()}');
    buffer.writeln('📍 *Delivery:* $addr');
    buffer.writeln('----------------------------------------');
    buffer.writeln('📦 *ORDER ITEMS:*');

    for (int i = 0; i < items.length; i++) {
      final it = items[i];
      final size = it.size.isNotEmpty ? ' (${it.size})' : '';
      final priceStr = AppConfig.hasValidPrice(it.sellingPrice)
          ? ' [${AppConfig.formatOMR(it.sellingPrice)}]'
          : ' [Price on Request]';
      buffer.writeln('${i + 1}. *${it.name}$size* — Qty: ${it.quantity}$priceStr');
    }

    final totalAmount = ref.read(cartProvider.notifier).totalAmount;
    final totalQty = ref.read(cartProvider.notifier).totalQuantity;

    buffer.writeln('----------------------------------------');
    buffer.writeln('📊 *Total Units:* $totalQty');
    if (AppConfig.hasValidPrice(totalAmount)) {
      buffer.writeln('💰 *Estimated Amount:* ${AppConfig.formatOMR(totalAmount)}');
    } else {
      buffer.writeln('💰 *Quotation:* Commercial Price on Request');
    }
    if (_notesCtrl.text.trim().isNotEmpty) {
      buffer.writeln('📝 *Notes:* ${_notesCtrl.text.trim()}');
    }
    buffer.writeln('----------------------------------------');
    buffer.writeln('Please review and confirm dispatch schedule. Thank you!');

    final url = 'https://wa.me/$cleanPhone?text=${Uri.encodeComponent(buffer.toString())}';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final salesmanAsync = ref.watch(salesmanProvider);
    final items = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Checkout & Salesman Contact', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: Text(_error!, style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 12)),
              ),

            // Card 1: Assigned B2B Salesman (Sachin)
            salesmanAsync.when(
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
              data: (sachin) => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF3C7),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          alignment: Alignment.center,
                          child: const Icon(Icons.support_agent_rounded, color: Color(0xFFB45309), size: 24),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Assigned B2B Salesman: ${sachin.name}',
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: UnikaiTheme.navy),
                              ),
                              Text(
                                '${sachin.title} • ${sachin.phone}',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 14),

            // Card 2: Delivery Information Form
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Delivery Information',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: UnikaiTheme.navy),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _businessCtrl,
                    decoration: InputDecoration(
                      labelText: 'Store / Business Name',
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _nameCtrl,
                    decoration: InputDecoration(
                      labelText: 'Contact Person Name *',
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _phoneCtrl,
                    keyboardType: TextInputType.phone,
                    decoration: InputDecoration(
                      labelText: 'Contact Phone Number *',
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _streetCtrl,
                    decoration: InputDecoration(
                      labelText: 'Delivery Warehouse / Street Address *',
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _cityCtrl,
                    decoration: InputDecoration(
                      labelText: 'City *',
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _notesCtrl,
                    decoration: InputDecoration(
                      labelText: 'Delivery Notes (Cold chain, dock timing, etc.)',
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Card 3: Order Items Summary Preview
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Items in this Order',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: UnikaiTheme.navy),
                      ),
                      Text(
                        '${notifier.totalQuantity} units',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  const Divider(height: 20),
                  ...items.map((it) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                '${it.name}${it.size.isNotEmpty ? " (${it.size})" : ""}',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: UnikaiTheme.navy),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Text(
                              '× ${it.quantity}',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: UnikaiTheme.sky),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // ACTION BUTTON 1: WhatsApp Button (Emerald Green)
            salesmanAsync.maybeWhen(
              data: (sachin) => SizedBox(
                height: 52,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 2,
                  ),
                  onPressed: () => _orderViaWhatsApp(sachin),
                  icon: const Icon(Icons.chat_rounded, size: 20),
                  label: Text(
                    'Send Order Sheet to ${sachin.name} on WhatsApp',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
              orElse: () => const SizedBox.shrink(),
            ),

            const SizedBox(height: 12),

            // ACTION BUTTON 2: Submit to Database Button (Deep Navy)
            SizedBox(
              height: 52,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: UnikaiTheme.navy,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 2,
                ),
                onPressed: _submitting ? null : _submitOrder,
                icon: const Icon(Icons.check_circle_outline_rounded, size: 20),
                label: _submitting
                    ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                    : const Text(
                        'Submit Wholesale Order Request',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                      ),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// 12. ADDRESS SCREEN
class AddressScreen extends ConsumerStatefulWidget {
  const AddressScreen({super.key});

  @override
  ConsumerState<AddressScreen> createState() => _AddressScreenState();
}

class _AddressScreenState extends ConsumerState<AddressScreen> {
  final _labelCtrl = TextEditingController(text: 'Main Warehouse');
  final _companyCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _streetCtrl = TextEditingController();
  final _cityCtrl = TextEditingController(text: 'Muscat');
  bool _saving = false;

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await ref.read(repositoryProvider).addAddress(
            label: _labelCtrl.text.trim(),
            companyName: _companyCtrl.text.trim(),
            fullName: _nameCtrl.text.trim(),
            phone: _phoneCtrl.text.trim(),
            street: _streetCtrl.text.trim(),
            city: _cityCtrl.text.trim(),
          );
      await ref.read(authProvider.notifier).loadCurrentUser();
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Add Delivery Address'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _labelCtrl,
              decoration: InputDecoration(
                labelText: 'Address Label (e.g. Ruwi Branch)',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _companyCtrl,
              decoration: InputDecoration(
                labelText: 'Company / Supermarket Name',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _nameCtrl,
              decoration: InputDecoration(
                labelText: 'Contact Person *',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: 'Contact Phone *',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _streetCtrl,
              decoration: InputDecoration(
                labelText: 'Street / Warehouse Address *',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _cityCtrl,
              decoration: InputDecoration(
                labelText: 'City *',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: UnikaiTheme.navy,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _saving ? null : _save,
                child: Text(_saving ? 'Saving...' : 'Save Address', style: const TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// 13. ORDER CONFIRMATION SCREEN
class OrderConfirmationScreen extends StatelessWidget {
  final String orderNumber;

  const OrderConfirmationScreen({super.key, required this.orderNumber});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Order Confirmed'),
        automaticallyImplyLeading: false,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: const BoxDecoration(
                  color: Color(0xFFD1FAE5),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.check_circle_rounded, size: 52, color: Color(0xFF059669)),
              ),
              const SizedBox(height: 20),
              const Text(
                'Wholesale Order Placed!',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: UnikaiTheme.navy,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Order Reference: $orderNumber',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 12),
              const Text(
                'Your wholesale order request has been logged successfully. Key Account Salesman Sachin will coordinate dispatch.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4),
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: UnikaiTheme.navy,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () => context.go('/my-orders'),
                  child: const Text('View My Orders', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.go('/home'),
                child: const Text('Back to Home Dashboard'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// 14. MY ORDERS SCREEN
class MyOrdersScreen extends ConsumerStatefulWidget {
  const MyOrdersScreen({super.key});

  @override
  ConsumerState<MyOrdersScreen> createState() => _MyOrdersScreenState();
}

class _MyOrdersScreenState extends ConsumerState<MyOrdersScreen> {
  List<OrderModel> _orders = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) {
      setState(() => _loading = false);
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await ref.read(repositoryProvider).getMyOrders();
      if (mounted) setState(() => _orders = list);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My B2B Orders', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      body: !auth.isAuthenticated
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.lock_outline_rounded, size: 56, color: Color(0xFF94A3B8)),
                    const SizedBox(height: 14),
                    const Text(
                      'Sign in to view your orders',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: UnikaiTheme.navy),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Access order history, tracking, and instant 1-click reordering.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: UnikaiTheme.navy,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => context.push('/login'),
                      child: const Text('Login / Register'),
                    ),
                  ],
                ),
              ),
            )
          : _error != null
              ? ErrorStateWidget(message: _error!, onRetry: _load)
              : _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _orders.isEmpty
                      ? const Center(
                          child: Text(
                            'No B2B orders placed yet.',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _orders.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, idx) {
                            final ord = _orders[idx];
                            return Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        ord.orderNumber,
                                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: UnikaiTheme.navy),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFFEF3C7),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          ord.status,
                                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF92400E)),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '${ord.totalQuantity} items • ${ord.addressText}',
                                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                  ),
                                  const Divider(height: 20),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        AppConfig.hasValidPrice(ord.total)
                                            ? AppConfig.formatOMR(ord.total)
                                            : 'Quotation on Request',
                                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: UnikaiTheme.navy),
                                      ),
                                      TextButton(
                                        onPressed: () => context.push('/orders/${ord.id}'),
                                        child: const Row(
                                          children: [
                                            Text('Details', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                                            Icon(Icons.chevron_right, size: 16),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
    );
  }
}

// 15. ORDER DETAILS SCREEN
class OrderDetailsScreen extends ConsumerStatefulWidget {
  final String orderId;

  const OrderDetailsScreen({super.key, required this.orderId});

  @override
  ConsumerState<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends ConsumerState<OrderDetailsScreen> {
  OrderModel? _order;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final ord = await ref.read(repositoryProvider).getOrderById(widget.orderId);
      if (mounted) {
        setState(() {
          _order = ord;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Order Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null || _order == null
              ? ErrorStateWidget(message: _error ?? 'Order not found', onRetry: _load)
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _order!.orderNumber,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: UnikaiTheme.navy),
                          ),
                          const SizedBox(height: 6),
                          Text('Status: ${_order!.status}', style: const TextStyle(fontWeight: FontWeight.w700, color: UnikaiTheme.sky)),
                          Text('Customer: ${_order!.customerName} (${_order!.customerPhone})', style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
                          Text('Delivery: ${_order!.addressText}', style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
                          const Divider(height: 24),
                          ..._order!.items.map(
                            (item) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${item.productName}${item.size.isNotEmpty ? " (${item.size})" : ""}',
                                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                  ),
                                  Text('× ${item.quantity}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                                ],
                              ),
                            ),
                          ),
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Quantity', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              Text('${_order!.totalQuantity} units', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: UnikaiTheme.navy)),
                            ],
                          ),
                          if (AppConfig.hasValidPrice(_order!.total)) ...[
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Total Amount', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                Text(AppConfig.formatOMR(_order!.total), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: UnikaiTheme.navy)),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}

// 19. WHATSAPP ORDER SCREEN
class WhatsAppOrderScreen extends ConsumerStatefulWidget {
  const WhatsAppOrderScreen({super.key});

  @override
  ConsumerState<WhatsAppOrderScreen> createState() => _WhatsAppOrderScreenState();
}

class _WhatsAppOrderScreenState extends ConsumerState<WhatsAppOrderScreen> {
  final _nameCtrl = TextEditingController(text: 'John Doe');
  final _phoneCtrl = TextEditingController(text: '+968 9123 4567');
  final _addrCtrl = TextEditingController(text: 'Muscat, Oman');
  String _generatedMessage = '';
  String _whatsappUrl = '';
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    if (user != null) {
      _nameCtrl.text = user.name;
      if (user.phone.isNotEmpty) _phoneCtrl.text = user.phone;
    }
    _generatePreview();
  }

  Future<void> _generatePreview() async {
    final items = ref.read(cartProvider);
    if (items.isEmpty) return;
    setState(() => _loading = true);
    try {
      final preview = await ref.read(repositoryProvider).generateWhatsAppPreview(
            items: items,
            customerName: _nameCtrl.text.trim(),
            customerPhone: _phoneCtrl.text.trim(),
            address: _addrCtrl.text.trim(),
          );
      if (mounted) {
        setState(() {
          _generatedMessage = preview['message']?.toString() ?? '';
          _whatsappUrl = preview['whatsappUrl']?.toString() ?? '';
        });
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _launchWhatsApp() async {
    if (_whatsappUrl.isEmpty) return;
    final uri = Uri.parse(_whatsappUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final salesmanAsync = ref.watch(salesmanProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF059669),
        title: Text('WhatsApp Order Sheet (${salesmanAsync.valueOrNull?.name ?? "Sachin"})'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  TextField(
                    controller: _nameCtrl,
                    decoration: const InputDecoration(labelText: 'Customer / Store Name'),
                    onChanged: (_) => _generatePreview(),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _phoneCtrl,
                    decoration: const InputDecoration(labelText: 'Phone Number'),
                    onChanged: (_) => _generatePreview(),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _addrCtrl,
                    decoration: const InputDecoration(labelText: 'Delivery Address'),
                    onChanged: (_) => _generatePreview(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Formatted WhatsApp Order Sheet:',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: UnikaiTheme.navy),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(16),
              ),
              child: SelectableText(
                _loading ? 'Formatting order sheet...' : _generatedMessage,
                style: const TextStyle(
                  color: Color(0xFF6EE7B7),
                  fontFamily: 'monospace',
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: _generatedMessage));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Order sheet copied!')),
                      );
                    },
                    icon: const Icon(Icons.copy_rounded, size: 16),
                    label: const Text('Copy Sheet'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _launchWhatsApp,
                    icon: const Icon(Icons.send_rounded, size: 16),
                    label: const Text('Send WhatsApp'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
