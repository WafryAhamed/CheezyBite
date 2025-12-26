'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import AdminCard from '../../components/admin/AdminCard';
import { Bell, ShoppingBag, AlertTriangle, CheckCircle, Info, Star } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAdmin();

    useEffect(() => {
        fetchNotifications();
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const { notificationsService } = await import('@/services/notificationsService');
            const response = await notificationsService.getAll();
            if (response.success) {
                // Transform data to match UI needs if necessary, currently standardizing
                setNotifications(response.data);
            }
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const { notificationsService } = await import('@/services/notificationsService');
            await notificationsService.markAllAsRead();
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    // Helper to get icon config based on type
    const getNotificationStyle = (type) => {
        switch (type) {
            case 'order': return { icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' };
            case 'review': return { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
            case 'alert': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' };
            case 'system': return { icon: Info, color: 'text-purple-500', bg: 'bg-purple-500/10' };
            case 'success': return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' };
            default: return { icon: Info, color: 'text-gray-500', bg: 'bg-gray-500/10' };
        }
    };

    // Format relative time (simple version)
    const getRelativeTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return date.toLocaleDateString();
    };


    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Notifications</h1>
                    <p className="text-gray-400 text-sm">
                        You have {notifications.filter(n => !n.read).length} unread notification{notifications.filter(n => !n.read).length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-primary hover:text-primaryHover transition-colors"
                >
                    Mark all as read
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-400">No notifications found</div>
                )}

                {notifications.map((notif) => {
                    const style = getNotificationStyle(notif.type);
                    const timeStr = getRelativeTime(notif.createdAt);

                    return (
                        <div
                            key={notif._id}
                            className={`
                            relative flex items-start gap-4 p-4 rounded-xl border transition-all
                            ${notif.read ? 'bg-slate-900/40 border-slate-700/30' : 'bg-slate-800/60 border-primary/30 shadow-lg shadow-primary/5'}
                        `}
                        >
                            {/* Unread Indicator */}
                            {!notif.read && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            )}

                            <div className={`p-3 rounded-lg ${style.bg}`}>
                                <style.icon className={`w-6 h-6 ${style.color}`} />
                            </div>

                            <div className="flex-1">
                                <h3 className={`font-semibold ${notif.read ? 'text-gray-200' : 'text-white'}`}>
                                    {notif.title}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-500 mt-2">{timeStr}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="text-center pt-8">
                <button className="text-sm text-gray-500 hover:text-white transition-colors">
                    View older notifications
                </button>
            </div>
        </div>
    );
}
