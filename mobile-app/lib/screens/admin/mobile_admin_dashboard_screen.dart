import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../config/routes/app_routes.dart';

class MobileAdminDashboardScreen extends StatefulWidget {
  const MobileAdminDashboardScreen({super.key});

  @override
  State<MobileAdminDashboardScreen> createState() => _MobileAdminDashboardScreenState();
}

class _MobileAdminDashboardScreenState extends State<MobileAdminDashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Admin Control Portal',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(
              'Video Data Collection & Ops',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppColors.error),
            onPressed: () {
              Navigator.pushReplacementNamed(context, AppRoutes.login);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Welcome Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, Color(0xFF4F46E5)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(40),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.admin_panel_settings_rounded, color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Super Admin Dashboard',
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Manage vendor partnerships, video QC reviews, candidates, and payments directly from your phone.',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Platform Metrics Grid
            Text(
              'Platform Metrics Overview',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDarkMode ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 14),

            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.3,
              children: [
                _buildMetricCard('Total Vendors', '24', 'Active Partners', Icons.storefront_rounded, AppColors.primary),
                _buildMetricCard('Candidates', '142', 'Registered', Icons.groups_rounded, AppColors.secondary),
                _buildMetricCard('Total Videos', '528', 'Uploaded', Icons.videocam_rounded, Colors.purple),
                _buildMetricCard('Approved QC', '410', '77.6% Approved', Icons.check_circle_rounded, AppColors.success),
                _buildMetricCard('Rejected QC', '45', 'Re-shoots Required', Icons.cancel_rounded, AppColors.error),
                _buildMetricCard('Total Hours', '185.50 hrs', 'Collected Data', Icons.access_time_rounded, Colors.amber.shade800),
              ],
            ),
            const SizedBox(height: 24),

            // Management Directory List
            Text(
              'Quick Admin Operations',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDarkMode ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 14),

            _buildOperationTile(
              title: 'Vendor Management',
              subtitle: 'View directory, edit vendor profiles, add partners',
              icon: Icons.storefront_rounded,
              color: AppColors.primary,
              onTap: () {
                _showInfoDialog('Vendor Management', '24 Active Vendors registered in the system.');
              },
            ),
            _buildOperationTile(
              title: 'Candidate Directory',
              subtitle: 'Filter candidates by assigned vendor',
              icon: Icons.groups_rounded,
              color: AppColors.secondary,
              onTap: () {
                _showInfoDialog('Candidate Directory', '142 Candidates assigned across 24 vendors.');
              },
            ),
            _buildOperationTile(
              title: 'Quality Control (QC) Audit Queue',
              subtitle: 'Review pending videos, approve or reject with reasons',
              icon: Icons.fact_check_rounded,
              color: Colors.amber.shade800,
              onTap: () {
                _showInfoDialog('QC Queue', '73 Pending Videos awaiting Quality Control review.');
              },
            ),
            _buildOperationTile(
              title: 'Payment & Financial Summaries',
              subtitle: 'Approved hours calculation and vendor rate settlements',
              icon: Icons.payments_rounded,
              color: AppColors.success,
              onTap: () {
                _showInfoDialog('Payment Settlement', 'Total Approved Hours: 185.50 hrs. Total Payout: \$9,275.00.');
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, String subtitle, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withAlpha(60)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title.toUpperCase(),
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color),
              ),
              Icon(icon, color: color, size: 22),
            ],
          ),
          Text(
            value,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color),
          ),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 10, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildOperationTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: color.withAlpha(30),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
      ),
    );
  }

  void _showInfoDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}
