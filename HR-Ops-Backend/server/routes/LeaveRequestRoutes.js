const express = require('express');
const LeaveRequest = require('../model/leaveRequest');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find()
      .populate('employeeId', 'name employeeId')
      .sort({ appliedAt: -1 });

    const formatted = leaveRequests.map(r => ({
      _id: r._id,
      employeeName: r.employeeId?.name || 'Unknown',
      employeeId: r.employeeId?.employeeId || 'Unknown',
      leaveType: r.leaveType,
      startDate: r.fromDate,
      endDate: r.toDate,
      days: r.days,
      reason: r.reason,
      status: r.status
    }));

    res.json(formatted);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
