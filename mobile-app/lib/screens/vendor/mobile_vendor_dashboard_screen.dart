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
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Good Morning,', style: TextStyle(fontSize: 13, color: Colors.grey)),
                  Text('Vendor 001 👋', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                ],
              ),
              CircleAvatar(backgroundColor: AppColors.success, child: Icon(Icons.storefront_rounded, color: Colors.white)),
            ],
          ),
          const SizedBox(height: 18),

          // Today's Progress Card (Green theme)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.success,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("TODAY'S PROGRESS", style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                SizedBox(height: 10),
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

          // Split Metric Cards
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(14)),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Approved Videos', style: TextStyle(fontSize: 12, color: AppColors.success, fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      Text('285', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.success)),
                      Text('This month', style: TextStyle(fontSize: 10, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: const Color(0xFFFEF9C3), borderRadius: BorderRadius.circular(14)),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Earnings', style: TextStyle(fontSize: 12, color: Color(0xFFA16207), fontWeight: FontWeight.bold)),
                      SizedBox(height: 4),
                      Text('₹18,500', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFFA16207))),
                      Text('This month', style: TextStyle(fontSize: 10, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
            ],
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
            decoration: InputDecoration(
              hintText: 'Search candidates...',
              prefixIcon: const Icon(Icons.search_rounded),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
            ),
          ),
          const SizedBox(height: 16),

          // Candidate Items Roster
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _vendorCandidates.length,
            itemBuilder: (ctx, i) {
              final c = _vendorCandidates[i];
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

  // 4. NOTIFICATIONS TAB (Screen #6 in Image 2)
  Widget _buildNotificationsTab() {
    final notifs = [
      {'title': 'Video Approved', 'desc': 'Kitchen Video has been approved.', 'time': '10:30 AM', 'color': AppColors.success},
      {'title': 'Upload Complete', 'desc': 'Bedroom Video upload successfully completed.', 'time': '09:45 AM', 'color': AppColors.primary},
      {'title': 'Payment Received', 'desc': '₹2,500 has been credited to your account.', 'time': 'Yesterday', 'color': Colors.purple},
      {'title': 'Video Rejected', 'desc': 'Garden Video was rejected due to lighting.', 'time': 'Yesterday', 'color': AppColors.error},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Notifications', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 14),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: notifs.length,
            itemBuilder: (ctx, i) {
              final n = notifs[i];
              final c = n['color'] as Color;
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: CircleAvatar(backgroundColor: c.withAlpha(25), child: Icon(Icons.notifications_rounded, color: c)),
                  title: Text(n['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(n['desc'] as String),
                  trailing: Text(n['time'] as String, style: const TextStyle(fontSize: 11, color: Colors.grey)),
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
}
