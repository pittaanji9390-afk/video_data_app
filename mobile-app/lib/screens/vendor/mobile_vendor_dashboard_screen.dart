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
  int _currentTab = 0; // 0: Home, 1: Candidates, 2: Uploads, 3: Notifications, 4: Profile
  String _activeUploadFilter = 'All';

  // Candidates list state
  final List<Map<String, dynamic>> _vendorCandidates = [
    {'id': 'CAND-001', 'name': 'Rahul Kumar', 'videos': 15, 'status': 'Active', 'phone': '+91 98765 43210'},
    {'id': 'CAND-002', 'name': 'Priya Sharma', 'videos': 12, 'status': 'Active', 'phone': '+91 98765 43211'},
    {'id': 'CAND-003', 'name': 'Kiran Patel', 'videos': 8, 'status': 'Active', 'phone': '+91 98765 43212'},
    {'id': 'CAND-004', 'name': 'Amit Verma', 'videos': 5, 'status': 'Inactive', 'phone': '+91 98765 43213'},
    {'id': 'CAND-005', 'name': 'Neha Singh', 'videos': 4, 'status': 'Active', 'phone': '+91 98765 43214'},
  ];

  // Uploads list state
  final List<Map<String, dynamic>> _vendorUploads = [
    {'id': 'VID-301', 'title': 'Kitchen Video', 'time': '10 May 2024, 10:30 AM', 'duration': '30:15', 'status': 'Approved', 'env': 'Kitchen'},
    {'id': 'VID-302', 'title': 'Bedroom Video', 'time': '12 May 2024, 09:15 AM', 'duration': '28:40', 'status': 'Pending', 'env': 'Bedroom'},
    {'id': 'VID-303', 'title': 'Garden Video', 'time': '11 May 2024, 06:20 PM', 'duration': '25:30', 'status': 'Rejected', 'env': 'Garden'},
    {'id': 'VID-304', 'title': 'Office Video', 'time': '11 May 2024, 07:10 PM', 'duration': '32:20', 'status': 'Approved', 'env': 'Office'},
    {'id': 'VID-305', 'title': 'Living Room Video', 'time': '10 May 2024, 04:45 PM', 'duration': '29:10', 'status': 'Approved', 'env': 'Living Room'},
  ];

  // Add Candidate Dialog Controllers
  final _candNameCtrl = TextEditingController();
  final _candPhoneCtrl = TextEditingController();
  String _searchCandidateQuery = '';

  List<Map<String, dynamic>> _vendorNotifications = [
    {'id': 'n1', 'title': 'Video Approved', 'desc': 'Kitchen Video has been approved.', 'time': '10:30 AM', 'color': AppColors.success, 'read': false},
    {'id': 'n2', 'title': 'Upload Complete', 'desc': 'Bedroom Video upload successfully completed.', 'time': '09:45 AM', 'color': AppColors.primary, 'read': false},
    {'id': 'n3', 'title': 'Payment Received', 'desc': '₹2,500 has been credited to your account.', 'time': 'Yesterday', 'color': Colors.purple, 'read': true},
  ];

  int get _unreadNotificationCount => _vendorNotifications.where((n) => n['read'] == false).length;

  Future<void> _markNotificationsAsRead() async {
    setState(() {
      for (var n in _vendorNotifications) {
        n['read'] = true;
      }
    });
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('notifications_all_read', true);
    } catch (_) {}
  }

  Future<void> _handleLogout() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, AppRoutes.login);
  }

  void _showAddCandidateModal() {
    _candNameCtrl.clear();
    _candPhoneCtrl.clear();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Onboard New Candidate', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: _candNameCtrl, decoration: const InputDecoration(labelText: 'Candidate Full Name')),
            const SizedBox(height: 8),
            TextField(controller: _candPhoneCtrl, decoration: const InputDecoration(labelText: 'Mobile Number (+91 / +1)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (_candNameCtrl.text.trim().isEmpty) return;
              setState(() {
                _vendorCandidates.insert(0, {
                  'id': 'CAND-00${_vendorCandidates.length + 1}',
                  'name': _candNameCtrl.text.trim(),
                  'videos': 0,
                  'status': 'Active',
                  'phone': _candPhoneCtrl.text.trim().isEmpty ? '+91 98765 00000' : _candPhoneCtrl.text.trim(),
                });
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Candidate "${_candNameCtrl.text.trim()}" onboarded!'), backgroundColor: AppColors.success),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
            child: const Text('Save Candidate', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
            Text('Vendor Dashboard', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Vendor 001 • Operations', style: TextStyle(fontSize: 11, color: Colors.grey)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => setState(() => _currentTab = 3),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppColors.error),
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentTab,
        children: [
          _buildHomeDashboardTab(),
          _buildCandidatesTab(),
          _buildUploadStatusTab(),
          _buildNotificationsTab(),
          _buildProfileTab(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentTab,
        onTap: (idx) => setState(() => _currentTab = idx),
        selectedItemColor: AppColors.success,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.people_rounded), label: 'Candidates'),
          BottomNavigationBarItem(icon: Icon(Icons.cloud_upload_rounded), label: 'Uploads'),
          BottomNavigationBarItem(icon: Icon(Icons.notifications_rounded), label: 'Alerts'),
          BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
      ),
    );
  }

  // 1. VENDOR HOME DASHBOARD TAB (Screen #2 in Image 2)
  Widget _buildHomeDashboardTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Good Morning,', style: TextStyle(fontSize: 13, color: Colors.grey)),
                  Text('Vendor 001 👋', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                ],
              ),
              Row(
                children: [
                  IconButton(
                    onPressed: () {
                      setState(() => _currentTab = 3);
                      _markNotificationsAsRead();
                    },
                    icon: Badge(
                      isLabelVisible: _unreadNotificationCount > 0,
                      label: Text('$_unreadNotificationCount'),
                      child: const Icon(Icons.notifications_rounded, color: Colors.black87, size: 26),
                    ),
                  ),
                  const SizedBox(width: 4),
                  const CircleAvatar(backgroundColor: AppColors.success, child: Icon(Icons.storefront_rounded, color: Colors.white)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Today's Progress Card (Green theme with rounded corners 18)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.success,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: AppColors.success.withOpacity(0.25),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("TODAY'S PROGRESS", style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8)),
                SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Videos', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        SizedBox(height: 4),
                        Text('15', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Container(height: 30, width: 1, color: Colors.white24),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Hours', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        SizedBox(height: 4),
                        Text('06:20', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Clean Full-Width Approved Videos Stat Card (Earnings Removed)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFFDCFCE7),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFBBF7D0)),
              boxShadow: [
                BoxShadow(
                  color: AppColors.success.withOpacity(0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('APPROVED VIDEOS', style: TextStyle(fontSize: 11, color: Color(0xFF15803D), fontWeight: FontWeight.extrabold, letterSpacing: 0.8)),
                    SizedBox(height: 6),
                    Text('285', style: TextStyle(fontSize: 26, fontWeight: FontWeight.extrabold, color: Color(0xFF166534))),
                    SizedBox(height: 4),
                    Text('This month • Verified QC Approvals', style: TextStyle(fontSize: 11, color: Color(0xFF166534))),
                  ],
                ),
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFF15803D).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.check_circle_rounded, color: Color(0xFF15803D), size: 28),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Candidate Status Breakdown Card Grid
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'CANDIDATE STATUS BREAKDOWN',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.extrabold, color: Colors.black87, letterSpacing: 0.5),
                ),
                const SizedBox(height: 12),

                _vendorCandidates.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16.0),
                        child: Center(
                          child: Text(
                            'No candidates assigned yet.',
                            style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                        ),
                      )
                    : GridView.count(
                        crossAxisCount: 3,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                        childAspectRatio: 1.6,
                        children: [
                          _buildStatusMiniTile('Total', '${_vendorCandidates.length}', const Color(0xFF6366F1), const Color(0xFFEEF2FF)),
                          _buildStatusMiniTile('Pending', '3', const Color(0xFFD97706), const Color(0xFFFEF3C7)),
                          _buildStatusMiniTile('In Review', '5', const Color(0xFF0284C7), const Color(0xFFE0F2FE)),
                          _buildStatusMiniTile('Shortlisted', '4', const Color(0xFF16A34A), const Color(0xFFDCFCE7)),
                          _buildStatusMiniTile('Rejected', '1', const Color(0xFFDC2626), const Color(0xFFFEE2E2)),
                          _buildStatusMiniTile('Hired', '1', const Color(0xFF9333EA), const Color(0xFFF3E8FF)),
                        ],
                      ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Recent Uploads
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Recent Uploads', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
              TextButton(onPressed: () => setState(() => _currentTab = 2), child: const Text('View All', style: TextStyle(color: AppColors.success))),
            ],
          ),
          const SizedBox(height: 8),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _vendorUploads.length.clamp(0, 3),
            itemBuilder: (ctx, i) {
              final item = _vendorUploads[i];
              final isAppr = item['status'] == 'Approved';
              final isPend = item['status'] == 'Pending';
              final statusColor = isAppr ? AppColors.success : isPend ? Colors.amber.shade800 : AppColors.error;

              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: CircleAvatar(backgroundColor: statusColor.withAlpha(25), child: Icon(Icons.videocam_rounded, color: statusColor)),
                  title: Text(item['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(item['time']),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: statusColor.withAlpha(20), borderRadius: BorderRadius.circular(8)),
                    child: Text(item['status'], style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11)),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // 2. CANDIDATES ROSTER TAB (Screen #3 in Image 2)
  Widget _buildCandidatesTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Candidates', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              ElevatedButton.icon(
                onPressed: _showAddCandidateModal,
                icon: const Icon(Icons.add_rounded, color: Colors.white, size: 18),
                label: const Text('+ Add Candidate', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Search Field
          TextField(
            onChanged: (val) {
              setState(() {
                _searchCandidateQuery = val;
              });
            },
            decoration: InputDecoration(
              hintText: 'Search candidates...',
              prefixIcon: const Icon(Icons.search_rounded),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
            ),
          ),
          const SizedBox(height: 16),

          // Candidate Items Roster
          Builder(
            builder: (context) {
              final filtered = _vendorCandidates.where((c) {
                final q = _searchCandidateQuery.toLowerCase().trim();
                if (q.isEmpty) return true;
                final name = (c['name'] ?? '').toString().toLowerCase();
                final id = (c['id'] ?? '').toString().toLowerCase();
                final phone = (c['phone'] ?? '').toString().toLowerCase();
                return name.contains(q) || id.contains(q) || phone.contains(q);
              }).toList();

              if (filtered.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 32.0),
                  child: Center(
                    child: Text('No candidates match your search', style: TextStyle(color: Colors.grey)),
                  ),
                );
              }

              return ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filtered.length,
                itemBuilder: (ctx, i) {
                  final c = filtered[i];
                  final isActive = c['status'] == 'Active';
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: ListTile(
                      leading: CircleAvatar(backgroundColor: AppColors.success.withAlpha(30), child: Text(c['name'][0], style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.success))),
                      title: Text(c['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${c['id']} • ${c['videos']} Videos'),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: (isActive ? AppColors.success : Colors.grey).withAlpha(20), borderRadius: BorderRadius.circular(8)),
                        child: Text(c['status'], style: TextStyle(color: isActive ? AppColors.success : Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }

  // 3. UPLOAD STATUS TAB (Screen #4, #5 in Image 2)
  Widget _buildUploadStatusTab() {
    final filtered = _activeUploadFilter == 'All'
        ? _vendorUploads
        : _vendorUploads.where((u) => u['status'] == _activeUploadFilter).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Upload Status', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),

          // Filter Segment Chips
          Row(
            children: ['All', 'Pending', 'Approved', 'Rejected'].map((status) {
              final isSel = _activeUploadFilter == status;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Text(status),
                  selected: isSel,
                  selectedColor: AppColors.success,
                  labelStyle: TextStyle(color: isSel ? Colors.white : Colors.black, fontWeight: FontWeight.bold),
                  onSelected: (val) => setState(() => _activeUploadFilter = status),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          // Uploaded Videos List
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filtered.length,
            itemBuilder: (ctx, i) {
              final item = filtered[i];
              final isAppr = item['status'] == 'Approved';
              final isPend = item['status'] == 'Pending';
              final statusColor = isAppr ? AppColors.success : isPend ? Colors.amber.shade800 : AppColors.error;

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.play_arrow_rounded, color: Colors.white),
                  ),
                  title: Text(item['title'], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${item['time']}\nDuration: ${item['duration']}'),
                  trailing: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: statusColor.withAlpha(20), borderRadius: BorderRadius.circular(8)),
                    child: Text(item['status'], style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11)),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  void _handleNotificationTap(Map<String, dynamic> n) {
    setState(() {
      n['read'] = true;
    });

    final title = (n['title'] ?? '').toString().toLowerCase();
    if (title.contains('approved')) {
      setState(() {
        _activeUploadFilter = 'Approved';
        _currentTab = 2;
      });
    } else if (title.contains('rejected')) {
      setState(() {
        _activeUploadFilter = 'Rejected';
        _currentTab = 2;
      });
    } else if (title.contains('upload')) {
      setState(() {
        _activeUploadFilter = 'All';
        _currentTab = 2;
      });
    } else if (title.contains('payment') || title.contains('credit') || title.contains('earnings')) {
      setState(() {
        _currentTab = 4;
      });
    } else if (title.contains('candidate')) {
      setState(() {
        _currentTab = 1;
      });
    } else {
      setState(() {
        _currentTab = 2;
      });
    }
  }

  // 4. NOTIFICATIONS TAB (Screen #6 in Image 2)
  Widget _buildNotificationsTab() {
    _markNotificationsAsRead();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Notifications', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              TextButton(
                onPressed: _markNotificationsAsRead,
                child: const Text('Mark all read', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 14),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _vendorNotifications.length,
            itemBuilder: (ctx, i) {
              final n = _vendorNotifications[i];
              final c = (n['color'] is Color) ? n['color'] as Color : AppColors.success;
              final isRead = n['read'] == true;
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                color: isRead ? Colors.white : const Color(0xFFF0F9FF),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: isRead ? const Color(0xFFE2E8F0) : AppColors.primary.withOpacity(0.3)),
                ),
                child: ListTile(
                  onTap: () => _handleNotificationTap(n),
                  leading: CircleAvatar(backgroundColor: c.withAlpha(25), child: Icon(Icons.notifications_rounded, color: c)),
                  title: Text(n['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(n['desc'] as String),
                  trailing: const Icon(Icons.chevron_right_rounded, color: Colors.grey, size: 20),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // 5. PROFILE TAB (Screen #7 in Image 2)
  Widget _buildProfileTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SizedBox(height: 10),
          const CircleAvatar(radius: 40, backgroundColor: AppColors.success, child: Text('RK', style: TextStyle(fontSize: 28, color: Colors.white, fontWeight: FontWeight.bold))),
          const SizedBox(height: 10),
          const Text('Rahul Kumar', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Vendor 001', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w600)),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: AppColors.success.withAlpha(25), borderRadius: BorderRadius.circular(10)),
                child: const Text('✓ Verified Vendor', style: TextStyle(color: AppColors.success, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Details List Card
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildProfileRow(Icons.email_outlined, 'Email', 'rahul@vendor.com'),
                  const Divider(),
                  _buildProfileRow(Icons.phone_outlined, 'Phone', '+91 98765 43210'),
                  const Divider(),
                  _buildProfileRow(Icons.calendar_month_outlined, 'Joined On', '15 Jan 2024'),
                  const Divider(),
                  _buildProfileRow(Icons.account_balance_outlined, 'Bank Details', '**** 4567'),
                  const Divider(),
                  _buildProfileRow(Icons.receipt_long_outlined, 'GST Number', '27ABCDE1234F1ZS'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          OutlinedButton(
            onPressed: _handleLogout,
            style: OutlinedButton.styleFrom(foregroundColor: AppColors.error, side: const BorderSide(color: AppColors.error), minimumSize: const Size.fromHeight(48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: const Text('Logout', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileRow(IconData icon, String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey, size: 20),
          const SizedBox(width: 12),
          Text(label, style: const TextStyle(color: Colors.grey)),
          const Spacer(),
          Text(val, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildStatusMiniTile(String label, String count, Color color, Color bg) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            count,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: color, height: 1.1),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: color),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
