import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = async (page = 1, limit = 10) => {
        if (!user) return;

        setLoading(true);

        try {
            const response = await axiosInstance.get(`/notifications?page=${page}&limit=${limit}`);
            const { notifications: newNotifications, totalUnread, totalNotifications: total, totalPages } = response.data;

            // Log for debugging
            console.log(`[Frontend Notifications] Fetched ${newNotifications.length} notifications for page ${page}, limit ${limit}`);

            if (page === 1) {
                setNotifications(newNotifications);
            } else {
                setNotifications(prev => [...prev, ...newNotifications]);
            }

            setUnreadCount(totalUnread);
            setTotalNotifications(total);
            setHasMore(page < totalPages);

        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axiosInstance.put(`/notifications/${id}/read`);
            // Update local state
            setNotifications(prev =>
                prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
            );
            // setUnreadCount(prev => Math.max(0, prev - 1)); // We let the next fetch update this or update optimistically
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosInstance.put(`/notifications/mark-all-read`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Poll for notifications every 30 seconds (only first page to keep it fresh)
    useEffect(() => {
        if (user) {
            fetchNotifications(1, 10);
            const interval = setInterval(() => fetchNotifications(1, 10), 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, totalNotifications, loading, hasMore, fetchNotifications, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
