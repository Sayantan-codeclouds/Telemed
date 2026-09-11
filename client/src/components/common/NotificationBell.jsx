import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  Calendar,
  FileText,
  MessageSquare,
  AlertCircle,
  Pill,
  BadgeCheck,
  RefreshCcw,
  Trash2,
  X,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import doctorApi from "@/api/doctorApi";
import adminApi from "@/api/adminApi";
import socket from "@/socket/socket";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationBell({ role = "patient" }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const getClient = () => {
    if (role === "doctor") return doctorApi;
    if (role === "admin") return adminApi;
    return api;
  };

  const fetchNotifications = async () => {
    const token =
      role === "doctor"
        ? localStorage.getItem("doctorToken")
        : role === "admin"
        ? localStorage.getItem("adminToken")
        : localStorage.getItem("patientToken");

    if (!token) return;

    try {
      setLoading(true);
      const client = getClient();
      const { data } = await client.get("/notifications");
      if (data?.data) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const storedUser = JSON.parse(localStorage.getItem(role) || "{}");
    const userId = storedUser._id || storedUser.id;

    if (userId) {
      const eventName = `notification:${userId}`;
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(notification.title, { description: notification.message });
      };
      socket.on(eventName, handleNewNotification);
      return () => socket.off(eventName, handleNewNotification);
    }
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const client = getClient();
      await client.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      const client = getClient();
      await client.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Quiet
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const client = getClient();
      await client.delete(`/notifications/${id}`);
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    try {
      const client = getClient();
      await client.delete("/notifications/clear-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      toast.error("Failed to clear notifications");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "APPOINTMENT":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "PRESCRIPTION":
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case "PHARMACY":
      case "ORDER":
        return <Pill className="w-4 h-4 text-amber-500" />;
      case "CHAT":
        return <MessageSquare className="w-4 h-4 text-violet-500" />;
      case "RECHECKUP_REMINDER":
        return <RefreshCcw className="w-4 h-4 text-pink-500" />;
      case "DOCTOR_APPROVAL":
        return <BadgeCheck className="w-4 h-4 text-emerald-500" />;
      case "DOCTOR_REVIEW":
        return <Star className="w-4 h-4 text-amber-500 fill-amber-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case "APPOINTMENT":       return "bg-blue-50";
      case "PRESCRIPTION":      return "bg-emerald-50";
      case "PHARMACY":
      case "ORDER":             return "bg-amber-50";
      case "CHAT":              return "bg-violet-50";
      case "RECHECKUP_REMINDER":return "bg-pink-50";
      case "DOCTOR_APPROVAL":   return "bg-emerald-50";
      case "DOCTOR_REVIEW":     return "bg-amber-50";
      default:                  return "bg-slate-100";
    }
  };


  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative p-2.5 rounded-xl border border-gray-200 hover:bg-slate-50 transition-colors group"
        aria-label="Notifications"
      >
        <Bell size={19} className="text-gray-600 group-hover:text-gray-900 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="font-bold text-gray-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> All read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-red-400 hover:text-red-600 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="py-10 text-center">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-400 mt-2">Loading…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Bell className="w-8 h-8 text-gray-200 mx-auto" />
                <p className="text-xs text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && handleMarkOneRead(n._id)}
                  className={`group flex items-start gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer ${!n.isRead ? "bg-blue-50/30" : ""}`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg ${getBg(n.type)} flex items-center justify-center shrink-0 mt-0.5`}>
                    {getIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs text-gray-900 truncate ${!n.isRead ? "font-bold" : "font-semibold"}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">{timeAgo(n.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />}
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
