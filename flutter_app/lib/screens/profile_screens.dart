import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/app_config.dart';
import '../models/models.dart';
import '../providers/app_providers.dart';
import '../theme/app_theme.dart';

// 16. PROFILE SCREEN (Screen 8 in Showcase)
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  List<OrderModel> _recentOrders = [];
  bool _loadingOrders = false;

  @override
  void initState() {
    super.initState();
    _loadRecentOrders();
  }

  Future<void> _loadRecentOrders() async {
    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) return;
    setState(() => _loadingOrders = true);
    try {
      final orders = await ref.read(repositoryProvider).getMyOrders();
      if (mounted) {
        setState(() {
          _recentOrders = orders.take(3).toList();
          _loadingOrders = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingOrders = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final user = auth.user;
    final salesmanAsync = ref.watch(salesmanProvider);

    final displayName = user?.name ?? 'John Doe';
    final companyName = user?.companyName.isNotEmpty == true
        ? user!.companyName
        : 'Muscat Hypermarket';
    final phone = user?.phone.isNotEmpty == true ? user!.phone : '+968 9123 4567';
    final email = user?.email ?? 'buyer@muscathypermarket.om';

    final initials = displayName.trim().isNotEmpty
        ? displayName
            .trim()
            .split(' ')
            .take(2)
            .map((e) => e.isNotEmpty ? e[0] : '')
            .join()
            .toUpperCase()
        : 'JD';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My B2B Profile', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        children: [
          // User Card (Screen 8 Showcase design)
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [UnikaiTheme.navy, UnikaiTheme.sky],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    initials.isNotEmpty ? initials : 'JD',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 20,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              displayName,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                color: UnikaiTheme.navy,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Wholesale',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: UnikaiTheme.sky),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        companyName,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$phone • $email',
                        style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Menu Options List
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.receipt_long_rounded, color: UnikaiTheme.sky, size: 20),
                  ),
                  title: const Text('Order History', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                  onTap: () => context.go('/my-orders'),
                ),
                const Divider(height: 1, indent: 60),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.location_on_outlined, color: UnikaiTheme.sky, size: 20),
                  ),
                  title: const Text('Saved Warehouse Addresses', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                  onTap: () => context.push('/saved-addresses'),
                ),
                const Divider(height: 1, indent: 60),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.support_agent_rounded, color: Color(0xFFD97706), size: 20),
                  ),
                  title: Text(
                    'Assigned Salesman (${salesmanAsync.valueOrNull?.name ?? "Sachin"})',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                  ),
                  subtitle: Text(
                    salesmanAsync.valueOrNull?.phone ?? '+968 9123 4567',
                    style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                  onTap: () => context.push('/contact-salesman'),
                ),
                const Divider(height: 1, indent: 60),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.language_rounded, color: Color(0xFF475569), size: 20),
                  ),
                  title: const Text('Language (English / العربية)', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  trailing: const Text('EN', style: TextStyle(fontWeight: FontWeight.w800, color: UnikaiTheme.sky)),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('B2B Portal language set to English (Oman & GCC).'),
                        duration: Duration(seconds: 1),
                      ),
                    );
                  },
                ),
                const Divider(height: 1, indent: 60),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.settings_ethernet_rounded, color: Color(0xFF475569), size: 20),
                  ),
                  title: const Text('Backend API Server IP', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  subtitle: Text(AppConfig.apiBaseUrl, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                  trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
                  onTap: () => context.push('/settings'),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // "Recent Orders" Section Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent B2B Orders',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: UnikaiTheme.navy),
              ),
              TextButton(
                onPressed: () => context.go('/my-orders'),
                style: TextButton.styleFrom(padding: EdgeInsets.zero),
                child: const Text('View All', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              ),
            ],
          ),

          const SizedBox(height: 8),

          if (_loadingOrders)
            const Center(child: Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator()))
          else if (_recentOrders.isEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: const Center(
                child: Text(
                  'No recent orders. Explore catalogue to place wholesale request.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ),
              ),
            )
          else
            ..._recentOrders.map((ord) {
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          ord.orderNumber,
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: UnikaiTheme.navy),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${ord.totalQuantity} items • ${ord.addressText}',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD1FAE5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        ord.status,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF065F46)),
                      ),
                    ),
                  ],
                ),
              );
            }),

          const SizedBox(height: 20),

          // Logout / Login Button
          if (user != null)
            SizedBox(
              height: 50,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFFDC2626),
                  side: const BorderSide(color: Color(0xFFFECACA)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () async {
                  await ref.read(authProvider.notifier).logout();
                },
                icon: const Icon(Icons.logout_rounded, size: 18),
                label: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            )
          else
            SizedBox(
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: UnikaiTheme.navy,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () => context.push('/login'),
                icon: const Icon(Icons.login_rounded, size: 18),
                label: const Text('Log In to B2B Account', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// 17. SAVED ADDRESSES SCREEN
class SavedAddressesScreen extends ConsumerStatefulWidget {
  const SavedAddressesScreen({super.key});

  @override
  ConsumerState<SavedAddressesScreen> createState() => _SavedAddressesScreenState();
}

class _SavedAddressesScreenState extends ConsumerState<SavedAddressesScreen> {
  List<AddressModel> _addresses = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final list = await ref.read(repositoryProvider).getAddresses();
      if (mounted) setState(() => _addresses = list);
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Saved Delivery Addresses'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: UnikaiTheme.navy,
        foregroundColor: Colors.white,
        onPressed: () async {
          await context.push('/address');
          _load();
        },
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add Address', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _addresses.isEmpty
              ? const Center(
                  child: Text('No saved addresses yet.', style: TextStyle(color: Color(0xFF64748B))),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _addresses.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, idx) {
                    final a = _addresses[idx];
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.warehouse_rounded, color: UnikaiTheme.sky, size: 22),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(a.label, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: UnikaiTheme.navy)),
                                const SizedBox(height: 2),
                                Text('${a.street}, ${a.city}, ${a.country}', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                Text('Contact: ${a.fullName} (${a.phone})', style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 20),
                            onPressed: () async {
                              await ref.read(repositoryProvider).deleteAddress(a.id);
                              _load();
                            },
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}

// 18. CONTACT SALESMAN SCREEN
class ContactSalesmanScreen extends ConsumerWidget {
  const ContactSalesmanScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final salesmanAsync = ref.watch(salesmanProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Contact Assigned Salesman'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: salesmanAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text(err.toString())),
        data: (salesman) {
          final cleanWhatsapp = salesman.whatsappNumber.replaceAll(RegExp(r'[^\d]'), '');
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          salesman.name.isNotEmpty ? salesman.name[0] : 'S',
                          style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFFB45309)),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              salesman.name,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: UnikaiTheme.navy),
                            ),
                            Text(
                              salesman.title,
                              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 28),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.phone_rounded, color: UnikaiTheme.sky),
                    title: const Text('Phone Number', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    subtitle: Text(salesman.phone, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: UnikaiTheme.navy)),
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.chat_rounded, color: Color(0xFF059669)),
                    title: const Text('WhatsApp Number', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    subtitle: Text(salesman.whatsappNumber, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: UnikaiTheme.navy)),
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.mail_outline_rounded, color: UnikaiTheme.sky),
                    title: const Text('Email Address', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    subtitle: Text(salesman.email, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: UnikaiTheme.navy)),
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.schedule_rounded, color: UnikaiTheme.sky),
                    title: const Text('Working Hours', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    subtitle: Text(salesman.workingHours, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: UnikaiTheme.navy)),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () async {
                      final uri = Uri.parse(
                        'https://wa.me/$cleanWhatsapp?text=${Uri.encodeComponent("Hello ${salesman.name}, I would like to place a B2B order with Unikai.")}',
                      );
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                      }
                    },
                    icon: const Icon(Icons.chat_rounded, size: 20),
                    label: Text('Chat with ${salesman.name} on WhatsApp', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// 20. SETTINGS SCREEN
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  late final TextEditingController _urlCtrl;
  String _healthResult = '';
  bool _testing = false;

  @override
  void initState() {
    super.initState();
    _urlCtrl = TextEditingController(text: AppConfig.apiBaseUrl);
  }

  Future<void> _saveAndTest(String url) async {
    setState(() {
      _testing = true;
      _healthResult = 'Testing connection to $url/health ...';
    });
    await AppConfig.setCustomApiBaseUrl(url);
    _urlCtrl.text = AppConfig.apiBaseUrl;

    try {
      final health = await ref.read(repositoryProvider).checkHealth();
      ref.invalidate(categoriesProvider);
      ref.invalidate(featuredProductsProvider);
      ref.invalidate(salesmanProvider);
      if (mounted) {
        setState(() {
          _healthResult =
              'Connected! Server: ${health["server"]}, Database: ${health["database"]}';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _healthResult = e.toString());
      }
    } finally {
      if (mounted) setState(() => _testing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('API Server Connection'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
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
                const Text(
                  'Backend API Base URL',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: UnikaiTheme.navy),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Configure the Node.js backend URL to connect Flutter to the Unikai platform service.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _urlCtrl,
                  decoration: InputDecoration(
                    labelText: 'Active API URL',
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ActionChip(
                      label: const Text('Android (192.168.0.104:5001)'),
                      onPressed: () => _saveAndTest(AppConfig.androidEmulatorUrl),
                    ),
                    ActionChip(
                      label: const Text('iOS Simulator (localhost:5001)'),
                      onPressed: () => _saveAndTest(AppConfig.iosSimulatorUrl),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: UnikaiTheme.navy,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _testing ? null : () => _saveAndTest(_urlCtrl.text),
                    icon: const Icon(Icons.network_check_rounded, size: 18),
                    label: Text(_testing ? 'Connecting...' : 'Save & Test Connection', style: const TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
                if (_healthResult.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _healthResult.startsWith('Connected') ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: _healthResult.startsWith('Connected') ? const Color(0xFFA7F3D0) : const Color(0xFFFECACA),
                      ),
                    ),
                    child: Text(
                      _healthResult,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: _healthResult.startsWith('Connected') ? const Color(0xFF065F46) : const Color(0xFFB91C1C),
                      ),
                    ),
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
