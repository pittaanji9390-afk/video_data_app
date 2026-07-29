import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../services/auth_service.dart';
import '../../config/routes/app_routes.dart';
import '../../widgets/powered_by_footer.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Profile', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimaryLight,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Avatar & Name Header
              const CircleAvatar(
                radius: 46,
                backgroundColor: AppColors.primary,
                child: Text('VK', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Vasavi Kandula', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: AppColors.success.withAlpha(20), borderRadius: BorderRadius.circular(10)),
                    child: const Row(
                      children: [
                        Icon(Icons.verified_rounded, size: 14, color: AppColors.success),
                        SizedBox(width: 4),
                        Text('Verified', style: TextStyle(fontSize: 11, color: AppColors.success, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              const Text('+91 98765 43210', style: TextStyle(color: AppColors.textSecondaryLight)),
              const SizedBox(height: 24),

              // Profile Info List
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Color(0xFFE2E8F0))),
                child: Column(
                  children: [
                    _buildInfoRow('Candidate ID', 'CAN-2024-001'),
                    const Divider(height: 1),
                    _buildInfoRow('Vendor ID', 'VEN-001'),
                    const Divider(height: 1),
                    _buildInfoRow('Email', 'vasavi@example.com'),
                    const Divider(height: 1),
                    _buildInfoRow('Phone', '+91 98765 43210'),
                    const Divider(height: 1),
                    _buildInfoRow('Device ID', 'A182-C304-E5F6'),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // QR Code Card
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Color(0xFFE2E8F0))),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      const Icon(Icons.qr_code_2_rounded, size: 100, color: AppColors.primary),
                      const SizedBox(height: 8),
                      const Text('Scan Candidate Verification QR Code', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Logout Button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () async {
                    await AuthService.logout();
                    if (context.mounted) {
                      Navigator.pushReplacementNamed(context, AppRoutes.login);
                    }
                  },
                  icon: const Icon(Icons.logout_rounded, color: AppColors.error),
                  label: const Text('Sign Out', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: AppColors.error),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const PoweredByFooter(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondaryLight, fontSize: 14)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimaryLight)),
        ],
      ),
    );
  }
}
