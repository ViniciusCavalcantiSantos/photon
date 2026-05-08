"use client";

import User from "@/types/User";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  ButtonBase,
  Divider,
  Popover,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import UserAvatar from "@/components/ui/UserAvatar";
import Link from "next/link";
import { useT } from "@/i18n/client";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/AppThemeContext";

/* ── helper: reusable menu button ── */
function MenuButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        width: "100%",
        px: 1.5,
        py: 1,
        borderRadius: "10px",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "var(--st-text)",
        justifyContent: "flex-start",
        "&:hover": { backgroundColor: "var(--st-bg-paper)" },
      }}
    >
      <Box sx={{ color: "var(--st-text-sec)", display: "flex", alignItems: "center", flexShrink: 0 }}>
        {icon}
      </Box>
      {label}
    </ButtonBase>
  );
}

function UserAvatarDropdown({ user }: { user: User | null }) {
  const { logout } = useUser();
  const [mounted, setMounted] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { t } = useT();
  const { theme, setTheme } = useTheme();
  const open = Boolean(anchorEl);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => logout();

  const dropdownContent = useMemo(() => {
    if (!user) return null;

    return (
      <Box>
        {/* User info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, pb: 1 }}>
          <UserAvatar user={user} size={32} />
          <Box>
            <Typography
              sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--st-text)", lineHeight: 1.3 }}
            >
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "var(--st-text-sec)" }}>
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ px: 1, py: 0.5 }}>
          <Divider sx={{ borderColor: "var(--st-divider)" }} />
        </Box>

        {/* Menu items */}
        <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 0.25 }}>
          <Link href="/app/profile" onClick={() => setAnchorEl(null)}>
            <MenuButton icon={<AccountCircleIcon sx={{ fontSize: 18 }} />} label={t("profile")} />
          </Link>

          <MenuButton
            icon={
              theme === "dark" ? (
                <LightModeIcon sx={{ fontSize: 18 }} />
              ) : (
                <DarkModeIcon sx={{ fontSize: 18 }} />
              )
            }
            label={t("toggle_theme")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          />

          <Link href="/signin" onClick={handleLogout}>
            <MenuButton icon={<LogoutIcon sx={{ fontSize: 18 }} />} label={t("logout")} />
          </Link>
        </Box>
      </Box>
    );
  }, [user, theme, t]);

  if (!mounted || !user) return null;

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block cursor-pointer"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <UserAvatar user={user} />
      </div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: "14px",
              backgroundColor: "var(--st-bg-elevated)",
              border: "1px solid var(--st-border)",
              boxShadow: "var(--st-shadow-elevated)",
              color: "var(--st-text)",
              overflow: "hidden",
            },
          },
        }}
      >
        {dropdownContent}
      </Popover>
    </>
  );
}

export default React.memo(UserAvatarDropdown);