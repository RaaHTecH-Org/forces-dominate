import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardContent } from "@/components/DashboardContent";
import { ProfilePage } from "@/components/dashboard/ProfilePage";
import { OrdersPage } from "@/components/dashboard/OrdersPage";
import { WishlistPage } from "@/components/dashboard/WishlistPage";
import { BillingPage } from "@/components/dashboard/BillingPage";
import { NotificationsPage } from "@/components/dashboard/NotificationsPage";
import { SettingsPage } from "@/components/dashboard/SettingsPage";
import { BotDashboard } from "@/components/BotDashboard";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6">
            <Routes>
              <Route index element={<DashboardContent />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="bot" element={<BotDashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;