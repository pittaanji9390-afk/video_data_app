import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../config/routes/app_routes.dart';
import '../../services/auth_service.dart';
import '../../widgets/powered_by_footer.dart';

class MobileAdminDashboardScreen extends StatefulWidget {
  const MobileAdminDashboardScreen({super.key});

  @override
  State<MobileAdminDashboardScreen> createState() => _MobileAdminDashboardScreenState();
}

class _MobileAdminDashboardScreenState extends State<MobileAdminDashboardScreen> {
  int _activeNavIndex = 0; // 0: Dashboard, 1: Vendors, 2: Candidates, 3: QC Review, 4: Payments/Reports

  // Vendors state
  List<Map<String, dynamic>> _vendors = [
    {
      'id': 'VEN-001',
      'name': 'ABC Solutions',
      'contact': 'Rahul Kumar',
      'email': 'rahul@abc.com',
      'candidates': 20,
      'videos': 868,
      'earnings': '₹152,000',
      'status': 'Active',
    },
    {
      'id': 'VEN-002',
      'name': 'PQR Enterprises',
      'contact': 'Priya Sharma',
      'email': 'priya@pqr.com',
      'candidates': 158,
      'videos': 628,
      'earnings': '₹36,500',
      'status': 'Active',
    },
    {
      'id': 'VEN-003',
      'name': 'LMN Groups',
      'contact': 'Kiran Patel',
      'email': 'kiran@lmn.com',
      'candidates': 25,
      'videos': 410,
      'earnings': '₹25,300',
      'status': 'Inactive',
    },
  ];

  // Candidates state
  List<Map<String, dynamic>> _candidates = [
    {'id': 'CND-001', 'name': 'Rahul Kumar', 'vendor': 'ABC Solutions', 'videos': 15, 'status': 'Active'},
    {'id': 'CND-002', 'name': 'Priya Sharma', 'vendor': 'ABC Solutions', 'videos': 12, 'status': 'Active'},
    {'id': 'CND-003', 'name': 'Kiran Patel', 'vendor': 'PQR Enterprises', 'videos': 8, 'status': 'Active'},
    {'id': 'CND-004', 'name': 'Amit Verma', 'vendor': 'PQR Enterprises', 'videos': 5, 'status': 'Inactive'},
    {'id': 'CND-005', 'name': 'Neha Singh', 'vendor': 'LMN Groups', 'videos': 4, 'status': 'Active'},
  ];

  // Add Vendor Dialog State
  final _vendorNameCtrl = TextEditingController();
  final _contactPersonCtrl = TextEditingController();
  final _vendorEmailCtrl = TextEditingController();
  final _vendorPhoneCtrl = TextEditingController();

