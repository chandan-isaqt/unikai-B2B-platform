import 'package:go_router/go_router.dart';
import '../screens/auth_screens.dart';
import '../screens/catalog_screens.dart';
import '../screens/order_screens.dart';
import '../screens/profile_screens.dart';
import '../widgets/common_widgets.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    // 1. Splash
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    // 2. Login
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    // 3. Register
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    // 4. Forgot Password
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),

    // Bottom Navigation Shell (Home, Products, Cart, Orders, Profile)
    GoRoute(
      path: '/home',
      builder: (context, state) => const MainShellScaffold(
        currentIndex: 0,
        child: HomeScreen(),
      ),
    ),
    GoRoute(
      path: '/products',
      builder: (context, state) => MainShellScaffold(
        currentIndex: 1,
        child: ProductsScreen(
          initialCategory: state.uri.queryParameters['category'],
        ),
      ),
    ),
    GoRoute(
      path: '/cart',
      builder: (context, state) => const MainShellScaffold(
        currentIndex: 2,
        child: CartScreen(),
      ),
    ),
    GoRoute(
      path: '/my-orders',
      builder: (context, state) => const MainShellScaffold(
        currentIndex: 3,
        child: MyOrdersScreen(),
      ),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const MainShellScaffold(
        currentIndex: 4,
        child: ProfileScreen(),
      ),
    ),

    // Standalone Screens
    GoRoute(
      path: '/categories',
      builder: (context, state) => const CategoriesScreen(),
    ),
    GoRoute(
      path: '/products/:slug',
      builder: (context, state) => ProductDetailsScreen(
        slugOrId: state.pathParameters['slug'] ?? '',
      ),
    ),
    GoRoute(
      path: '/search',
      builder: (context, state) => const SearchScreen(),
    ),
    GoRoute(
      path: '/checkout',
      builder: (context, state) => const CheckoutScreen(),
    ),
    GoRoute(
      path: '/address',
      builder: (context, state) => const AddressScreen(),
    ),
    GoRoute(
      path: '/order-confirmation',
      builder: (context, state) => OrderConfirmationScreen(
        orderNumber: state.uri.queryParameters['orderNumber'] ?? 'UNK-ORDER',
      ),
    ),
    GoRoute(
      path: '/orders/:id',
      builder: (context, state) => OrderDetailsScreen(
        orderId: state.pathParameters['id'] ?? '',
      ),
    ),
    GoRoute(
      path: '/saved-addresses',
      builder: (context, state) => const SavedAddressesScreen(),
    ),
    GoRoute(
      path: '/contact-salesman',
      builder: (context, state) => const ContactSalesmanScreen(),
    ),
    GoRoute(
      path: '/whatsapp-order',
      builder: (context, state) => const WhatsAppOrderScreen(),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
  ],
);
