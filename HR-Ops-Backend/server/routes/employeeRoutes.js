const express = require('express');
const path = require('path');
const multer = require('multer');
const { verifyToken } = require('../middleware/authMiddleware');
const { getProfile, changePassword, submitLeaveRequest, getMyLeaveRequests, getEmployeeDashboard, updateProfile, uploadProfilePhoto } = require('../controller/employeeController');
const { getMyDocuments, uploadMyDocument, getMySalarySlips, deleteSalarySlip, uploadMySalarySlip, viewDocument } = require('../controller/employeeDocumentController');

const router = express.Router();

// Configure multer for document uploads (memory storage for database)
const upload = multer({ storage: multer.memoryStorage() });
const profileUpload = multer({ dest: path.join(__dirname, '../../uploads/') });

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/dashboard', verifyToken, getEmployeeDashboard);
router.put('/change-password', verifyToken, changePassword);
router.post('/leave-requests', verifyToken, submitLeaveRequest);
router.get('/my-leave-requests', verifyToken, getMyLeaveRequests);
router.get('/documents', verifyToken, getMyDocuments);
router.get('/documents/view/:docId', verifyToken, viewDocument);
router.post('/upload-document', verifyToken, upload.single('file'), uploadMyDocument);
router.post('/upload-profile-photo', verifyToken, profileUpload.single('profilePhoto'), uploadProfilePhoto);

// Salary slip routes
router.get('/salary-slips', verifyToken, getMySalarySlips);
router.post('/upload-salary-slip', verifyToken, upload.single('file'), uploadMySalarySlip);
router.delete('/salary-slips/:slipId', verifyToken, deleteSalarySlip);

module.exports = router;