  Future<void> _handleLogout() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, AppRoutes.login);
  }

  void _showAddVendorDialog() {
    _vendorNameCtrl.clear();
    _contactPersonCtrl.clear();
    _vendorEmailCtrl.clear();
    _vendorPhoneCtrl.clear();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add New Vendor', style: TextStyle(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: _vendorNameCtrl, decoration: const InputDecoration(labelText: 'Company / Vendor Name')),
              const SizedBox(height: 8),
              TextField(controller: _contactPersonCtrl, decoration: const InputDecoration(labelText: 'Contact Person')),
              const SizedBox(height: 8),
              TextField(controller: _vendorEmailCtrl, decoration: const InputDecoration(labelText: 'Email Address')),
              const SizedBox(height: 8),
              TextField(controller: _vendorPhoneCtrl, decoration: const InputDecoration(labelText: 'Phone Number')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (_vendorNameCtrl.text.trim().isEmpty) return;
              setState(() {
                _vendors.insert(0, {
                  'id': 'VEN-00${_vendors.length + 1}',
                  'name': _vendorNameCtrl.text.trim(),
                  'contact': _contactPersonCtrl.text.trim().isEmpty ? 'Admin Contact' : _contactPersonCtrl.text.trim(),
                  'email': _vendorEmailCtrl.text.trim().isEmpty ? 'vendor@example.com' : _vendorEmailCtrl.text.trim(),
                  'candidates': 0,
                  'videos': 0,
                  'earnings': '₹0',
                  'status': 'Active',
                });
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Vendor "${_vendorNameCtrl.text.trim()}" created successfully!'), backgroundColor: AppColors.success),
              );
            },
            child: const Text('Create Vendor'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Admin Platform', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Operations & QC Control', style: TextStyle(fontSize: 11, color: Colors.grey)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppColors.error),
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: IndexedStack(
        index: _activeNavIndex,
        children: [
          _buildDashboardScreen(),
          _buildVendorManagementScreen(),
          _buildCandidatesListScreen(),
          _buildQCReviewScreen(),
          _buildPaymentsAndReportsScreen(),
        ],
      ),
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const PoweredByFooter(),
          BottomNavigationBar(
            currentIndex: _activeNavIndex,
            onTap: (idx) => setState(() => _activeNavIndex = idx),
            selectedItemColor: AppColors.primary,
            unselectedItemColor: Colors.grey,
            type: BottomNavigationBarType.fixed,
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'Dashboard'),
              BottomNavigationBarItem(icon: Icon(Icons.storefront_rounded), label: 'Vendors'),
              BottomNavigationBarItem(icon: Icon(Icons.people_rounded), label: 'Candidates'),
              BottomNavigationBarItem(icon: Icon(Icons.fact_check_rounded), label: 'QC Review'),
              BottomNavigationBarItem(icon: Icon(Icons.payments_rounded), label: 'Payments'),
            ],
          ),
        ],
      ),
    );
  }

  // 1. ADMIN DASHBOARD SCREEN (Screen #2 in Image 2)
  Widget _buildDashboardScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Greeting
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Hello, Admin 👋', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  Text("Here's what's happening today", style: TextStyle(fontSize: 13, color: Colors.grey)),
                ],
              ),
              CircleAvatar(backgroundColor: AppColors.primary, child: Icon(Icons.shield, color: Colors.white)),
            ],
          ),
          const SizedBox(height: 20),

          // 2x3 Metrics Grid (Matching Image 2 Screen 2)
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.4,
            children: [
              _buildStatTile('Vendors', '${_vendors.length}', Icons.storefront_rounded, AppColors.primary),
              _buildStatTile('Candidates', '${_candidates.length}', Icons.people_rounded, AppColors.secondary),
              _buildStatTile('Videos', '8,542', Icons.videocam_rounded, Colors.purple),
              _buildStatTile('Pending QC', '124', Icons.hourglass_top_rounded, Colors.amber.shade800),
              _buildStatTile('Approved', '7,950', Icons.check_circle_rounded, AppColors.success),
              _buildStatTile('Rejected', '592', Icons.cancel_rounded, AppColors.error),
            ],
          ),
          const SizedBox(height: 24),

          // Recent Activities Section
          const Text('Recent Activities', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildActivityItem('New Vendor Added', 'ABC Solutions', '10:30 AM', Icons.storefront_rounded, AppColors.primary),
          _buildActivityItem('Video Approved', 'Kitchen Video - Rahul', '09:45 AM', Icons.check_circle_rounded, AppColors.success),
          _buildActivityItem('Payment Released', 'Vendor ABC - ₹15,200', 'Yesterday', Icons.payments_rounded, Colors.amber.shade800),
        ],
      ),
    );
  }

  // 2. VENDOR MANAGEMENT SCREEN (Screen #4 in Image 2)
  Widget _buildVendorManagementScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Vendor Management', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ElevatedButton.icon(
                onPressed: _showAddVendorDialog,
                icon: const Icon(Icons.add_rounded, color: Colors.white, size: 18),
                label: const Text('+ Add Vendor', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Vendor Cards List
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _vendors.length,
            itemBuilder: (ctx, i) {
              final v = _vendors[i];
              final isActive = v['status'] == 'Active';
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(backgroundColor: AppColors.primary.withAlpha(25), child: Text(v['name'][0], style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary))),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(v['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  Text('ID: ${v['id']}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                ],
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: (isActive ? AppColors.success : Colors.grey).withAlpha(25), borderRadius: BorderRadius.circular(12)),
                            child: Text(v['status'], style: TextStyle(color: isActive ? AppColors.success : Colors.grey, fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildMiniDetail('Candidates', '${v['candidates']}'),
                          _buildMiniDetail('Videos', '${v['videos']}'),
                          _buildMiniDetail('Earnings', v['earnings']),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // 3. CANDIDATES DIRECTORY SCREEN
  Widget _buildCandidatesListScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Candidate Subject Roster', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _candidates.length,
            itemBuilder: (ctx, i) {
              final c = _candidates[i];
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: CircleAvatar(backgroundColor: AppColors.secondary.withAlpha(30), child: Text(c['name'][0], style: const TextStyle(color: AppColors.secondary, fontWeight: FontWeight.bold))),
                  title: Text(c['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${c['id']} • Vendor: ${c['vendor']}'),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: AppColors.success.withAlpha(20), borderRadius: BorderRadius.circular(8)),
                    child: Text('${c['videos']} Videos', style: const TextStyle(color: AppColors.success, fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // 4. VIDEO REVIEW (QC PANEL) SCREEN (Screen #3 in Image 2)
  Widget _buildQCReviewScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Video Review (QC Panel)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 14),

          // Video Player Container
          Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                const Icon(Icons.play_circle_fill_rounded, color: Colors.white, size: 64),
                Positioned(
                  bottom: 10,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(6)),
                    child: const Text('30:15', style: TextStyle(color: Colors.white, fontSize: 11)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Metadata Table
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildMetaRow('Vendor', 'ABC Solutions'),
                  const Divider(),
                  _buildMetaRow('Candidate', 'Rahul Kumar'),
                  const Divider(),
                  _buildMetaRow('Duration', '30:15'),
                  const Divider(),
                  _buildMetaRow('Uploaded On', '12 May 2024, 10:30 AM'),
                  const Divider(),
                  _buildMetaRow('Environment', 'Kitchen'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Quality Score Gauge Card
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: const ListTile(
              leading: CircleAvatar(backgroundColor: Color(0xFFDCFCE7), child: Text('92%', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.success))),
              title: Text('Quality Score 92%', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('Good video quality, clear lighting'),
            ),
          ),
          const SizedBox(height: 20),

          // Reject / Approve Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Video Rejected.'), backgroundColor: AppColors.error));
                  },
                  style: OutlinedButton.styleFrom(foregroundColor: AppColors.error, side: const BorderSide(color: AppColors.error), padding: const EdgeInsets.symmetric(vertical: 14)),
                  child: const Text('Reject', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Video Approved!'), backgroundColor: AppColors.success));
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, padding: const EdgeInsets.symmetric(vertical: 14)),
                  child: const Text('Approve', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 5. PAYMENTS & FINANCIAL REPORTS SCREEN (Screen #6, #7 in Image 2)
  Widget _buildPaymentsAndReportsScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Earnings & Payouts', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 14),

          // Total Payout Banner Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Total Payout Settlement', style: TextStyle(color: Colors.white70, fontSize: 12)),
                SizedBox(height: 6),
                Text('₹18,52,000', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(child: _buildPayCard('Pending', '₹2,50,000', Colors.amber.shade800)),
              const SizedBox(width: 12),
              Expanded(child: _buildPayCard('Completed', '₹16,02,000', AppColors.success)),
            ],
          ),
          const SizedBox(height: 20),

          ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Monthly financial report generated & downloaded!'), backgroundColor: AppColors.success));
            },
            icon: const Icon(Icons.download_rounded, color: Colors.white),
            label: const Text('Generate Financial Report (CSV)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
          ),
        ],
      ),
    );
  }

  Widget _buildStatTile(String title, String val, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withAlpha(50)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
              Icon(icon, color: color, size: 20),
            ],
          ),
          Text(val, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildActivityItem(String title, String desc, String time, IconData icon, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: color.withAlpha(20), child: Icon(icon, color: color, size: 20)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(desc, style: const TextStyle(fontSize: 12)),
        trailing: Text(time, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ),
    );
  }

  Widget _buildMiniDetail(String label, String val) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 2),
        Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }

  Widget _buildMetaRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildPayCard(String label, String val, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withAlpha(60)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(val, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}
