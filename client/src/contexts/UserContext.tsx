'use client'

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import User from "@/types/User";
import getDateFormatByCountry from "@/lib/getDateFormatByCountry";
import apiFetch from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUser } from "@/lib/api/users/fetchUser";

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  defaultDateFormat: string;
  isLoggingOut: boolean;
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

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      const isTokenMode = process.env.NEXT_PUBLIC_AUTH_TYPE === 'token';
      const baseURL = isTokenMode ? process.env.NEXT_PUBLIC_APP_URL : undefined;
      const path = isTokenMode ? '/api/auth/logout' : '/logout';
      await apiFetch(path, { method: 'POST', baseURL });
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
      window.location.replace('/signin');
    }
  });

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
    isLoggingOut
  }), [user, setUser, logout, defaultDateFormat, isLoggingOut]);

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
