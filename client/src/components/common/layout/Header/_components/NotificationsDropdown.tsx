"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Divider,
  IconButton,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import InboxIcon from "@mui/icons-material/Inbox";
import { useT } from "@/i18n/client";
import { fetchNotifications } from "@/lib/api/notifications/fetchNotifications";
import { useUserNotifications } from "@/hooks/useUserNotifications";
import Notification from "@/types/Notification";
import { formatTimeFromNow } from "@/lib/utils/date";
import { readNotification } from "@/lib/api/notifications/readNotification";
import { dismissNotification } from "@/lib/api/notifications/dismissNotification";
import dayjs from "dayjs";

/* ── shared sx tokens ── */
const popoverPaperSx = {
  backgroundColor: "var(--st-bg-elevated)",
  border: "1px solid var(--st-border)",
  borderRadius: "16px",
  boxShadow: "var(--st-shadow-elevated)",
  color: "var(--st-text)",
  minWidth: 280,
  maxWidth: 400,
  overflow: "hidden",
} as const;

export default function NotificationsDropdown() {
  const { t } = useT();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const open = Boolean(anchorEl);

  // TODO: Implementar useNotifications
  useEffect(() => {
    fetchNotifications().then((res) => {
      setNotifications(res.notifications);
      setUnreadCount(res.notifications.filter((n) => !n.readAt).length);
    });
  }, []);

  useUserNotifications((data) => {
    setNotifications((prev) => [data, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

  const handleNotificationClick = async (notification: Notification) => {
    readNotification(notification.id).then(() => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, readAt: dayjs().toISOString() } : n,
        ),
      );
      if (!notification.readAt && unreadCount > 0) setUnreadCount((c) => c - 1);
    });
  };

  const handleDismiss = async (notification: Notification) => {
    dismissNotification(notification.id).then(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      if (!notification.readAt && unreadCount > 0) setUnreadCount((c) => c - 1);
    });
  };

  const listContent = useMemo(() => {
    if (notifications.length === 0) {
      return (
        <Box
          sx={{
            py: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <InboxIcon sx={{ fontSize: 36, color: "var(--st-text-disabled)" }} />
          <Typography variant="body2" sx={{ color: "var(--st-text-sec)" }}>
            {t("no_notifications")}
          </Typography>
        </Box>
      );
    }

    return (
      <ul
        style={{ margin: 0, padding: 0, listStyle: "none", maxHeight: 420, overflowY: "auto" }}
      >
        {notifications.map((notification) => (
          <li
            key={notification.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              paddingLeft: 20,
              paddingRight: 8,
              paddingTop: 12,
              paddingBottom: 12,
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLLIElement).style.backgroundColor = "var(--st-bg-paper)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLLIElement).style.backgroundColor = "transparent";
            }}
          >
            <button
              onClick={() => handleNotificationClick(notification)}
              style={{
                flex: 1,
                textAlign: "left",
                cursor: "pointer",
                background: "transparent",
                border: "none",
                padding: 0,
                color: "inherit",
              }}
            >
              {/* unread dot */}
              <div style={{ position: "relative" }}>
                {!notification.readAt && (
                  <span
                    role="status"
                    style={{
                      position: "absolute",
                      left: -12,
                      top: 6,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "var(--st-primary)",
                      display: "inline-block",
                    }}
                  >
                    <span className="sr-only">{t("unread_notification")}</span>
                  </span>
                )}
                <Typography
                  variant="body2"
                  sx={{ fontWeight: notification.readAt ? 400 : 600, color: "var(--st-text)" }}
                >
                  {notification.data.message}
                </Typography>
              </div>
              <Typography variant="caption" sx={{ color: "var(--st-text-sec)", display: "block" }}>
                {notification.data.description}
              </Typography>
              <Typography variant="caption" sx={{ color: "var(--st-text-disabled)" }}>
                {formatTimeFromNow(notification.createdAt, t)}
              </Typography>
            </button>

            <Tooltip title={t("dismiss")} arrow>
              <IconButton
                size="small"
                onClick={() => handleDismiss(notification)}
                sx={{
                  color: "var(--st-text-sec)",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: "var(--st-primary-light)",
                    color: "var(--st-text)",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  }, [notifications, t]);

  return (
    <>
      <Tooltip
        title={t("you_have_unread_notifications", { count: unreadCount })}
        placement="bottom"
        arrow
      >
        <IconButton
          ref={bellRef}
          aria-label={t("open_main_menu")}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          sx={{
            borderRadius: "10px",
            color: "var(--st-text-sec)",
            mr: 0.5,
            "&:hover": { backgroundColor: "var(--st-bg-elevated)", color: "var(--st-text)" },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="primary"
            invisible={unreadCount === 0}
            sx={{
              "& .MuiBadge-badge": {
                minWidth: 16,
                height: 16,
                fontSize: "0.6rem",
                fontWeight: 700,
                backgroundColor: "var(--st-primary)",
              },
            }}
          >
            <NotificationsIcon sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { ...popoverPaperSx, mt: 1 } } }}
      >
        {/* Header */}
        <Box sx={{ px: 2.5, pt: 2, pb: 0 }}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "1rem", color: "var(--st-text)" }}
          >
            {t("notifications")}
          </Typography>
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <Divider sx={{ borderColor: "var(--st-divider)" }} />
          {listContent}
        </Box>
      </Popover>
    </>
  );
}