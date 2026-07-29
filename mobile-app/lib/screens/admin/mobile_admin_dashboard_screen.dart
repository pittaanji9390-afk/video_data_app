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
  int _activeNavIndex = 0; // 0: Dashboard, 1: Vendors, 2: Candidates, 3: QC Review, 4: Payments

  // Vendors state
  final List<Map<String, dynamic>> _vendors = [
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
  final List<Map<String, dynamic>> _candidates = [
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
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Add New Vendor', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _vendorNameCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Company / Vendor Name', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _contactPersonCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Contact Person', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _vendorEmailCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Email Address', labelStyle: TextStyle(color: Colors.grey)),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _vendorPhoneCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(labelText: 'Phone Number', labelStyle: TextStyle(color: Colors.grey)),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.grey))),
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
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
            child: const Text('Create Vendor', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Dark slate theme
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Admin Platform', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
            Text('Operations & QC Control', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
          ],
        ),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Notifications: 3 pending QC video reviews'), backgroundColor: Color(0xFF6366F1)),
                  );
                },
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle),
                ),
              ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
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
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0F172A),
          border: Border(top: BorderSide(color: Color(0xFF1E293B))),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const PoweredByFooter(),
            BottomNavigationBar(
              currentIndex: _activeNavIndex,
              onTap: (idx) => setState(() => _activeNavIndex = idx),
              backgroundColor: const Color(0xFF0F172A),
              selectedItemColor: const Color(0xFF6366F1),
              unselectedItemColor: const Color(0xFF64748B),
              type: BottomNavigationBarType.fixed,
              selectedFontSize: 11,
              unselectedFontSize: 11,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.grid_view_rounded), label: 'Dashboard'),
                BottomNavigationBarItem(icon: Icon(Icons.storefront_rounded), label: 'Vendors'),
                BottomNavigationBarItem(icon: Icon(Icons.people_rounded), label: 'Candidates'),
                BottomNavigationBarItem(icon: Icon(Icons.fact_check_rounded), label: 'QC Review'),
                BottomNavigationBarItem(icon: Icon(Icons.payments_rounded), label: 'Payments'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // 1. ADMIN DASHBOARD SCREEN (Matches UI Design)
  Widget _buildDashboardScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Greeting Row with Blue Shield Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hello, Admin 👋',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  SizedBox(height: 2),
                  Text(
                    "Here's what's happening today",
                    style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF3B82F6).withValues(alpha: 0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(Icons.shield_rounded, color: Colors.white, size: 26),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // 2x3 Metric Cards Grid (Pixel Perfect Matching Reference Image)
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.4,
            children: [
              _buildDarkStatCard(
                title: 'Vendors',
                val: '${_vendors.length}',
                icon: Icons.storefront_rounded,
                accentColor: const Color(0xFF38BDF8),
                cardBg: const Color(0xFF112240),
                borderColor: const Color(0xFF1E3A8A),
              ),
              _buildDarkStatCard(
                title: 'Candidates',
                val: '${_candidates.length}',
                icon: Icons.people_rounded,
                accentColor: const Color(0xFF60A5FA),
                cardBg: const Color(0xFF0F2942),
                borderColor: const Color(0xFF1D4ED8),
              ),
              _buildDarkStatCard(
                title: 'Videos',
                val: '8,542',
                icon: Icons.videocam_rounded,
                accentColor: const Color(0xFFC084FC),
                cardBg: const Color(0xFF1E1B4B),
                borderColor: const Color(0xFF4C1D95),
              ),
              _buildDarkStatCard(
                title: 'Pending QC',
                val: '124',
                icon: Icons.hourglass_top_rounded,
                accentColor: const Color(0xFFF59E0B),
                cardBg: const Color(0xFF2E1C0C),
                borderColor: const Color(0xFF78350F),
              ),
              _buildDarkStatCard(
                title: 'Approved',
                val: '7,950',
                icon: Icons.check_circle_rounded,
                accentColor: const Color(0xFF34D399),
                cardBg: const Color(0xFF064E3B),
                borderColor: const Color(0xFF047857),
              ),
              _buildDarkStatCard(
                title: 'Rejected',
                val: '592',
                icon: Icons.cancel_rounded,
                accentColor: const Color(0xFFF87171),
                cardBg: const Color(0xFF31121C),
                borderColor: const Color(0xFF881337),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Recent Activities Header
          const Text(
            'Recent Activities',
            style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 12),

          _buildDarkActivityItem(
            title: 'New Vendor Added',
            desc: 'ABC Solutions',
            time: '10:30 AM',
            icon: Icons.storefront_rounded,
            accentColor: const Color(0xFF38BDF8),
          ),
          _buildDarkActivityItem(
            title: 'Video Approved',
            desc: 'Kitchen Video - Rahul',
            time: '09:45 AM',
            icon: Icons.check_circle_rounded,
            accentColor: const Color(0xFF34D399),
          ),
          _buildDarkActivityItem(
            title: 'Payment Settlement',
            desc: 'Vendor ABC Solutions - ₹152,000 released',
            time: 'Yesterday',
            icon: Icons.payments_rounded,
            accentColor: const Color(0xFFF59E0B),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  // Helper Widget for Metric Cards
  Widget _buildDarkStatCard({
    required String title,
    required String val,
    required IconData icon,
    required Color accentColor,
    required Color cardBg,
    required Color borderColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor.withValues(alpha: 0.6), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: accentColor),
              ),
              Icon(icon, color: accentColor, size: 22),
            ],
          ),
          Text(
            val,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: accentColor,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDarkActivityItem({
    required String title,
    required String desc,
    required String time,
    required IconData icon,
    required Color accentColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: accentColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
              ],
            ),
          ),
          Text(time, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  // 2. VENDOR MANAGEMENT SCREEN
  Widget _buildVendorManagementScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Vendor Management', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
              ElevatedButton.icon(
                onPressed: _showAddVendorDialog,
                icon: const Icon(Icons.add_rounded, color: Colors.white, size: 18),
                label: const Text('+ Add Vendor', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _vendors.length,
            itemBuilder: (ctx, i) {
              final v = _vendors[i];
              final isActive = v['status'] == 'Active';
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: const Color(0xFF6366F1).withValues(alpha: 0.2),
                              child: Text(v['name'][0], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF818CF8))),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(v['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                                Text('ID: ${v['id']}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: (isActive ? const Color(0xFF10B981) : Colors.grey).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            v['status'],
                            style: TextStyle(color: isActive ? const Color(0xFF34D399) : Colors.grey, fontWeight: FontWeight.bold, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24, color: Color(0xFF334155)),
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
          const Text('Candidate Subject Roster', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _candidates.length,
            itemBuilder: (ctx, i) {
              final c = _candidates[i];
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFF0EA5E9).withValues(alpha: 0.2),
                    child: Text(c['name'][0], style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold)),
                  ),
                  title: Text(c['name'], style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                  subtitle: Text('${c['id']} • Vendor: ${c['vendor']}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
                    child: Text('${c['videos']} Videos', style: const TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // 4. VIDEO REVIEW (QC PANEL) SCREEN
  Widget _buildQCReviewScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Video Review (QC Panel)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 14),

          Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF334155)),
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
                    decoration: BoxDecoration(color: Colors.black70, borderRadius: BorderRadius.circular(6)),
                    child: const Text('30:15', style: TextStyle(color: Colors.white, fontSize: 11)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              children: [
                _buildMetaRow('Vendor', 'ABC Solutions'),
                const Divider(color: Color(0xFF334155)),
                _buildMetaRow('Candidate', 'Rahul Kumar'),
                const Divider(color: Color(0xFF334155)),
                _buildMetaRow('Duration', '30:15'),
                const Divider(color: Color(0xFF334155)),
                _buildMetaRow('Uploaded On', '12 May 2024, 10:30 AM'),
                const Divider(color: Color(0xFF334155)),
                _buildMetaRow('Environment', 'Kitchen'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF059669)),
            ),
            child: const Row(
              children: [
                CircleAvatar(backgroundColor: Color(0xFF064E3B), child: Text('92%', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF34D399)))),
                SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Quality Score 92%', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    Text('Good video quality, clear lighting', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Video Rejected.'), backgroundColor: AppColors.error));
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFEF4444),
                    side: const BorderSide(color: Color(0xFFEF4444)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Reject', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Video Approved!'), backgroundColor: AppColors.success));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Approve', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 5. PAYMENTS & FINANCIAL REPORTS SCREEN
  Widget _buildPaymentsAndReportsScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Payments & Financials', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(child: _buildPayCard('Total Disbursed', '₹2,13,800', const Color(0xFF34D399), const Color(0xFF064E3B))),
              const SizedBox(width: 10),
              Expanded(child: _buildPayCard('Pending Payout', '₹45,200', const Color(0xFFF59E0B), const Color(0xFF2E1C0C))),
            ],
          ),
          const SizedBox(height: 20),

          const Text('Vendor Payout Breakdown', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 12),

          _buildVendorPayRow('ABC Solutions', '₹152,000', 'Paid', const Color(0xFF34D399)),
          _buildVendorPayRow('PQR Enterprises', '₹36,500', 'Pending', const Color(0xFFF59E0B)),
          _buildVendorPayRow('LMN Groups', '₹25,300', 'Paid', const Color(0xFF34D399)),
        ],
      ),
    );
  }

  Widget _buildMiniDetail(String label, String val) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
        const SizedBox(height: 2),
        Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
      ],
    );
  }

  Widget _buildMetaRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
          Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
        ],
      ),
    );
  }

  Widget _buildPayCard(String label, String val, Color textCol, Color bgCol) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bgCol,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: textCol.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 11, color: textCol, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(val, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textCol)),
        ],
      ),
    );
  }

  Widget _buildVendorPayRow(String name, String amount, String status, Color statusCol) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              const Text('Contract Rate: ₹50/hr', style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15)),
              Text(status, style: TextStyle(color: statusCol, fontWeight: FontWeight.bold, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}
