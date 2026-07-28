import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../config/routes/app_routes.dart';
import '../../services/auth_service.dart';

class MobileVendorDashboardScreen extends StatefulWidget {
  const MobileVendorDashboardScreen({super.key});

  @override
  State<MobileVendorDashboardScreen> createState() => _MobileVendorDashboardScreenState();
}

class _MobileVendorDashboardScreenState extends State<MobileVendorDashboardScreen> {
  final List<Map<String, String>> _candidates = [
    {'name': 'Alex Johnson', 'phone': '+1 555-0101', 'videos': '18', 'status': 'Active'},
    {'name': 'Maria Garcia', 'phone': '+1 555-0102', 'videos': '24', 'status': 'Active'},
    {'name': 'David Kim', 'phone': '+1 555-0103', 'videos': '12', 'status': 'Pending'},
    {'name': 'Emma Watson', 'phone': '+1 555-0104', 'videos': '30', 'status': 'Active'},
  ];

  Future<void> _handleLogout() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, AppRoutes.login);
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Vendor Partner Dashboard',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(
              'Acme Video Solutions Portal',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppColors.error),
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Vendor Hero Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.secondary, Color(0xFF0284C7)],
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
                        child: const Icon(Icons.storefront_rounded, color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 12),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Acme Video Solutions',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            'Vendor ID: VENDOR-001',
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildHeaderStat('Assigned Candidates', '14'),
                      _buildHeaderStat('Approved Hours', '48.5 hrs'),
                      _buildHeaderStat('Estimated Earnings', '\$2,425'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Vendor Metrics Summary
            Text(
              'Candidate Data Collection Progress',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDarkMode ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 14),

            Row(
              children: [
                Expanded(
                  child: _buildVendorStatBox('Total Videos', '84', Icons.videocam_rounded, AppColors.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildVendorStatBox('Approved QC', '72', Icons.check_circle_rounded, AppColors.success),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildVendorStatBox('Rejected QC', '12', Icons.cancel_rounded, AppColors.error),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Assigned Candidate Roster
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Assigned Candidates',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    _showAddCandidateDialog();
                  },
                  icon: const Icon(Icons.person_add_rounded, size: 18),
                  label: const Text('Add Candidate', style: TextStyle(fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _candidates.length,
              itemBuilder: (ctx, idx) {
                final cand = _candidates[idx];
                return Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppColors.primary.withAlpha(30),
                      child: Text(
                        cand['name']![0],
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                      ),
                    ),
                    title: Text(cand['name']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('Mobile: ${cand['phone']} • Videos: ${cand['videos']}'),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.success.withAlpha(30),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        cand['status']!,
                        style: const TextStyle(fontSize: 12, color: AppColors.success, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildVendorStatBox(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withAlpha(60)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }

  void _showAddCandidateDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add New Candidate'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(decoration: InputDecoration(labelText: 'Candidate Full Name')),
            SizedBox(height: 10),
            TextField(decoration: InputDecoration(labelText: 'Mobile Phone (+91)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Candidate registered successfully!')),
              );
            },
            child: const Text('Add Candidate'),
          ),
        ],
      ),
    );
  }
}
