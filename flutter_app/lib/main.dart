import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/app_config.dart';
import 'routing/app_router.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppConfig.init();
  runApp(
    const ProviderScope(
      child: UnikaiB2BApp(),
    ),
  );
}

class UnikaiB2BApp extends StatelessWidget {
  const UnikaiB2BApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Unikai B2B Catalogue & Ordering',
      debugShowCheckedModeBanner: false,
      theme: UnikaiTheme.lightTheme,
      routerConfig: appRouter,
    );
  }
}
