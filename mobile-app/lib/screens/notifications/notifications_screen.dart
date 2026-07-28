import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = [
      {
        'title': 'Video Approved',
        'desc': 'Your Kitchen video sample has been approved.',
        'time': '10:30 AM',
        'icon': Icons.check_circle_outline_rounded,
        'color': AppColors.success,
      },
      {
        'title': 'Upload Complete',
        'desc': 'Bedroom video upload completed successfully.',
        'time': '09:45 AM',
        'icon': Icons.cloud_done_rounded,
        'color': AppColors.primary,
      },
      {
        'title': 'Payment Updated',
        'desc': 'Your monthly earnings settlement was updated.',
        'time': 'Yesterday',
        'icon': Icons.account_balance_wallet_rounded,
        'color': const Color(0xFF8B5CF6),
      },
      {
        'title': 'Upload Failed',
        'desc': 'Bathroom Video failed to upload due to network reset.',
        'time': 'Yesterday',
        'icon': Icons.error_outline_rounded,
        'color': AppColors.error,
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimaryLight,
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: notifications.length,
        itemBuilder: (ctx, idx) {
          final item = notifications[idx];
          final color = item['color'] as Color;
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Color(0xFFE2E8F0))),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: color.withAlpha(20),
                child: Icon(item['icon'] as IconData, color: color),
              ),
              title: Text(item['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(item['desc'] as String),
              trailing: Text(item['time'] as String, style: const TextStyle(fontSize: 11, color: Colors.grey)),
            ),
          );
        },
      ),
    );
  }
}
