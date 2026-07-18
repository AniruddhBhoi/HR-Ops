const express = require('express');
const router = express.Router();
const { uploadAttendance, getAttendance, deleteAttendanceByMonth } = require('../controller/attendanceController')
const multer = require('multer');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = multer({ dest: 'uploads/' }); // temp upload folder

router.post('/upload-attendance', upload.single('file'), uploadAttendance);
router.get('/view', verifyToken, getAttendance);
router.delete('/delete-month', verifyToken, deleteAttendanceByMonth);


// router.post('/upload',createAttendance);

module.exports = router