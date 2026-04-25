'use client'

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import User from "@/types/User";
import getDateFormatByCountry from "@/lib/getDateFormatByCountry";
import apiFetch from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUser } from "@/lib/api/users/fetchUser";
import { ApiStatus } from '@/types/ApiResponse';

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  defaultDateFormat: string;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = (
  {
    children,
    initialUser
  }: {
    children: React.ReactNode,
    initialUser: User | null
  }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetchUser(),
    initialData: initialUser === undefined ? null : initialUser,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const logout = async function () {
    const isTokenMode = process.env.NEXT_PUBLIC_AUTH_TYPE === 'token';
    const baseURL = isTokenMode ? process.env.NEXT_PUBLIC_APP_URL : undefined;
    const path = isTokenMode ? '/api/auth/logout' : '/logout';
    const res = await apiFetch(path, { method: 'POST', baseURL });
    if (res.status === ApiStatus.SUCCESS) {
      router.replace('/signin')
    }
  }

  const setUser = useCallback((newUser: User) => {
    queryClient.setQueryData(['user'], newUser);
  }, [queryClient]);

  const defaultDateFormat = useMemo(() => {
    return getDateFormatByCountry(user?.address?.country)
  }, [user?.address?.country]);


  const value = useMemo(() => ({
    user,
    setUser,
    logout,
    defaultDateFormat,
  }), [user, setUser, logout, defaultDateFormat]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext)

  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}

export const useSafeUser = () => {
  try {
    return useUser()
  } catch (err) {
    return null;
  }
}
