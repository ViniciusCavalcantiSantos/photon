import Header from "@/components/common/layout/Header";
import {fetchUserServer} from "@/lib/api/users/fetchUserServer";
import {redirect} from "next/navigation";
import Providers from "@/app/[lng]/app/providers";
import React from "react";

export default async function Layout({children}: { children: React.ReactNode }) {
  const {user} = await fetchUserServer()

  if (!user) {
    redirect(`/signin`);
  }

  return (
    <Providers>
      <div className="min-h-screen flex flex-col bg-app-bg">
        <Header/>

        <main className="flex-1 p-4 sm:p-6 lg:px-8 mx-auto w-full max-w-7xl flex flex-col">
          {children}
        </main>
      </div>
    </Providers>
  )
}