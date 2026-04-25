"use client"

import { CSSProperties, useState } from "react";
import Link from "next/link";
import Title from "@/components/ui/Title";
import {
  AliwangwangOutlined,
  CalendarOutlined,
  CameraOutlined,
  CloseOutlined,
  FileTextOutlined,
  MenuOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useT } from "@/i18n/client";
import UserAvatarDropdown from "@/components/common/UserAvatarDropdown";
import { Button, Divider } from "antd";
import { useUser } from "@/contexts/UserContext";
import logo from "@/assets/logos/logo.svg"
import Image from "next/image";
import NotificationsDropdown from "@/components/common/layout/Header/_components/NotificationsDropdown";

export default function Header() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const { t } = useT()

  const iconClass = "text-ant-text-secondary";
  const iconStyle = { fontSize: 20 } as CSSProperties;

  const menu = [
    { title: t('contracts'), link: "/app/contracts", icon: <FileTextOutlined className={iconClass} style={iconStyle} /> },
    { title: t('events'), link: "/app/events", icon: <CalendarOutlined className={iconClass} style={iconStyle} /> },
    { title: t('clients'), link: "/app/clients", icon: <TeamOutlined className={iconClass} style={iconStyle} /> },
    {
      title: t('team_members'),
      link: "/app/team-members",
      icon: <AliwangwangOutlined className={iconClass} style={iconStyle} />
    },
    {
      title: t('photo_sorter'),
      link: "/app/photo-sorter",
      icon: <CameraOutlined className={iconClass} style={iconStyle} />
    },
  ];

  return (
    <header className="bg-ant-bg-elevated border-b border-ant-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex flex-1 items-center">
          <div className="mr-2">
            <button
              className="rounded-md cursor-pointer border border-ant-border bg-ant-bg hover:bg-ant-fill-sec"
              onClick={() => setOpen(true)}
            >
              <MenuOutlined className="p-2 text-red-500" />
              <span className="sr-only">{t('open_main_menu')}</span>
            </button>
          </div>

          <Link href="/app" className="-m-1.5 p-1.5">
            <div className="flex items-center justify-center text-2xl text-ant-text">
              <Title />
            </div>
          </Link>
        </div>


        <NotificationsDropdown />
        <UserAvatarDropdown user={user} />
      </div>

      <div className={`fixed w-full h-full top-0 right-0 z-[1001] ${open ? "" : "pointer-events-none"}`}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute w-full h-full top-0 right-0 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
            } bg-ant-bg-mask`}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-navigation-id"
          className={`
            transition-transform duration-300 ${open ? '' : '-translate-x-full'} ease-in-out
            h-full w-full max-w-80 fixed left-0 rounded-l-xl
            max-xss:!w-[calc(100%-2rem)]
            bg-ant-bg border-r border-ant-border-sec shadow-ant-2
          `}
        >
          <h1 id="global-navigation-id" className="sr-only">
            Global navigation {t('global_navigation')}
          </h1>

          <div className="h-full w-full flex flex-col p-2">
            <div className="flex justify-between items-center px-2 pt-2 pb-6">
              <div>
                <span className="sr-only">{process.env.NEXT_PUBLIC_APP_NAME}</span>
                <Image src={logo} width={35} height={35} alt="Title" />
              </div>

              <Button
                type={'text'}
                className="h-8 w-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-ant-fill-sec"
                onClick={() => setOpen(false)}
              >
                <span className="sr-only">{t('close_menu')}</span>
                <CloseOutlined />
              </Button>
            </div>

            <nav>
              <ul className="flex flex-col gap-1">
                {menu.map((item, index) => (
                  <li key={index}>
                    <Link href={item.link} onClick={() => setOpen(false)}>
                      <Button
                        className="w-full flex !justify-start !px-2"
                        type="text"
                        icon={item.icon}
                      >
                        {item.title}
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="px-2">
                <Divider className="!my-4 !border-ant-border-sec" />
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
