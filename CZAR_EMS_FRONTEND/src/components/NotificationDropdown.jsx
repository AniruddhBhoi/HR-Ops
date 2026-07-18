import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';
import PropTypes from 'prop-types';

const NotificationDropdown = ({ isOpen, onClose }) => {
    const { notifications, markAsRead, markAllAsRead, fetchNotifications, hasMore, loading } = useNotification();
    const dropdownRef = useRef(null);
    const scrollRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [page, setPage] = useState(1);

    // Initial fetch and reset on open
    useEffect(() => {
        if (isOpen) {
            setIsExpanded(false);
            setPage(1);
            fetchNotifications(1, 10);
        }
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const handleScroll = (e) => {
        if (!isExpanded) return;

        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchNotifications(nextPage, 10);
        }
    };

    const navigate = useNavigate();

    const handleNotificationClick = (notification) => {
        // 1. Mark as read if needed
        if (!notification.isRead) {
            markAsRead(notification._id);
        }

        // 2. Close dropdown
        onClose();

        // 3. Navigate based on type
        switch (notification.type) {
            case 'LeaveRequest':
            case 'LeaveStatus':
                navigate('/leave-request');
                break;
            case 'Attendance':
                navigate('/attendance');
                break;
            case 'Holiday':
                navigate('/holiday-calendar');
                break;
            case 'Document':
                navigate('/profile');
                break;
            default:
                break;
        }
    };

    if (!isOpen) return null;

    const displayedNotifications = isExpanded ? notifications : notifications.slice(0, 2);

    return (
        <div
            ref={dropdownRef}
            className="fixed top-20 left-4 right-4 bottom-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden flex flex-col sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:left-auto sm:max-h-96"
        >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-700">Notifications</h3>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="overflow-y-auto flex-1"
            >
                {loading ? (
                    <LoadingSpinner />
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications
                    </div>
                ) : (
                    <>
                        {displayedNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <SpanWrapper type={notification.type} />
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                    </span>
                                </div>
                                <p className={`text-sm ${!notification.isRead ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                                    {notification.message}
                                </p>
                            </div>
                        ))}

                        {!isExpanded && notifications.length > 2 && (
                            <div
                                onClick={() => setIsExpanded(true)}
                                className="p-2 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer text-xs text-blue-600 font-medium border-t border-gray-100 transition-colors"
                            >
                                See More
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const SpanWrapper = ({ type }) => {
    let badgeClass = "text-xs px-2 py-0.5 rounded font-medium ";
    let text = type;

    switch (type) {
        case 'LeaveRequest':
        case 'LeaveStatus':
            badgeClass += "bg-purple-100 text-purple-700";
            break;
        case 'Attendance':
            badgeClass += "bg-green-100 text-green-700";
            break;
        case 'Document':
            badgeClass += "bg-blue-100 text-blue-700";
            break;
        case 'Reminder':
        case 'Holiday':
            badgeClass += "bg-yellow-100 text-yellow-700";
            break;
        default:
            badgeClass += "bg-gray-100 text-gray-700";
    }

    return <span className={badgeClass}>{text}</span>;
}

NotificationDropdown.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default NotificationDropdown;
