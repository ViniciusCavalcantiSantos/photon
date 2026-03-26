'use client'

import {AntdRegistry} from "@ant-design/nextjs-registry";
import {PropsWithChildren, useEffect, useMemo, useState} from "react";
import {App, ConfigProvider, theme} from "antd";
import {themeAntdDark, themeAntdLight} from "@/theme";
import {NotificationProvider} from "@/contexts/NotificationContext";
import en from 'antd/locale/en_US';
import ptBR from 'antd/locale/pt_BR';
import {Locale} from "antd/es/locale";
import {Theme, ThemeProvider, useTheme} from "@/contexts/AppThemeContext";
import {PhotonSpin} from "@/components/ui/Fallback";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {UserProvider} from "@/contexts/UserContext";
import User from "@/types/User";
import SessionWatcher from "@/components/common/SessionWatcher";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function Providers({children, lang, user, theme}: PropsWithChildren<{
  lang: string,
  user: User | null,
  theme: Theme
}>) {

  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider initialUser={user}>
        <AntdRegistry>
          <ThemeProvider initialTheme={theme}>
            <ConfigProviderWrapper lang={lang}>
              <SessionWatcher/>

              {children}
            </ConfigProviderWrapper>
          </ThemeProvider>
        </AntdRegistry>
      </UserProvider>
    </QueryClientProvider>
  );
}

function ConfigProviderWrapper({children, lang}: PropsWithChildren<{ lang: string }>) {
  const {resolved} = useTheme()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {algorithm, token, isDark} = useMemo(
    () => {
      const currentTheme = mounted ? resolved : 'light';
      const isDark = currentTheme === 'dark';

      return {
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: isDark ? themeAntdDark : themeAntdLight,
        isDark
      }
    },
    [resolved, mounted]
  )

  if (!mounted) {
    return <div style={{visibility: 'hidden'}}>{children}</div>;
  }

  const langMap: Record<string, Locale> = {
    'en': en,
    'pt-BR': ptBR
  }

  return (
    <ConfigProvider
      key={isDark ? 'dark-provider' : 'light-provider'}
      locale={langMap[lang] ?? en}
      theme={{
        algorithm: algorithm,
        token: token,
        cssVar: {
          prefix: 'ant',
          key: 'ant'
        },
      }}
      spin={{
        indicator: <PhotonSpin size='default'/>
      }}
    >
      <App className="h-full">
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </App>
    </ConfigProvider>
  )
}
