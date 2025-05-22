import type React from "react";
import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="hidden md:block sticky top-14 h-[calc(100vh-3.5rem)] py-6 pl-4 pr-6">
          <AdminNav /> 
        </aside>

        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
      <div className="md:hidden">
        <AdminNav />
      </div>
    </div>
  );
}
