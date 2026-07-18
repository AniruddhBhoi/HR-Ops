const Notification = require('../model/notificationModel');
const mongoose = require('mongoose');

// Helper to create notification (Internal use)
const createNotification = async (recipientId, type, message, relatedId = null, senderId = null) => {
    try {
        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            type,
            message,
            relatedId
        });
        await notification.save();
        console.log(`[Notification] Created for ${recipientId}: ${message}`);
        return notification;
    } catch (error) {
        console.error('[Notification] Error creating notification:', error);
    }
};

// API: Get notifications for logged-in user with pagination
const getNotifications = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'User ID missing in token' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: req.user.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalUnread = await Notification.countDocuments({
            recipient: req.user.userId,
            isRead: false
        });

        const totalNotifications = await Notification.countDocuments({
            recipient: req.user.userId
        });

        // Log for debugging
        console.log(`[Notifications] Fetched ${notifications.length} notifications for page ${page}, limit ${limit}, total: ${totalNotifications}, unread: ${totalUnread}`);

        res.json({
            notifications,
            totalUnread,
            totalNotifications,
            currentPage: page,
            totalPages: Math.ceil(totalNotifications / limit)
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// API: Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// API: Mark all as read
const markAllAsRead = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'User ID missing in token' });
        }

        await Notification.updateMany({ recipient: req.user.userId, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead
};
