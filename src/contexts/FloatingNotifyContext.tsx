import React, { createContext, useContext, useState, useCallback } from "react";
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

type NotificationType = "success" | "error" | "info" | "warning";
type NotificationRemovalReason = "manual" | "auto";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  image?: string;
  timestamp: number;
  read: boolean;
  onClick?: () => void;
  onRemove?: (reason: NotificationRemovalReason) => void;
}

interface NotifyContextType {
  showNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => string;
  markAsRead: (id: string) => void;
  clearNotification: (id: string, reason?: NotificationRemovalReason) => void;
  clearAll: () => void;
}

const NotifyContext = createContext<NotifyContextType | undefined>(undefined);

export const useFloatingNotify = () => {
  const context = useContext(NotifyContext);
  if (!context) throw new Error("useFloatingNotify must be used within FloatingNotifyProvider");
  return context;
};

const getIcon = (type: NotificationType) => {
  const icons = {
    success: <FaCheckCircle className="text-green-400 text-lg" />,
    error: <FaExclamationTriangle className="text-red-400 text-lg" />,
    warning: <FaExclamationTriangle className="text-yellow-400 text-lg" />,
    info: <FaInfoCircle className="text-blue-400 text-lg" />,
  };
  return icons[type];
};

const formatTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
};

export const FloatingNotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const showNotification = useCallback((notif: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notif,
      id: Math.random().toString(36).slice(2, 9),
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotification = useCallback((id: string, reason: NotificationRemovalReason = "auto") => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === id);
      if (target?.onRemove) {
        target.onRemove(reason);
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => {
      prev.forEach(n => n.onRemove?.("manual"));
      return [];
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotifyContext.Provider value={{ showNotification, markAsRead, clearNotification, clearAll }}>
      {children}

      {notifications.length > 0 && (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all duration-200"
          >
            <FaBell className="text-2xl" />
            {unreadCount > 0 && (
              <span
                className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-lg shadow-2xl bg-neutral-900 border border-gray-700 text-gray-100 backdrop-blur-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                    Clear all
                  </button>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-200">
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-gray-700">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      !n.read ? "bg-neutral-800 hover:bg-neutral-700" : "hover:bg-neutral-800"
                    }`}
                    onClick={() => {
                      markAsRead(n.id);
                      n.onClick?.();
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {n.image ? (
                        <img src={n.image} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="flex-shrink-0">{getIcon(n.type)}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold">{n.title}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(n.id, "manual");
                            }}
                            className="text-gray-500 hover:text-red-400"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                        {n.message && <p className="text-xs text-gray-400 mb-1">{n.message}</p>}
                        <p className="text-xs text-gray-500">{formatTime(n.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </NotifyContext.Provider>
  );
};
