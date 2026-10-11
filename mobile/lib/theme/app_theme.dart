import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Tema dell'app (dark di default, coerente con il sito web Reskill).
class AppTheme {
  static const String _font = 'JetBrainsMono';

  static ThemeData get dark => _build(ThemeData.dark());

  static ThemeData get light => _build(ThemeData.light());

  static ThemeData _build(ThemeData base) {
    final isDark = base.brightness == Brightness.dark;
    return base.copyWith(
      scaffoldBackgroundColor:
          isDark ? AppColors.background : const Color(0xFFF4F6FA),
      primaryColor: AppColors.primary,
      colorScheme: ColorScheme(
        brightness: base.brightness,
        primary: AppColors.primary,
        onPrimary: AppColors.onPrimary,
        secondary: AppColors.primaryBright,
        onSecondary: AppColors.onPrimary,
        surface: isDark ? AppColors.surface : const Color(0xFFFFFFFF),
        onSurface: isDark ? AppColors.text : const Color(0xFF1A1D24),
        error: AppColors.danger,
        onError: Colors.white,
        outline: AppColors.border,
        surfaceContainerHighest: isDark ? AppColors.surfaceAlt : const Color(0xFFEDEFF4),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: isDark ? AppColors.background : const Color(0xFFF4F6FA),
        foregroundColor: isDark ? AppColors.text : const Color(0xFF1A1D24),
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: const TextStyle(
          fontFamily: _font,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.2,
        ),
      ),
      cardTheme: CardThemeData(
        color: isDark ? AppColors.surface : const Color(0xFFFFFFFF),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppColors.border),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? AppColors.surfaceAlt : const Color(0xFFF0F2F7),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.primary, width: 1.5),
        ),
        labelStyle: TextStyle(color: AppColors.textMuted),
        hintStyle: TextStyle(color: AppColors.textFaint),
      ),
      snackBarTheme: const SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.surfaceAlt,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: isDark ? AppColors.background : const Color(0xFFFFFFFF),
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textFaint,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}

