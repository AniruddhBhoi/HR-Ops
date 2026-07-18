const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendEmail } = require('../utils/emailService');
const User = require('../model/userModel');
const Employee = require('../model/employeeModel');
const Admin = require('../model/adminModel');



exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNo, department } = req.body;

    // 🧩 Validation
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "All fields required" });

    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password too short" });

    if (!["admin", "employee"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const existingUser = await User.findOne({ email });
    console.log("Existig user : ", existingUser)

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await new User({
      name,
      email,
      password: hashedPassword,
      role,
    }).save();

    if (role === "employee") {
      await new Employee({
        employeeId: `EMP${Date.now()}`,
        name,
        personalEmail: email,
        phone: phoneNo,
        workEmail: email,
        dateOfBirth: new Date(),
        dateOfJoining: new Date(),
        availableLeaves: 20,
        department: "General",
        position: "Employee",
        workPassword: password,
        userId: user._id,
      }).save();
    }

    if (role === "admin") {
      await new Admin({
        userId: user._id,
        name,
        email,
        password: password, // Let Admin model's pre-save hook handle hashing
        role: "admin",
        phone: phoneNo,
        department: department,
        isActive: true,
        lastLogin: null,
      }).save();
    }

    const token = jwt.sign(
      { userId: user._id, email, role },
      process.env.JWT_SECRET || "czarcore_secret_key",
      { expiresIn: "7d" }
    );

    res
      .status(201)
      .json({ message: `${role} registered successfully`, token, user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(req.body);


    if (!user) {
      console.log(`Login failed: User not found with email ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for user ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email, role: user.role }, process.env.JWT_SECRET || 'czarcore_secret_key', { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, user });
  } catch {
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("req, body : ", req.body);


    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });
    console.log("email password : ", email, password);

    const admin = await Admin.findOne({ email }).select("password name email userId");
    console.log(admin);

    if (!admin) {
      console.log(`Admin Login failed: Admin not found with email ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);


    if (!isMatch) {
      console.log(`Admin Login failed: Password mismatch for admin ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      { userId: admin.userId, email: admin.email, role: "admin" },
      process.env.JWT_SECRET || "czarcore_secret_key",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: "Server error during admin login" });
  }
};



exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // 1. Update User Model
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash and save new password for User
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // 2. Sync with Admin Model (if exists)
    const admin = await Admin.findOne({ userId: user._id });
    if (admin) {
      admin.password = newPassword; // Pre-save hook will hash it
      await admin.save();
    }

    // 3. Sync with Employee Model (if exists)
    const employee = await Employee.findOne({ userId: user._id });
    if (employee) {
      employee.workPassword = newPassword; // Pre-save hook will hash it
      await employee.save();
    }

    // Send confirmation email
    await sendEmail(
      user.email,
      "Password Changed Successfully",
      `<p>Your password has been changed successfully.</p>
       <p>If this was not you, contact support immediately.</p>`
    ).catch(err => console.error("Email send error:", err));

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error during password change" });
  }
};

exports.confirmPasswordChange = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ message: "OTP and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP verified, change password and clear OTP fields
    user.password = await bcrypt.hash(newPassword, 12);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Sync with Admin Model (if exists)
    const admin = await Admin.findOne({ userId: user._id });
    if (admin) {
      admin.password = newPassword; // Pre-save hook will hash it
      await admin.save();
    }

    // Sync with Employee Model (if exists)
    const employee = await Employee.findOne({ userId: user._id });
    if (employee) {
      employee.workPassword = newPassword; // Pre-save hook will hash it
      await employee.save();
    }

    // Send confirmation email
    const emailSent = await sendEmail(
      user.email,
      "Password Changed Successfully",
      `<p>Your password has been changed successfully.</p>
       <p>If this was not you, contact support immediately.</p>`
    );

    if (!emailSent) {
      console.error("Failed to send password change confirmation email");
    }

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Confirm password change error:", error);
    res.status(500).json({ message: "Server error during password change confirmation" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Forgot password request for:', email);

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({ message: 'User Does Not Exist' });
    }

    // Generate OTP and set expiration time
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = generatedOtp;
    user.resetPasswordExpires = Date.now() + 3600000; // OTP valid for 1 hour

    // Explicitly mark as modified and save
    user.markModified('resetPasswordOtp');
    await user.save();

    console.log(`[DEBUG_OTP] GENERATED: ${generatedOtp} for ${email}`);
    console.log(`[DEBUG_OTP] SAVED_TO_DB: ${user.resetPasswordOtp}`);

    // Send OTP via email using centralized email service
    const emailSent = await sendEmail(
      user.email,
      'Password Reset OTP',
      `<p>You are receiving this because you requested a password reset for your account.</p>
       <p>Here is your One-Time Password (OTP) to reset your password: <strong>${generatedOtp}</strong></p>
       <p>Please enter this OTP within the next hour to reset your password.</p>
       <p>If you did not request this, please ignore this email.</p>`
    );

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.status(200).json({ message: `OTP sent to ${email}` });

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const storedOtp = user.resetPasswordOtp ? user.resetPasswordOtp.toString().trim() : null;
    const receivedOtp = otp ? otp.toString().trim() : null;

    console.log(`[DEBUG_OTP] VERIFYING for ${email}`);
    console.log(`[DEBUG_OTP] RECEIVED: [${receivedOtp}]`);
    console.log(`[DEBUG_OTP] STORED:   [${storedOtp}]`);

    if (!storedOtp || storedOtp !== receivedOtp) {
      console.log(`[DEBUG_OTP] ERROR: Mismatch or Missing OTP for ${email}`);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP verified, clear OTP fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) return res.status(400).json({ message: "Email and new password are required" });

    if (newPassword.length < 6) return res.status(400).json({ message: "Password too short" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Note: In a real implementation, you might want to verify OTP again or use a token
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Sync with Admin Model (if exists)
    const admin = await Admin.findOne({ userId: user._id });
    if (admin) {
      admin.password = newPassword;
      await admin.save();
    }

    const employee = await Employee.findOne({ userId: user._id });
    if (employee) {
      employee.workPassword = newPassword;
      await employee.save();
    }

    // Send confirmation email
    const emailSent = await sendEmail(
      user.email,
      "Password Reset Successful",
      `<p>Your password has been reset successfully.</p>
       <p>If this was not you, contact support immediately.</p>`
    );

    if (!emailSent) {
      console.error("Failed to send password reset confirmation email");
    }

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset" });
  }
};

