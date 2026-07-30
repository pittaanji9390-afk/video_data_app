import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../core/constants/api_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../config/routes/app_routes.dart';
import '../../services/auth_service.dart';
import '../../widgets/powered_by_footer.dart';

class MobileQCDashboardScreen extends StatefulWidget {
  const MobileQCDashboardScreen({super.key});

  @override
  State<MobileQCDashboardScreen> createState() => _MobileQCDashboardScreenState();
}

class _MobileQCDashboardScreenState extends State<MobileQCDashboardScreen> {
  int _activeTab = 0; // 0: My Assigned Tickets, 1: In Review, 2: QC Approved, 3: QC Rejected
  bool _isLoading = false;

  // QC Sliders State for Active Review Item
  double _audioClarity = 4.0;
  double _lightingQuality = 4.0;
  double _framingScore = 5.0;
  double _envMatchScore = 5.0;

  final TextEditingController _rejectReasonCtrl = TextEditingController();

  Map<String, dynamic> _statistics = {
    'total_assigned': 3,
    'pending_review': 2,
    'in_review': 1,
    'approved': 1,
    'rejected': 0,
    'completed_today': 1,
  };

  List<Map<String, dynamic>> _myTickets = [
    {
      'id': 'TKT-10001',
      'ticket_code': 'TKT-10001',
      'video_id': 'VID-401',
      'video_title': 'Kitchen Workflow Clip',
      'candidate_name': 'Anji (Candidate)',
      'vendor_name': 'ABC Solutions',
      'project_id': 'PRJ-AUDIO-01',
      'environment_tag': 'Kitchen',
      'duration': 32,
      'upload_date': '2026-07-30T10:15:00Z',
      'status': 'pending_qc',
      'assigned_reviewer_name': 'QC Reviewer Specialist',
    },
    {
      'id': 'TKT-10002',
      'ticket_code': 'TKT-10002',
      'video_id': 'VID-402',
      'video_title': 'Living Room Pan Stream',
      'candidate_name': 'Alex Johnson',
      'vendor_name': 'PQR Enterprises',
      'project_id': 'PRJ-VISION-02',
      'environment_tag': 'Living Room',
      'duration': 45,
      'upload_date': '2026-07-30T11:20:00Z',
      'status': 'pending_qc',
      'assigned_reviewer_name': 'QC Reviewer Specialist',
    },
  ];

  List<Map<String, dynamic>> _inReviewTickets = [
    {
      'id': 'TKT-10003',
      'ticket_code': 'TKT-10003',
      'video_id': 'VID-403',
      'video_title': 'Office Desk Motion Test',
      'candidate_name': 'Priya Sharma',
      'vendor_name': 'LMN Groups',
      'project_id': 'PRJ-DESK-03',
      'environment_tag': 'Office',
      'duration': 60,
      'upload_date': '2026-07-30T09:00:00Z',
      'status': 'in_review',
      'assigned_reviewer_name': 'QC Reviewer Specialist',
    },
  ];

  List<Map<String, dynamic>> _qcApprovedList = [
    {
      'id': 'TKT-10000',
      'ticket_code': 'TKT-10000',
      'video_id': 'VID-399',
      'video_title': 'Bedroom Lighting Angle',
      'candidate_name': 'Rahul Kumar',
      'vendor_name': 'ABC Solutions',
      'project_id': 'PRJ-LIGHTING-01',
      'environment_tag': 'Bedroom',
      'duration': 28,
      'upload_date': '2026-07-30T08:00:00Z',
      'status': 'qc_approved',
      'assigned_reviewer_name': 'QC Reviewer Specialist',
    },
  ];

