"use client";

import { Sidebar } from "./Sidebar";
import { useCurrentUser, useSessionUser } from "@/hooks";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const currentUser = useCurrentUser();
  // /auth/me é a fonte de verdade; o localStorage é só o fallback inicial
  const { data: sessionUser } = useSessionUser();
  const user = sessionUser ?? currentUser;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
