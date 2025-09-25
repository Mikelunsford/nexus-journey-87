import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  getNotifications,
  getNotificationStats,
  markAsRead as markNotificationAsRead,
  markAllAsRead as markAllNotificationsAsRead,
  deleteNotification as deleteNotificationById,
  createNotification as createNotificationData,
  subscribeToNotifications, 
  NotificationData,
  DbNotification 
} from '@/services/notificationService';
import { toast } from '@/hooks/use-toast';

export function useNotifications(includeRead = false) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [stats, setStats] = useState({ unread: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.org_id || !user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const [notificationsData, statsData] = await Promise.all([
        getNotifications(user.org_id, user.id, includeRead),
        getNotificationStats(user.org_id, user.id),
      ]);
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.org_id, user?.id, includeRead]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.org_id || !user?.id) return;

    try {
      await markNotificationAsRead(user.org_id, user.id, notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'read', read_at: new Date().toISOString() }
            : notification
        )
      );
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  }, [user?.org_id, user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.org_id || !user?.id) return;

    try {
      await markAllNotificationsAsRead(user.org_id, user.id);
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          status: 'read' as const,
          read_at: new Date().toISOString(),
        }))
      );
      setStats(prev => ({ ...prev, unread: 0 }));
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  }, [user?.org_id, user?.id]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.org_id || !user?.id) return;

    try {
      await deleteNotificationById(user.org_id, user.id, notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      setStats(prev => ({ 
        ...prev, 
        total: prev.total - 1,
        unread: Math.max(0, prev.unread - 1)
      }));
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  }, [user?.org_id, user?.id]);

  // Create notification (for testing or admin use)
  const createNotification = useCallback(async (notificationData: NotificationData) => {
    if (!user?.org_id || !user?.id) return;

    try {
      const newNotification = await createNotificationData(
        user.org_id, 
        user.id, 
        notificationData, 
        user.id
      );
      setNotifications(prev => [newNotification, ...prev]);
      setStats(prev => ({ 
        ...prev, 
        total: prev.total + 1,
        unread: prev.unread + 1
      }));
    } catch (err) {
      console.error('Error creating notification:', err);
      toast({
        title: 'Error',
        description: 'Failed to create notification',
        variant: 'destructive',
      });
    }
  }, [user?.org_id, user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.org_id || !user?.id) return;

    const unsubscribe = subscribeToNotifications(user.org_id, user.id, ({ type, notification }) => {
      if (type === 'INSERT') {
        setNotifications(prev => [notification, ...prev]);
        setStats(prev => ({ 
          ...prev, 
          total: prev.total + 1,
          unread: prev.unread + 1
        }));
      } else if (type === 'UPDATE') {
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? notification : n)
        );
      }
    });

    return unsubscribe;
  }, [user?.org_id, user?.id]);

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch: fetchNotifications,
  };
}