  List<Map<String, dynamic>> _qcRejectedList = [
    {
      'id': 'TKT-9999',
      'ticket_code': 'TKT-9999',
      'video_id': 'VID-398',
      'video_title': 'Garden Walkthrough',
      'candidate_name': 'Kiran Patel',
      'vendor_name': 'LMN Groups',
      'project_id': 'PRJ-OUTDOOR-02',
      'environment_tag': 'Garden',
      'duration': 15,
      'upload_date': '2026-07-30T07:30:00Z',
      'status': 'qc_rejected',
      'assigned_reviewer_name': 'QC Reviewer Specialist',
      'reason': 'Audio level too low; framing off-center',
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchRealQCData();
    _pingActivityHeartbeat();
  }

  @override
  void dispose() {
    _rejectReasonCtrl.dispose();
    super.dispose();
  }

  Future<void> _pingActivityHeartbeat() async {
    try {
      final session = await AuthService.restoreSession();
      final reviewerId = session?['id'] ?? 'q0000000-0000-0000-0000-000000000001';
      final url = Uri.parse('${ApiConstants.baseUrl}/qc-tickets/tickets/reviewer-activity');
      await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'reviewer_id': reviewerId,
          'activity_type': 'dashboard_view',
        }),
      );
    } catch (_) {}
  }

  Future<void> _fetchRealQCData() async {
    setState(() => _isLoading = true);
    try {
      final session = await AuthService.restoreSession();
      final reviewerId = session?['id'] ?? 'q0000000-0000-0000-0000-000000000001';
      final url = Uri.parse('${ApiConstants.baseUrl}/qc-tickets/tickets/my-tickets?reviewer_id=$reviewerId');
      final res = await http.get(url).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final body = jsonDecode(res.body);
        if (body['data'] != null && body['data'] is List) {
          final List rawList = body['data'];
          final parsed = List<Map<String, dynamic>>.from(rawList);
          setState(() {
            _myTickets = parsed.where((t) => t['status'] == 'pending_qc').toList();
            _inReviewTickets = parsed.where((t) => t['status'] == 'in_review').toList();
            _qcApprovedList = parsed.where((t) => t['status'] == 'qc_approved').toList();
            _qcRejectedList = parsed.where((t) => t['status'] == 'qc_rejected').toList();

            if (body['statistics'] != null) {
              _statistics = Map<String, dynamic>.from(body['statistics']);
            }
          });
        }
      }
    } catch (e) {
      debugPrint('QC Tickets API offline fallback: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitQCReview(Map<String, dynamic> item, bool isApproved) async {
    final ticketId = item['id'] ?? item['ticket_code'];
    final reason = _rejectReasonCtrl.text.trim();
    if (!isApproved && reason.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a rejection reason feedback.')),
      );
      return;
    }

    final newStatus = isApproved ? 'qc_approved' : 'qc_rejected';

    try {
      final url = Uri.parse('${ApiConstants.baseUrl}/qc-tickets/tickets/$ticketId/status');
      await http.patch(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'status': newStatus,
          'reason': reason,
        }),
      );
    } catch (_) {}

    setState(() {
      _myTickets.removeWhere((i) => i['id'] == ticketId || i['ticket_code'] == ticketId);
      _inReviewTickets.removeWhere((i) => i['id'] == ticketId || i['ticket_code'] == ticketId);
      final updatedItem = Map<String, dynamic>.from(item);
      updatedItem['status'] = newStatus;
      if (!isApproved) updatedItem['reason'] = reason;

      if (isApproved) {
        _qcApprovedList.insert(0, updatedItem);
        _statistics['approved'] = (_statistics['approved'] ?? 0) + 1;
      } else {
        _qcRejectedList.insert(0, updatedItem);
        _statistics['rejected'] = (_statistics['rejected'] ?? 0) + 1;
      }

      _statistics['completed_today'] = (_statistics['completed_today'] ?? 0) + 1;
      _statistics['pending_review'] = _myTickets.length;
    });

    _rejectReasonCtrl.clear();
    if (mounted) {
      Navigator.pop(context); // Close review modal
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isApproved ? '✅ QC Ticket Approved (Forwarded to Admin Sign-Off)' : '❌ QC Ticket Rejected with Feedback',
          ),
          backgroundColor: isApproved ? const Color(0xFF10B981) : const Color(0xFFEF4444),
        ),
      );
    }
  }

  void _openQCInspectionModal(Map<String, dynamic> item) {
    _audioClarity = 4.5;
    _lightingQuality = 4.0;
    _framingScore = 5.0;
    _envMatchScore = 5.0;
    _rejectReasonCtrl.clear();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, modalSetState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 24,
                top: 24,
                left: 20,
                right: 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF8B5CF6).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'TICKET: ${item['ticket_code'] ?? item['id']}',
                              style: const TextStyle(
                                color: Color(0xFF8B5CF6),
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item['video_title'] ?? 'Video Inspection',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(modalCtx),
                        icon: const Icon(Icons.close_rounded, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      _buildInfoChip(Icons.person, item['candidate_name'] ?? 'Candidate'),
                      _buildInfoChip(Icons.store, item['vendor_name'] ?? 'Vendor'),
                      _buildInfoChip(Icons.work, item['project_id'] ?? 'PRJ-DEFAULT'),
                      _buildInfoChip(Icons.place, item['environment_tag'] ?? 'Environment'),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Video Preview Placeholder Box
                  Container(
                    width: double.infinity,
                    height: 150,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.play_circle_fill_rounded, size: 54, color: Colors.white),
                            SizedBox(height: 6),
                            Text('Tap to Inspect High-Definition Video Clip', style: TextStyle(color: Colors.white70, fontSize: 12)),
                          ],
                        ),
                        Positioned(
                          top: 10,
                          right: 10,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(6)),
                            child: Text(
                              '${item['duration'] ?? 30}s',
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),
                  const Text('📊 QC 4-Tier Evaluation Sliders:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))),
                  const SizedBox(height: 10),

                  _buildRatingSlider('Audio Clarity', _audioClarity, (val) => modalSetState(() => _audioClarity = val)),
                  _buildRatingSlider('Lighting & Clarity', _lightingQuality, (val) => modalSetState(() => _lightingQuality = val)),
                  _buildRatingSlider('Subject Framing Score', _framingScore, (val) => modalSetState(() => _framingScore = val)),
                  _buildRatingSlider('Environment Tag Match', _envMatchScore, (val) => modalSetState(() => _envMatchScore = val)),

                  const SizedBox(height: 16),
                  TextField(
                    controller: _rejectReasonCtrl,
                    decoration: InputDecoration(
                      labelText: 'Rejection Reason / QC Feedback (Required if Rejecting)',
                      labelStyle: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),

                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _submitQCReview(item, false),
                          icon: const Icon(Icons.close_rounded, color: Color(0xFFEF4444)),
                          label: const Text('QC Reject', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFFEF4444)),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _submitQCReview(item, true),
                          icon: const Icon(Icons.check_circle_rounded),
                          label: const Text('QC Approve'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF10B981),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: const Color(0xFF64748B)),
          const SizedBox(width: 4),
          Text(text, style: const TextStyle(fontSize: 11, color: Color(0xFF334155), fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildRatingSlider(String label, double value, ValueChanged<double> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
            Text('${value.toStringAsFixed(1)} / 5.0', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF8B5CF6))),
          ],
        ),
        SliderTheme(
          data: SliderThemeData(
            thumbColor: const Color(0xFF8B5CF6),
            activeTrackColor: const Color(0xFF8B5CF6),
            inactiveTrackColor: const Color(0xFFE2E8F0),
            trackHeight: 4,
          ),
          child: Slider(
            value: value,
            min: 1.0,
            max: 5.0,
            divisions: 8,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Quality Control Hub', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            Text('Least Workload Auto-Allocated Tickets', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            onPressed: _fetchRealQCData,
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF8B5CF6)),
            tooltip: 'Refresh Tickets',
          ),
          IconButton(
            onPressed: () async {
              await AuthService.logout();
              if (mounted) Navigator.pushReplacementNamed(context, AppRoutes.login);
            },
            icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchRealQCData,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Reviewer Activity Status Banner
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8B5CF6).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF8B5CF6).withOpacity(0.2)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.shield_rounded, color: Color(0xFF8B5CF6), size: 20),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Reviewer Status: ACTIVE • Inactivity > 24h triggers automatic ticket reassignment',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF6D28D9)),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Statistics Metrics Grid
                Row(
                  children: [
                    _buildStatCard('Assigned', '${_statistics['total_assigned'] ?? 0}', const Color(0xFF8B5CF6), Icons.assignment_ind_rounded),
                    const SizedBox(width: 8),
                    _buildStatCard('Pending', '${_myTickets.length}', const Color(0xFFF59E0B), Icons.pending_actions_rounded),
                    const SizedBox(width: 8),
                    _buildStatCard('In Review', '${_inReviewTickets.length}', const Color(0xFF0EA5E9), Icons.rate_review_rounded),
                    const SizedBox(width: 8),
                    _buildStatCard('Today', '${_statistics['completed_today'] ?? 0}', const Color(0xFF10B981), Icons.today_rounded),
                  ],
                ),

                const SizedBox(height: 20),

                // Tab Switcher
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(14)),
                  child: Row(
                    children: [
                      _buildTabButton(0, 'My Tickets (${_myTickets.length})'),
                      _buildTabButton(1, 'In Review (${_inReviewTickets.length})'),
                      _buildTabButton(2, 'Approved (${_qcApprovedList.length})'),
                      _buildTabButton(3, 'Rejected (${_qcRejectedList.length})'),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // List Items
                if (_isLoading)
                  const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
                else
                  _buildActiveTabList(),

                const SizedBox(height: 24),
                const PoweredByFooter(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 6),
            Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton(int index, String label) {
    final isSelected = _activeTab == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeTab = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isSelected
                ? [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4, offset: const Offset(0, 2))]
                : [],
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              color: isSelected ? const Color(0xFF8B5CF6) : const Color(0xFF64748B),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActiveTabList() {
    List<Map<String, dynamic>> targetList = [];
    if (_activeTab == 0) targetList = _myTickets;
    if (_activeTab == 1) targetList = _inReviewTickets;
    if (_activeTab == 2) targetList = _qcApprovedList;
    if (_activeTab == 3) targetList = _qcRejectedList;

    if (targetList.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: const Column(
          children: [
            Icon(Icons.inbox_rounded, size: 48, color: Color(0xFFCBD5E1)),
            SizedBox(height: 12),
            Text('No QC tickets found in this queue.', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: targetList.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (ctx, idx) {
        final item = targetList[idx];
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2))],
          ),
          child: Padding(
            padding: const EdgeInsets.all(14.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF8B5CF6).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        item['ticket_code'] ?? item['id'] ?? 'TKT-000',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF8B5CF6)),
                      ),
                    ),
                    _buildStatusChip(item['status'] ?? 'pending_qc'),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  item['video_title'] ?? 'Video Clip Task',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.person_rounded, size: 14, color: Colors.grey.shade600),
                    const SizedBox(width: 4),
                    Text(item['candidate_name'] ?? 'Candidate', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    const SizedBox(width: 12),
                    Icon(Icons.place_rounded, size: 14, color: Colors.grey.shade600),
                    const SizedBox(width: 4),
                    Text(item['environment_tag'] ?? 'Environment', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                  ],
                ),
                if (item['reason'] != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(8)),
                    child: Text('Defect Reason: ${item['reason']}', style: const TextStyle(fontSize: 11, color: Color(0xFFEF4444), fontWeight: FontWeight.w600)),
                  ),
                ],
                if (_activeTab == 0 || _activeTab == 1) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _openQCInspectionModal(item),
                      icon: const Icon(Icons.rate_review_rounded, size: 16),
                      label: const Text('Inspect & Review QC Ticket'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF8B5CF6),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatusChip(String status) {
    Color bg = const Color(0xFFF59E0B);
    Color text = Colors.white;
    String label = 'Pending QC';

    if (status == 'in_review') {
      bg = const Color(0xFF0EA5E9);
      label = 'In Review';
    } else if (status == 'qc_approved') {
      bg = const Color(0xFF10B981);
      label = 'QC Approved';
    } else if (status == 'qc_rejected') {
      bg = const Color(0xFFEF4444);
      label = 'QC Rejected';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg.withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: bg)),
    );
  }
}
