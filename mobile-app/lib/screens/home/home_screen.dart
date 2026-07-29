import 'package:flutter/material.dart';
import '../../config/routes/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../earnings/earnings_screen.dart';
import '../notifications/notifications_screen.dart';
import '../profile/profile_screen.dart';
import '../../widgets/powered_by_footer.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTab = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: IndexedStack(
        index: _currentTab,
        children: [
          const _HomeDashboardTab(),
          const Placeholder(), // Record tab triggers camera
          const Placeholder(),
          const NotificationsScreen(),
          const ProfileScreen(),
        ],
      ),
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const PoweredByFooter(),
          BottomNavigationBar(
            currentIndex: _currentTab,
            onTap: (idx) {
              if (idx == 1) {
                Navigator.pushNamed(context, AppRoutes.cameraPermission);
              } else if (idx == 2) {
                Navigator.pushNamed(context, AppRoutes.uploadVideo);
              } else {
                setState(() => _currentTab = idx);
              }
            },
            selectedItemColor: AppColors.primary,
            unselectedItemColor: Colors.grey,
            type: BottomNavigationBarType.fixed,
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
              BottomNavigationBarItem(icon: Icon(Icons.videocam_rounded), label: 'Record'),
              BottomNavigationBarItem(icon: Icon(Icons.cloud_upload_rounded), label: 'Uploads'),
              BottomNavigationBarItem(icon: Icon(Icons.notifications_rounded), label: 'Alerts'),
              BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
            ],
          ),
        ],
      ),
    );
  }
}

class _HomeDashboardTab extends StatelessWidget {
  const _HomeDashboardTab();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Header: Greeting & Notification Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Good Afternoon,',
                      style: TextStyle(fontSize: 14, color: AppColors.textSecondaryLight),
                    ),
                    Row(
                      children: [
                        Text(
                          'Anji ',
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimaryLight),
                        ),
                        Text('👋', style: TextStyle(fontSize: 20)),
                      ],
                    ),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      icon: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          const Icon(Icons.notifications_outlined, size: 28, color: AppColors.textPrimaryLight),
                          Positioned(
                            top: -2,
                            right: -2,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: AppColors.error,
                                shape: BoxShape.circle,
                              ),
                              child: const Text('1', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (ctx) => const NotificationsScreen()),
                        );
                      },
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Today's Progress Container (Capsule shape matching Image 1)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 22),
              decoration: BoxDecoration(
                color: const Color(0xFF2563EB),
                borderRadius: BorderRadius.circular(32),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2563EB).withAlpha(80),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "TODAY'S PROGRESS",
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 0.8),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Videos Uploaded', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
                          const SizedBox(height: 4),
                          const Text('0', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Hours Collected', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
                          const SizedBox(height: 4),
                          const Text('0.0 hrs', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Quick Actions Grid (4 Icons matching Screen #8)
            const Text(
              'Quick Actions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimaryLight),
            ),
            const SizedBox(height: 14),

            Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _buildQuickActionCard(
                        context,
                        title: 'Start Recording',
                        subtitle: 'Record camera video',
                        icon: Icons.videocam_rounded,
                        color: AppColors.primary,
                        onTap: () => Navigator.pushNamed(context, AppRoutes.cameraPermission),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: _buildQuickActionCard(
                        context,
                        title: 'Upload History',
                        subtitle: 'View submitted logs',
                        icon: Icons.history_rounded,
                        color: AppColors.secondary,
                        onTap: () => Navigator.pushNamed(context, AppRoutes.uploadVideo),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: _buildQuickActionCard(
                        context,
                        title: 'Payment Summary',
                        subtitle: 'Track earnings & payout',
                        icon: Icons.account_balance_wallet_rounded,
                        color: const Color(0xFF8B5CF6),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (ctx) => const EarningsScreen()),
                          );
                        },
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: _buildQuickActionCard(
                        context,
                        title: 'Help Center',
                        subtitle: 'FAQs & Support',
                        icon: Icons.help_outline_rounded,
                        color: AppColors.success,
                        onTap: () {
                          _showHelpDialog(context);
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 28),

            // Recent Activity Section
            const Text(
              'Recent Activity',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimaryLight),
            ),
            const SizedBox(height: 12),

            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppColors.primary.withAlpha(20),
                  child: const Icon(Icons.kitchen_rounded, color: AppColors.primary),
                ),
                title: const Text('Kitchen Video', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Uploaded • 2 min ago'),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withAlpha(20),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Approved',
                    style: TextStyle(color: AppColors.success, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(32),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(color: Colors.black.withAlpha(6), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withAlpha(25),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimaryLight)),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
          ],
        ),
      ),
    );
  }

  void _showHelpDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Help Center & FAQs', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('• How to record a video? Select Environment Tag and tap Start Recording.'),
            SizedBox(height: 8),
            Text('• How are earnings calculated? Rate is ₹100 / approved hour.'),
            SizedBox(height: 8),
            Text('• Where will I get paid? Payout settlements occur weekly directly via vendor.'),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK')),
        ],
      ),
    );
  }
}
