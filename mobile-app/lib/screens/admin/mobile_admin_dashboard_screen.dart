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
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Add New Vendor', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _vendorNameCtrl,
                decoration: const InputDecoration(labelText: 'Company / Vendor Name'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _contactPersonCtrl,
                decoration: const InputDecoration(labelText: 'Contact Person'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _vendorEmailCtrl,
                decoration: const InputDecoration(labelText: 'Email Address'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _vendorPhoneCtrl,
                decoration: const InputDecoration(labelText: 'Phone Number'),
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
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Create Vendor', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Pure clean white-grey background
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Admin Platform', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
            Text('Operations & QC Control', style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFE2E8F0), height: 1.0),
        ),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined, color: Color(0xFF475569)),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Notifications: 3 pending QC video reviews'), backgroundColor: Color(0xFF2563EB)),
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
      floatingActionButton: _activeNavIndex == 1
          ? FloatingActionButton.extended(
              onPressed: _showAddVendorDialog,
              backgroundColor: const Color(0xFF2563EB),
              elevation: 4,
              icon: const Icon(Icons.add_rounded, color: Colors.white),
              label: const Text('Add Vendor', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : null,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const PoweredByFooter(),
            BottomNavigationBar(
              currentIndex: _activeNavIndex,
              onTap: (idx) => setState(() => _activeNavIndex = idx),
              backgroundColor: Colors.white,
              selectedItemColor: const Color(0xFF2563EB),
              unselectedItemColor: const Color(0xFF94A3B8),
              type: BottomNavigationBarType.fixed,
              selectedFontSize: 11,
              unselectedFontSize: 11,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
              elevation: 0,
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

  // 1. CLEAN WHITE ADMIN DASHBOARD SCREEN
  Widget _buildDashboardScreen() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
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
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.5),
                  ),
                  SizedBox(height: 2),
                  Text(
                    "Here's what's happening today",
                    style: TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF2563EB).withValues(alpha: 0.3),
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

          // 2x3 Metric Cards Grid (Clean White Style with Colored Accents)
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.4,
            children: [
              _buildCleanStatCard(
                title: 'Vendors',
                val: '${_vendors.length}',
                icon: Icons.storefront_rounded,
                accentColor: const Color(0xFF1D4ED8),
                cardBg: const Color(0xFFEFF6FF),
                borderColor: const Color(0xFFBFDBFE),
              ),
              _buildCleanStatCard(
                title: 'Candidates',
                val: '${_candidates.length}',
                icon: Icons.people_rounded,
                accentColor: const Color(0xFF0284C7),
                cardBg: const Color(0xFFF0F9FF),
                borderColor: const Color(0xFFBAE6FD),
              ),
              _buildCleanStatCard(
                title: 'Videos',
                val: '8,542',
                icon: Icons.videocam_rounded,
                accentColor: const Color(0xFF7C3AED),
                cardBg: const Color(0xFFF5F3FF),
                borderColor: const Color(0xFFDDD6FE),
              ),
              _buildCleanStatCard(
                title: 'Pending QC',
                val: '124',
                icon: Icons.hourglass_top_rounded,
                accentColor: const Color(0xFFD97706),
                cardBg: const Color(0xFFFFFBEB),
                borderColor: const Color(0xFFFDE68A),
              ),
              _buildCleanStatCard(
                title: 'Approved',
                val: '7,950',
                icon: Icons.check_circle_rounded,
                accentColor: const Color(0xFF059669),
                cardBg: const Color(0xFFECFDF5),
                borderColor: const Color(0xFFA7F3D0),
              ),
              _buildCleanStatCard(
                title: 'Rejected',
                val: '592',
                icon: Icons.cancel_rounded,
                accentColor: const Color(0xFFE11D48),
                cardBg: const Color(0xFFFFF1F2),
                borderColor: const Color(0xFFFECDD3),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Recent Activities Header
          const Text(
            'Recent Activities',
            style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 12),

          _buildCleanActivityItem(
            title: 'New Vendor Added',
            desc: 'ABC Solutions',
            time: '10:30 AM',
            icon: Icons.storefront_rounded,
            accentColor: const Color(0xFF2563EB),
            bgColor: const Color(0xFFEFF6FF),
          ),
          _buildCleanActivityItem(
            title: 'Video Approved',
            desc: 'Kitchen Video - Rahul',
            time: '09:45 AM',
            icon: Icons.check_circle_rounded,
            accentColor: const Color(0xFF059669),
            bgColor: const Color(0xFFECFDF5),
          ),
          _buildCleanActivityItem(
            title: 'Payment Settlement',
            desc: 'Vendor ABC Solutions - ₹152,000 released',
            time: 'Yesterday',
            icon: Icons.payments_rounded,
            accentColor: const Color(0xFFD97706),
            bgColor: const Color(0xFFFFFBEB),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  // Helper Widget for Clean Light Metric Cards
  Widget _buildCleanStatCard({
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
        border: Border.all(color: borderColor, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: accentColor.withValues(alpha: 0.08),
            blurRadius: 10,
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

  Widget _buildCleanActivityItem({
    required String title,
    required String desc,
    required String time,
    required IconData icon,
    required Color accentColor,
    required Color bgColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: bgColor,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: accentColor, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              ],
            ),
          ),
          Text(time, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
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
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Expanded(
                child: Text(
                  'Vendor Management',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), letterSpacing: -0.5),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: _showAddVendorDialog,
                icon: const Icon(Icons.add_rounded, color: Colors.white, size: 20),
                label: const Text('Add Vendor', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  elevation: 2,
                  shadowColor: const Color(0xFF2563EB).withValues(alpha: 0.3),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
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
                              backgroundColor: const Color(0xFF2563EB).withValues(alpha: 0.1),
                              child: Text(v['name'][0], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(v['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                                Text('ID: ${v['id']}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: (isActive ? const Color(0xFF10B981) : Colors.grey).withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            v['status'],
                            style: TextStyle(color: isActive ? const Color(0xFF059669) : Colors.grey, fontWeight: FontWeight.bold, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 24, color: Color(0xFFE2E8F0)),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildCleanMiniDetail('Candidates', '${v['candidates']}'),
                        _buildCleanMiniDetail('Videos', '${v['videos']}'),
                        _buildCleanMiniDetail('Earnings', v['earnings']),
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
          const Text('Candidate Subject Roster', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
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
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFF0284C7).withValues(alpha: 0.1),
                    child: Text(c['name'][0], style: const TextStyle(color: Color(0xFF0284C7), fontWeight: FontWeight.bold)),
                  ),
                  title: Text(c['name'], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  subtitle: Text('${c['id']} • Vendor: ${c['vendor']}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFA7F3D0))),
                    child: Text('${c['videos']} Videos', style: const TextStyle(color: Color(0xFF059669), fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // 4. VIDEO REVIEW (QC PANEL) SCREEN - 100% REAL-TIME DYNAMIC
  Widget _buildQCReviewScreen() {
    List<dynamic> qcSubmissions = [];
    if (kIsWeb) {
      try {
        final raw = html.window.localStorage['platform_qc_submissions'];
        if (raw != null) {
          qcSubmissions = jsonDecode(raw);
        }
      } catch (e) {
        debugPrint('Error reading QC submissions: $e');
      }
    }

    if (qcSubmissions.isEmpty) {
      return SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.video_library_outlined, size: 64, color: Color(0xFF2563EB)),
              ),
              const SizedBox(height: 20),
              const Text(
                'No Videos Pending QC Review',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 8),
              const Text(
                'Recorded candidate videos will appear here live in real-time as soon as they are submitted.',
                style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {});
                },
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Refresh Real-Time Queue'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final activeItem = qcSubmissions[0];
    final String currentStatus = activeItem['status'] ?? 'Pending';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Video Review (QC Panel)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF2563EB).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${qcSubmissions.length} Live Queue',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Playable Video Container Stream
          Container(
            height: 220,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                const Icon(Icons.play_circle_fill_rounded, color: Colors.white, size: 68),
                Positioned(
                  bottom: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.7), borderRadius: BorderRadius.circular(8)),
                    child: Text(activeItem['title'] ?? 'Live Recording', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
                Positioned(
                  bottom: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.7), borderRadius: BorderRadius.circular(6)),
                    child: Text(activeItem['duration'] ?? '30:00 Mins', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Metadata Table Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2)),
              ],
            ),
            child: Column(
              children: [
                _buildCleanMetaRow('Video ID', activeItem['id'] ?? 'VID-001'),
                const Divider(color: Color(0xFFE2E8F0)),
                _buildCleanMetaRow('Vendor', activeItem['vendor'] ?? 'Acme Video Solutions'),
                const Divider(color: Color(0xFFE2E8F0)),
                _buildCleanMetaRow('Candidate', activeItem['candidateName'] ?? 'Vasavi Kandula'),
                const Divider(color: Color(0xFFE2E8F0)),
                _buildCleanMetaRow('Duration', activeItem['duration'] ?? '30:00 Mins'),
                const Divider(color: Color(0xFFE2E8F0)),
                _buildCleanMetaRow('Uploaded On', activeItem['time'] ?? 'Just Now'),
                const Divider(color: Color(0xFFE2E8F0)),
                _buildCleanMetaRow('Environment', activeItem['env'] ?? 'Kitchen'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Quality Score Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: const Color(0xFF059669),
                  child: Text(
                    '${activeItem['score'] ?? 95}%',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Quality Score ${activeItem['score'] ?? 95}%', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF065F46))),
                    const Text('Good video quality, clear resolution', style: TextStyle(color: Color(0xFF047857), fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Action Buttons: Real-Time Approve / Reject
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    if (kIsWeb) {
                      try {
                        activeItem['status'] = 'Rejected';
                        activeItem['rejectionReason'] = 'Low lighting in dataset frame';
                        qcSubmissions[0] = activeItem;
                        html.window.localStorage['platform_qc_submissions'] = jsonEncode(qcSubmissions);

                        final bc = html.BroadcastChannel('platform_realtime_channel');
                        bc.postMessage({'type': 'QC_STORE_UPDATED', 'payload': qcSubmissions});
                        bc.close();
                      } catch (e) {
                        debugPrint('Error updating status: $e');
                      }
                    }
                    setState(() {});
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Video Rejected (Updated Live in Real-Time)'), backgroundColor: AppColors.error),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFE11D48),
                    side: const BorderSide(color: Color(0xFFE11D48)),
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
                    if (kIsWeb) {
                      try {
                        activeItem['status'] = 'Approved';
                        activeItem['rejectionReason'] = '';
                        qcSubmissions[0] = activeItem;
                        html.window.localStorage['platform_qc_submissions'] = jsonEncode(qcSubmissions);

                        final bc = html.BroadcastChannel('platform_realtime_channel');
                        bc.postMessage({'type': 'QC_STORE_UPDATED', 'payload': qcSubmissions});
                        bc.close();
                      } catch (e) {
                        debugPrint('Error updating status: $e');
                      }
                    }
                    setState(() {});
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Video Approved (Updated Live in Real-Time) ✓'), backgroundColor: Color(0xFF059669)),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 2,
                  ),
                  child: const Text('Approve', style: TextStyle(fontWeight: FontWeight.bold)),
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
          const Text('Payments & Financials', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(child: _buildCleanPayCard('Total Disbursed', '₹2,13,800', const Color(0xFF059669), const Color(0xFFECFDF5), const Color(0xFFA7F3D0))),
              const SizedBox(width: 10),
              Expanded(child: _buildCleanPayCard('Pending Payout', '₹45,200', const Color(0xFFD97706), const Color(0xFFFFFBEB), const Color(0xFFFDE68A))),
            ],
          ),
          const SizedBox(height: 20),

          const Text('Vendor Payout Breakdown', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 12),

          _buildCleanVendorPayRow('ABC Solutions', '₹152,000', 'Paid', const Color(0xFF059669)),
          _buildCleanVendorPayRow('PQR Enterprises', '₹36,500', 'Pending', const Color(0xFFD97706)),
          _buildCleanVendorPayRow('LMN Groups', '₹25,300', 'Paid', const Color(0xFF059669)),
        ],
      ),
    );
  }

  Widget _buildCleanMiniDetail(String label, String val) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
        const SizedBox(height: 2),
        Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
      ],
    );
  }

  Widget _buildCleanMetaRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
        ],
      ),
    );
  }

  Widget _buildCleanPayCard(String label, String val, Color textCol, Color bgCol, Color borderCol) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bgCol,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderCol),
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

  Widget _buildCleanVendorPayRow(String name, String amount, String status, Color statusCol) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const Text('Contract Rate: ₹50/hr', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 15)),
              Text(status, style: TextStyle(color: statusCol, fontWeight: FontWeight.bold, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}
