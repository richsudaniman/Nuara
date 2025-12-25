import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Dumbbell, UtensilsCrossed, TrendingUp, GraduationCap, Users, Video, UserPlus, Award, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import AuthGuard from "@/components/AuthGuard";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Get unread message count for badge
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadMessages', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const messages = await base44.entities.ChatMessage.filter({ 
        receiver_id: user.id, 
        is_read: false 
      });
      return messages.length;
    },
    initialData: 0,
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refresh every minute
  });

  // Determine view mode based on current page first, then user role/type
  const getViewMode = () => {
    if (!user) return 'client';
    
    // Check current page name to determine context
    if (currentPageName?.startsWith('Trainer')) {
      return 'trainer';
    }
    if (currentPageName?.startsWith('Admin')) {
      return 'admin';
    }
    
    // Fall back to user role/type
    if (user.role === 'admin') return 'admin';
    if (user.user_type === 'trainer') return 'trainer';
    return 'client';
  };

  const viewMode = getViewMode();
  const isTrainerView = viewMode === 'trainer';
  const isAdminView = viewMode === 'admin';
  const isClientView = viewMode === 'client';

  // Client navigation
  const clientNavItems = [
    { name: "Home", path: createPageUrl("Home"), icon: Home },
    { name: "Workout", path: createPageUrl("Workout"), icon: Dumbbell },
    { name: "Nutrition", path: createPageUrl("Nutrition"), icon: UtensilsCrossed },
    { name: "Progress", path: createPageUrl("Progress"), icon: TrendingUp },
    { name: "Learn", path: createPageUrl("Learn"), icon: GraduationCap },
    { name: "Messages", path: createPageUrl("Messages"), icon: MessageCircle, badge: unreadCount },
  ];

  // Trainer navigation
  const trainerNavItems = [
    { name: "Dashboard", path: createPageUrl("TrainerDashboard"), icon: Home },
    { name: "Clients", path: createPageUrl("TrainerClients"), icon: Users },
    { name: "Messages", path: createPageUrl("TrainerMessages"), icon: MessageCircle, badge: unreadCount },
    { name: "Videos", path: createPageUrl("TrainerVideos"), icon: Video },
  ];

  // Admin navigation
  const adminNavItems = [
    { name: "Dashboard", path: createPageUrl("AdminDashboard"), icon: Home },
    { name: "Users", path: createPageUrl("AdminUsers"), icon: Users },
    { name: "Trainers", path: createPageUrl("AdminTrainers"), icon: Award },
    { name: "Videos", path: createPageUrl("AdminVideos"), icon: Video },
  ];

  const navItems = isAdminView ? adminNavItems : (isTrainerView ? trainerNavItems : clientNavItems);

  const isNavItemActive = (navPath) => {
    return location.pathname === navPath;
  };

  const getHomePath = () => {
    if (isAdminView) return createPageUrl("AdminDashboard");
    if (isTrainerView) return createPageUrl("TrainerDashboard");
    return createPageUrl("Home");
  };

  return (
    <ErrorBoundary>
      <AuthGuard>
        <div className="min-h-screen bg-white pb-24 relative overflow-hidden">
          <style>{`
            :root {
              --primary-white: #ffffff;
              --accent-blue: #0ea5e9;
              --text-dark: #1a1a1a;
              --card-light: #f8fafc;
              --border-gray: #e2e8f0;
            }
            
            .glow-blue {
              box-shadow: 0 4px 20px rgba(14, 165, 233, 0.15);
            }
            
            .glow-blue-intense {
              box-shadow: 0 8px 30px rgba(14, 165, 233, 0.3);
            }

            @keyframes pulse-glow {
              0%, 100% { box-shadow: 0 4px 20px rgba(14, 165, 233, 0.15); }
              50% { box-shadow: 0 8px 30px rgba(14, 165, 233, 0.3); }
            }
            
            .animate-pulse-glow {
              animation: pulse-glow 2s ease-in-out infinite;
            }
          `}</style>

          {/* Geometric Background Elements */}
          <div className="absolute top-10 left-5 w-32 h-32 border-2 border-[#0ea5e9]/20 rotate-12 pointer-events-none"></div>
          <div className="absolute top-40 right-10 w-24 h-24 border border-[#e2e8f0] rotate-45 pointer-events-none"></div>
          <div className="absolute bottom-40 left-1/4 w-16 h-16 border-2 border-[#0ea5e9]/30 pointer-events-none" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}></div>

          {/* Header */}
          <header className="bg-white px-6 py-6 sticky top-0 z-50 border-b-2 border-[#0ea5e9] shadow-sm">
            <div className="max-w-md mx-auto relative">
              <div className="flex items-center justify-between">
                <Link to={getHomePath()}>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-12 h-12 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
                      <Dumbbell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black italic text-[#1a1a1a] tracking-tight">
                        EJT <span className="text-[#0ea5e9]">FITNESS</span>
                      </h1>
                      <p className="text-xs text-gray-600 italic">
                        {isAdminView ? 'Admin Portal' : (isTrainerView ? 'Trainer Portal' : 'Your Daily Hub')}
                      </p>
                    </div>
                    </div>
                    </Link>
                    </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-md mx-auto relative z-10">
            {children}
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#0ea5e9] z-50 shadow-lg">
            <div className="max-w-md mx-auto flex justify-around items-center px-2 py-3">
              {navItems.map((item) => {
                const isActive = isNavItemActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex flex-col items-center gap-1 transition-all duration-200 relative ${
                      isActive ? "text-[#0ea5e9] scale-110" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" : ""}`} />
                      {item.badge > 0 && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px] font-black">{item.badge > 9 ? '9+' : item.badge}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold italic">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </AuthGuard>
    </ErrorBoundary>
  );
}