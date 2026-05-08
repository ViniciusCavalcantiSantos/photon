"use client"

import { useState } from "react";
import Link from "next/link";
import Title from "@/components/ui/Title";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArticleIcon from "@mui/icons-material/Article";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { ButtonBase, Divider, IconButton } from "@mui/material";
import { useT } from "@/i18n/client";
import UserAvatarDropdown from "@/components/common/UserAvatarDropdown";
import { useUser } from "@/contexts/UserContext";
import logo from "@/assets/logos/logo.svg";
import Image from "next/image";
import NotificationsDropdown from "@/components/common/layout/Header/_components/NotificationsDropdown";

export default function Header() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const { t } = useT();

  const menu = [
    { title: t("contracts"),    link: "/app/contracts",    icon: <ArticleIcon sx={{ fontSize: 20, color: "var(--st-text-sec)" }} /> },
    { title: t("events"),       link: "/app/events",       icon: <CalendarTodayIcon sx={{ fontSize: 20, color: "var(--st-text-sec)" }} /> },
    { title: t("clients"),      link: "/app/clients",      icon: <GroupIcon sx={{ fontSize: 20, color: "var(--st-text-sec)" }} /> },
    { title: t("team_members"), link: "/app/team-members", icon: <SupervisorAccountIcon sx={{ fontSize: 20, color: "var(--st-text-sec)" }} /> },
    { title: t("photo_sorter"), link: "/app/photo-sorter", icon: <CameraAltIcon sx={{ fontSize: 20, color: "var(--st-text-sec)" }} /> },
  ];

  return (
    <header
      style={{
        backgroundColor: "var(--st-bg-paper)",
        borderBottom: "1px solid var(--st-border)",
        color: "var(--st-text)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 lg:px-8">
        {/* ── Left: hamburger + logo ── */}
        <div className="flex flex-1 items-center gap-2">
          <IconButton
            aria-label={t("open_main_menu")}
            onClick={() => setOpen(true)}
            size="small"
            sx={{
              borderRadius: "10px",
              border: "1px solid var(--st-border)",
              backgroundColor: "var(--st-bg)",
              color: "var(--st-text-sec)",
              "&:hover": {
                backgroundColor: "var(--st-bg-elevated)",
                borderColor: "var(--st-primary)",
                color: "var(--st-text)",
              },
            }}
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <Link href="/app" className="-m-1.5 p-1.5">
            <div className="flex items-center justify-center text-2xl" style={{ color: "var(--st-text)" }}>
              <Title />
            </div>
          </Link>
        </div>

        {/* ── Right: notifications + avatar ── */}
        <div className="flex items-center gap-1">
          <NotificationsDropdown />
          <UserAvatarDropdown user={user} />
        </div>
      </div>

      {/* ── Drawer overlay + panel ── */}
      <div className={`fixed w-full h-full top-0 left-0 z-[1001] ${open ? "" : "pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          style={{ backgroundColor: "var(--st-bg-mask)" }}
          className={`absolute w-full h-full top-0 left-0 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Slide-in panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-navigation-id"
          style={{
            backgroundColor: "var(--st-bg-paper)",
            borderRight: "1px solid var(--st-border)",
            boxShadow: "var(--st-shadow-elevated)",
          }}
          className={`
            transition-transform duration-300 ${open ? "" : "-translate-x-full"} ease-in-out
            h-full w-full max-w-72 fixed left-0
            max-xss:!w-[calc(100%-2rem)]
          `}
        >
          <h1 id="global-navigation-id" className="sr-only">
            {t("global_navigation")}
          </h1>

          <div className="h-full w-full flex flex-col p-2">
            {/* Drawer header */}
            <div className="flex justify-between items-center px-2 pt-2 pb-4">
              <div>
                <span className="sr-only">{process.env.NEXT_PUBLIC_APP_NAME}</span>
                <Image src={logo} width={32} height={32} alt="Photon logo" />
              </div>

              <IconButton
                size="small"
                aria-label={t("close_menu")}
                onClick={() => setOpen(false)}
                sx={{
                  borderRadius: "10px",
                  color: "var(--st-text-sec)",
                  "&:hover": {
                    backgroundColor: "var(--st-bg-elevated)",
                    color: "var(--st-text)",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </div>

            {/* Nav links */}
            <nav>
              <ul className="flex flex-col gap-0.5">
                {menu.map((item, index) => (
                  <li key={index}>
                    <Link href={item.link} onClick={() => setOpen(false)}>
                      <ButtonBase
                        component="div"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 1.5,
                          py: 1.25,
                          borderRadius: "10px",
                          width: "100%",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "var(--st-text)",
                          justifyContent: "flex-start",
                          "&:hover": { backgroundColor: "var(--st-bg-elevated)" },
                        }}
                      >
                        {item.icon}
                        {item.title}
                      </ButtonBase>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="px-2 pt-2">
                <Divider sx={{ borderColor: "var(--st-divider)" }} />
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
