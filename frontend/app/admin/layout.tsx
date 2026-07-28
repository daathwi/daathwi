import AdminSidebar from "./components/AdminSidebar";
import { AdminToastProvider } from "./components/AdminToast";

export const metadata = {
  title: "Admin | daathwi.jpg",
  description: "Portfolio admin panel",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminToastProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-on-background">
        <AdminSidebar />
        <main className="ml-[280px] flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
        </main>
      </div>
    </AdminToastProvider>
  );
}
