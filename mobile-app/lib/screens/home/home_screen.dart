import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../config/routes/app_routes.dart';
import '../../core/constants/api_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../services/auth_service.dart';
import '../profile/profile_screen.dart';
import '../../widgets/powered_by_footer.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTab = 0;
  int _unreadCount = 0;
  List<Map<String, dynamic>> _realtimeNotifications = [];

  @override
  void initState() {
    super.initState();
    _fetchUnreadNotifications();
  }

  Future<void> _fetchUnreadNotifications() async {
    try {
      final headers = await AuthService.getAuthHeaders();
      final url = Uri.parse('${ApiConstants.baseUrl}/notifications');
      final res = await http.get(url, headers: headers).timeout(const Duration(seconds: 3));

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        final List items = body['data']?['notifications'] ?? [];
        if (mounted) {
          setState(() {
            _realtimeNotifications = List<Map<String, dynamic>>.from(items);
            _unreadCount = body['data']?['unreadCount'] ?? _realtimeNotifications.where((n) => !(n['read'] ?? false)).length;
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _markNotificationRead(Map<String, dynamic> notif) async {
    final notifId = notif['id'];
    try {
      final headers = await AuthService.getAuthHeaders();
      final url = Uri.parse('${ApiConstants.baseUrl}/api/v1/notifications/$notifId/mark-read');
      await http.put(url, headers: headers);
    } catch (_) {}

    if (mounted) {
      setState(() {
        _realtimeNotifications.removeWhere((n) => n['id'] == notifId);
        if (_unreadCount > 0) _unreadCount--;
      });
      Navigator.pop(context); // Close notification drawer
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Marked read: ${notif['title']}'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
    }
  }

  void _showNotificationPopover() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.notifications_active_rounded, color: Color(0xFF2563EB), size: 22),
                      const SizedBox(width: 8),
                      const Text('Real-Time Alerts', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                      const SizedBox(width: 8),
                      if (_unreadCount > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: const Color(0xFFEF4444), borderRadius: BorderRadius.circular(10)),
                          child: Text('$_unreadCount NEW', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                  IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B))),
                ],
              ),
              const SizedBox(height: 12),
              if (_realtimeNotifications.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16)),
                  child: const Column(
                    children: [
                      Icon(Icons.check_circle_outline_rounded, size: 42, color: Color(0xFF10B981)),
                      SizedBox(height: 8),
                      Text('No Unread Real-Time Alerts', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF334155))),
                      SizedBox(height: 4),
                      Text('System notifications appear here automatically when events occur.', style: TextStyle(fontSize: 11, color: Color(0xFF64748B)), textAlign: TextAlign.center),
                    ],
                  ),
                )
              else
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: _realtimeNotifications.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, idx) {
                      final notif = _realtimeNotifications[idx];
                      final color = notif['color'] != null ? (notif['color'] is Color ? notif['color'] : const Color(0xFF2563EB)) : const Color(0xFF2563EB);

                      return InkWell(
                        onTap: () => _markNotificationRead(notif),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFBFDBFE)),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: const Color(0xFF2563EB).withOpacity(0.12),
                                radius: 18,
                                child: const Icon(Icons.notifications_rounded, color: Color(0xFF2563EB), size: 18),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(notif['title'] ?? 'Alert', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                                    const SizedBox(height: 2),
                                    Text(notif['desc'] ?? notif['message'] ?? '', style: const TextStyle(fontSize: 11, color: Color(0xFF475569))),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.check_circle_outline_rounded, color: Color(0xFF2563EB), size: 18),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: IndexedStack(
        index: _currentTab,
        children: [
          _HomeDashboardTab(
            unreadCount: _unreadCount,
            onNotificationTap: _showNotificationPopover,
          ),
          const Placeholder(), // Record tab triggers camera
          const Placeholder(),
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
              BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
            ],
          ),
        ],
      ),
    );
  }
}

class _HomeDashboardTab extends StatelessWidget {
  final int unreadCount;
  final VoidCallback onNotificationTap;

  const _HomeDashboardTab({
    required this.unreadCount,
    required this.onNotificationTap,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Header: Greeting & Real-time Notification Bell Badge
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
                Stack(
                  alignment: Alignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.notifications_outlined, color: Color(0xFF475569), size: 26),
                      onPressed: onNotificationTap,
                    ),
                    if (unreadCount > 0)
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle),
                          child: Text(
                            '$unreadCount',
                            style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Quick Actions Cards
            Row(
              children: [
                Expanded(
                  child: _buildQuickActionCard(
                    context,
                    title: 'Record Video',
                    subtitle: 'Capture dataset clip',
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

            const SizedBox(height: 28),

            // Recent Activity Section
            const Text(
              'Recent Uploads & Real-Time Status',
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
                  backgroundColor: AppColors.primary.withOpacity(0.12),
                  child: const Icon(Icons.kitchen_rounded, color: AppColors.primary),
                ),
                title: const Text('Kitchen Video Task', style: TextStyle(fontWeight: FontWeight.bold)),
                subtitle: const Text('Uploaded • 10 min ago'),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Pending QC',
                    style: TextStyle(color: Color(0xFFD97706), fontSize: 11, fontWeight: FontWeight.bold),
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
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
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
}
