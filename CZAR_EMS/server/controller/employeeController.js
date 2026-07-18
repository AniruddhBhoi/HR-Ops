const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../model/userModel');
const Employee = require('../model/employeeModel');
const LeaveRequest = require('../model/leaveRequest');
const Admin = require('../model/adminModel');

// Get profile (works for employee and admin)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'employee') {
      const employee = await Employee.findOne({ userId }).select('-workPassword');
      if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

      const leaveRequests = await LeaveRequest.find({ employeeId: employee._id })
        .sort({ appliedAt: -1 })
        .select('-__v');

      const responsePayload = {
        ...employee.toObject(),
        leaveRequests,
      };

      return res.status(200).json(responsePayload);
    }

    if (user.role === 'admin') {
      // prefer linked admin by userId
      let admin = await Admin.findOne({ userId: user._id }).select('-password');
      if (!admin) admin = await Admin.findOne({ email: user.email }).select('-password');

      if (admin) return res.status(200).json(admin);

      // fallback basic user info
      return res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password (current user)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password too short (min 6 chars)' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Sync with Admin
    const admin = await Admin.findOne({ userId: user._id });
    if (admin) {
      admin.password = newPassword;
      await admin.save();
    }

    // Sync with Employee
    const employee = await Employee.findOne({ userId: user._id });
    if (employee) {
      employee.workPassword = newPassword;
      await employee.save();
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit a leave request
const submitLeaveRequest = async (req, res) => {
  try {
    const { leaveType, leaveReasonType, fromDate, toDate, fromTime, toTime, reason } = req.body;

    if (!leaveType || !fromDate || !toDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (to < from) return res.status(400).json({ message: 'Invalid date range' });

    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = new LeaveRequest({
      employeeId: employee._id,
      leaveType,
      leaveReasonType,
      fromDate,
      toDate,
      fromTime,
      toTime,
      days,
      reason,
      status: 'Pending',
    });

    await leaveRequest.save();

    // NOTIFICATION: Notify all Admins
    const { createNotification } = require('../controller/notificationController');
    const admins = await User.find({ role: { $regex: /^admin$/i } }); // Case insensitive check
    console.log(`[LeaveRequest] Found ${admins.length} admins to notify.`);

    for (const admin of admins) {
      console.log(`[LeaveRequest] Notifying admin: ${admin.name} (${admin._id})`);
      await createNotification(
        admin._id,
        'LeaveRequest',
        `New Leave Request from ${employee.name}`,
        leaveRequest._id,
        req.user.userId
      );
    }

    res.status(201).json({ message: 'Leave request submitted successfully', leaveRequest });
  } catch (error) {
    console.error('Submit Leave Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all own leave requests
const getMyLeaveRequests = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const leaveRequests = await LeaveRequest.find({ employeeId: employee._id })
      .populate('employeeId', 'department')
      .sort({ createdAt: -1 });

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Get Leave Requests Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile (current user)
const updateProfile = async (req, res) => {
  try {
    const { name, phone, personalEmail, dateOfBirth, department, position } = req.body;

    const employee = await Employee.findOneAndUpdate(
      { userId: req.user.userId },
      {
        name,
        phone,
        personalEmail,
        dateOfBirth,
        department,
        position,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    // Update User name for consistency
    await User.findByIdAndUpdate(req.user.userId, { name });

    res.status(200).json({
      message: 'Profile updated successfully',
      employee,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee dashboard data
const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const employee = await Employee.findOne({ userId }).select('-workPassword');
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const leaveRequests = await LeaveRequest.find({ employeeId: employee._id })
      .sort({ appliedAt: -1 })
      .limit(5)
      .select('-__v');

    // Get today's date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // Check if employee is on leave today
    const leaveToday = await LeaveRequest.findOne({
      employeeId: employee._id,
      status: "Approved",
      fromDate: { $lte: todayStr },
      toDate: { $gte: todayStr },
    });

    let attendanceStatus = "present";
    if (leaveToday) {
      if (leaveToday.leaveReasonType && leaveToday.leaveReasonType.toLowerCase() === "sitevisit") {
        attendanceStatus = "sitevisit";
      } else {
        attendanceStatus = "leave";
      }
    }

    // Attendance summary (placeholder - you may need to implement actual attendance tracking)
    const attendanceSummary = {
      present: 0, // Placeholder
      absent: 0,  // Placeholder
    };

    const responsePayload = {
      employee: employee.toObject(),
      leaveRequests,
      attendanceStatus,
      attendanceSummary,
    };
    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Get Employee Dashboard Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// // ADMIN — Get all employees
// exports.getAllEmployees = async (req, res) => {
//   try {
//     const requester = await Employee.findOne({ userId: req.user.userId });

//     if (!requester || requester.role !== 'Admin') {
//       return res.status(403).json({ message: 'Access denied — Admins only' });
//     }

//     const employees = await Employee.find().select('-workPassword');
//     console.log('Employees data:', employees.map(emp => ({ name: emp.name, phone: emp.phone })));
//     res.status(200).json(employees);
//   } catch (error) {
//     console.error('Get All Employees Error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // ADMIN — Update leave status
// exports.updateLeaveStatus = async (req, res) => {
//   try {
//     const requester = await Employee.findOne({ userId: req.user.userId });
//     if (!requester || requester.role !== 'Admin') {
//       return res.status(403).json({ message: 'Access denied — Admins only' });
//     }

//     const { requestId, status } = req.body;
//     if (!['Approved', 'Rejected'].includes(status)) {
//       return res.status(400).json({ message: 'Invalid status' });
//     }

//     const leaveRequest = await LeaveRequest.findById(requestId);
//     if (!leaveRequest) return res.status(404).json({ message: 'Leave request not found' });

//     leaveRequest.status = status;
//     await leaveRequest.save();

//     res.status(200).json({ message: `Leave ${status.toLowerCase()} successfully`, leaveRequest });
//   } catch (error) {
//     console.error('Update Leave Status Error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // ADMIN — Promote employee to admin
// exports.makeAdmin = async (req, res) => {
//   try {
//     const requester = await Employee.findOne({ userId: req.user.userId });
//     if (!requester || requester.role !== 'Admin') {
//       return res.status(403).json({ message: 'Access denied — Admins only' });
//     }

//     const { employeeId } = req.params;

//     const employee = await Employee.findById(employeeId);
//     if (!employee) return res.status(404).json({ message: 'Employee not found' });

//     employee.role = 'Admin';
//     await employee.save();

//     res.status(200).json({ message: 'Employee promoted to Admin successfully', employee });
//   } catch (error) {
//     console.error('Make Admin Error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const Attendance = require('../model/attendanceModel');
const XLSX = require("xlsx");
const path = require('path');
const fs = require('fs');

// --------------------------------------
// 1) Excel Upload & Save to DB
// --------------------------------------
const createAttendance = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert Excel to JSON
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(sheet);

    let { month, year } = req.body;
    month = parseInt(month);
    year = parseInt(year);

    // Delete old month data
    await Attendance.deleteMany({ month, year });

    // Convert Excel rows to DB format
    const formattedData = excelData.map((row) => ({
      employeeId: row.EmpID,
      name: row.Name,
      position: row.Position || "N/A",
      month,
      year,
      totalMonthlyHours: row.TotalHours || 0,
      totalOvertime: row.TotalOvertime || 0,
      attendance: [] // You can fill daily data too if needed
    }));

    await Attendance.insertMany(formattedData);

    res.status(201).json({
      message: "Attendance uploaded & saved successfully",
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------
// 2) Fetch Summary by Month & Year
// --------------------------------------
const getAttendanceSummary = async (req, res) => {
  try {
    let { month, year } = req.query;

    month = parseInt(month);
    year = parseInt(year);

    const records = await Attendance.find({ month, year });

    if (records.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    // Preparing summary format
    const summary = records.map((rec) => ({
      employeeId: rec.employeeId,
      name: rec.name,
      position: rec.position,
      totalHours: rec.totalMonthlyHours,
      totalOvertime: rec.totalOvertime
    }));

    res.status(200).json(summary);
  } catch (error) {
    console.error("Summary Fetch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload profile photo for employee
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const employee = await Employee.findOne({ userId: req.user.userId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Delete old profile photo if exists
    if (employee.profilePhoto) {
      const oldPhotoPath = path.join(__dirname, 'uploads', employee.profilePhoto);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update employee profile with new photo filename
    const filename = `profile_${employee._id}_${Date.now()}${path.extname(req.file.originalname)}`;
    const finalPath = path.join(__dirname, 'uploads', filename);

    // Move file from temp to uploads directory
    fs.renameSync(req.file.path, finalPath);

    employee.profilePhoto = filename;
    await employee.save();

    res.status(200).json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: filename
    });
  } catch (error) {
    console.error('Upload Profile Photo Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// module.exports = { createAttendance, getAttendanceSummary };
module.exports = {
  getProfile,
  changePassword,
  submitLeaveRequest,
  getMyLeaveRequests,
  updateProfile,
  getEmployeeDashboard,
  uploadProfilePhoto,
  createAttendance,
  getAttendanceSummary
};

