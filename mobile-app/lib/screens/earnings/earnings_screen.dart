import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class EarningsScreen extends StatelessWidget {
  const EarningsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Earnings', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimaryLight,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Earnings Hero Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.primaryDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(color: AppColors.primary.withAlpha(60), blurRadius: 12, offset: const Offset(0, 6)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Approved Hours', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            SizedBox(height: 4),
                            Text('18.50 hrs', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('Rate / Hour', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            SizedBox(height: 4),
                            Text('₹100 / hr', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                    const Divider(color: Colors.white24, height: 28),
                    const Text('Total Earnings (This Month)', style: TextStyle(color: Colors.white70, fontSize: 13)),
                    const SizedBox(height: 4),
                    const Text('₹1,850', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.extrabold)),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Recent Payout Settlements
              const Text('Recent Payout Settlements', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimaryLight)),
              const SizedBox(height: 14),

              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Color(0xFFE2E8F0))),
                child: Column(
                  children: [
                    ListTile(
                      leading: CircleAvatar(backgroundColor: AppColors.success.withAlpha(20), child: const Icon(Icons.check_circle, color: AppColors.success)),
                      title: const Text('August 2024 Payout', style: TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: const Text('Paid on 05 Aug 2024 via Vendor'),
                      trailing: const Text('₹1,850', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.success)),
                    ),
                    const Divider(height: 1),
                    ListTile(
                      leading: CircleAvatar(backgroundColor: AppColors.success.withAlpha(20), child: const Icon(Icons.check_circle, color: AppColors.success)),
                      title: const Text('July 2024 Payout', style: TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: const Text('Paid on 05 Jul 2024 via Vendor'),
                      trailing: const Text('₹2,400', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.success)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Download Report Button (Matching Screen #18)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Downloading Payment Report (CSV)...')),
                    );
                  },
                  icon: const Icon(Icons.download_rounded),
                  label: const Text('Download Report (CSV)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
