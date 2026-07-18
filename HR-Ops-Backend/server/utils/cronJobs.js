const cron = require('node-cron');
const Notification = require('../model/notificationModel');
const Admin = require('../model/adminModel');
const Holiday = require('../model/holiday');
const User = require('../model/userModel');
const { createNotification } = require('../controller/notificationController');

const initCronJobs = () => {
    console.log('Initializing Cron Jobs...');

    // 1. Monthly Reminder to Admin: Upload Attendance (Run at 10 AM on the 1st of every month)
    cron.schedule('0 10 1 * *', async () => {
        console.log('Running Monthly Attendance Reminder...');
        try {
            const admins = await Admin.find({});
            const users = await User.find({ role: { $in: ['admin', 'superadmin'] } });

            // Combine both admin finding methods just in case, or stick to User role based
            // Using User model is safer since Notification links to User ID

            const adminUsers = await User.find({ role: 'admin' });

            for (const admin of adminUsers) {
                await createNotification(
                    admin._id,
                    'Reminder',
                    'Reminder: Please upload the attendance list for the last month.'
                );
            }
        } catch (error) {
            console.error('Error in Monthly Cron Job:', error);
        }
    });

    // 2. Holiday Reminder: Notify 2 days before (Run every day at 9 AM)
    cron.schedule('0 9 * * *', async () => {
        console.log('Running Holiday Check...');
        try {
            const today = new Date();
            const twoDaysLater = new Date(today);
            twoDaysLater.setDate(today.getDate() + 2);

            // Normalize to start of day for comparison if needed, or range
            const startOfDay = new Date(twoDaysLater.setHours(0, 0, 0, 0));
            const endOfDay = new Date(twoDaysLater.setHours(23, 59, 59, 999));

            const upcomingHolidays = await Holiday.find({
                fromDate: { $gte: startOfDay, $lte: endOfDay }
            });

            if (upcomingHolidays.length > 0) {
                const users = await User.find({}); // Notify ALL users

                for (const holiday of upcomingHolidays) {
                    for (const user of users) {
                        await createNotification(
                            user._id,
                            'Holiday',
                            `Upcoming Holiday: ${holiday.name} is in 2 days!`
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error in Holiday Cron Job:', error);
        }
    });
};

module.exports = initCronJobs;
