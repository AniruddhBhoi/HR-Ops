const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  leaveType: String,
  leaveReasonType: String,
  fromDate: Date,
  toDate: Date,
  fromTime: String,
  toTime: String,
  days: Number,
  reason: String,
  siteVisitNote: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
