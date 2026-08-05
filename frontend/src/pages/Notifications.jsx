import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { notificationService } from '../services/notificationService';
import { useNotification } from '../contexts/NotificationContext';
import Avatar from '../components/Avatar';
import { getRelativeTime } from '../utils/timeUtils';
import { toast } from 'react-hot-toast';
import EmptyState from '../components/EmptyState';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchUnreadCount } = useNotification();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications(0, 20);
      const list = Array.isArray(res) ? res : (res?.content || res?.notifications || []);
      setNotifications(list);
    } catch (err) {
      console.error('[Notifications] Error fetching notifications:', err);
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      await notificationService.markAsRead(notif.id);
      await fetchUnreadCount();
    } catch (err) {
      console.error('[Notifications] Failed to mark notification as read:', err);
    } finally {
      const suffix = notif.type === 'COMMENT' ? '?scroll=comments' : '';
      window.location.hash = `#/experience/${notif.experienceId}${suffix}`;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await fetchUnreadCount();
      toast.success('All notifications marked as read.');
    } catch (err) {
      console.error('[Notifications] Failed to mark all as read:', err);
      toast.error('Failed to mark notifications as read.');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      await fetchUnreadCount();
      toast.success('Notification deleted.');
    } catch (err) {
      console.error('[Notifications] Failed to delete notification:', err);
      toast.error('Failed to delete notification.');
    }
  };

  return (
    <DashboardLayout activeTab="Notifications">
      <div className="flex flex-col gap-8 max-w-[800px] mx-auto w-full fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="display-font text-3xl font-bold tracking-tight text-theme-text">Notifications</h1>
            <p className="text-theme-muted text-sm font-medium">Manage and view your notifications.</p>
          </div>
          {notifications.length > 0 && notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 border border-theme-border rounded-sm text-xs font-bold transition-all hover:bg-theme-hover text-theme-text cursor-pointer self-start sm:self-auto"
            >
              <iconify-icon icon="lucide:check-check" className="text-sm"></iconify-icon>
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="row-list-container">
          {loading ? (
            <>
              <div className="row-list-item"><SkeletonNotification /></div>
              <div className="row-list-item"><SkeletonNotification /></div>
              <div className="row-list-item"><SkeletonNotification /></div>
              <div className="row-list-item"><SkeletonNotification /></div>
            </>
          ) : notifications.length === 0 ? (
            <EmptyState 
              icon="lucide:bell" 
              title="No notifications"
              description="You're all caught up! No new notifications."
            />
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`row-list-item flex flex-col sm:flex-row sm:items-start gap-4 transition-colors cursor-pointer group ${
                  !notif.read ? 'bg-[#a78b71]/5' : ''
                }`}
              >
                {/* Avatar with Type Icon overlay */}
                <div className="relative flex-shrink-0" onClick={(e) => {
                  e.stopPropagation();
                  window.location.hash = `#/users/${notif.senderId}`;
                }}>
                  <Avatar 
                    seed={notif.senderAvatarSeed || notif.avatarSeed}
                    name={notif.senderName}
                    size="w-12 h-12 cursor-pointer hover:opacity-85"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-theme-card text-white ${
                    notif.type === 'LIKE' ? 'bg-rose-500' : 'bg-blue-500'
                  }`}>
                    <iconify-icon 
                      icon={notif.type === 'LIKE' ? 'lucide:heart' : 'lucide:message-square'} 
                      className="text-[9px]"
                    />
                  </div>
                </div>

                {/* Info and Content */}
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.hash = `#/users/${notif.senderId}`;
                      }}
                      className="font-bold text-sm text-theme-text truncate cursor-pointer hover:underline"
                    >
                      {notif.senderName}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-theme-muted">{getRelativeTime(notif.createdAt)}</span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#a78b71]" title="Unread"></span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-theme-muted font-medium break-words mt-0.5">{notif.message}</p>
                </div>

                {/* Delete button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notif.id);
                  }}
                  className="text-theme-muted hover:text-red-500 transition-colors p-1.5 rounded-sm hover:bg-theme-hover flex items-center justify-center flex-shrink-0 cursor-pointer"
                  title="Delete Notification"
                >
                  <iconify-icon icon="lucide:trash-2" className="text-base"></iconify-icon>
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

function SkeletonNotification() {
  return (
    <div className="flex items-center gap-4 animate-pulse w-full">
      <div className="w-12 h-12 rounded-full bg-theme-hover flex-shrink-0"></div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-theme-hover rounded w-1/4"></div>
        <div className="h-3 bg-theme-hover rounded w-3/4"></div>
      </div>
      <div className="w-8 h-8 rounded-sm bg-theme-hover flex-shrink-0"></div>
    </div>
  );
}
