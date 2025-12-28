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
    
    // Client pages - always show client view
    const clientPages = ['Home', 'Workout', 'Nutrition', 'Progress', 'Learn', 'Messages'];
    if (clientPages.includes(currentPageName)) {
      return 'client';
    }
    
    // Fall back to user role/type
    if (user.role === 'admin') return 'admin';
    if (user.user_type === 'trainer' || user.role === 'trainer') return 'trainer';
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
  ];

  // Trainer navigation
  const trainerNavItems = [
    { name: "Dashboard", path: createPageUrl("TrainerDashboard"), icon: Home },
    { name: "Clients", path: createPageUrl("TrainerClients"), icon: Users },
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32 relative overflow-x-hidden safe-area-inset">
              <style>{`
                :root {
                  --primary-white: #ffffff;
                  --accent-blue: #0ea5e9;
                  --text-dark: #1a1a1a;
                  --card-light: #f8fafc;
                  --border-gray: #e2e8f0;
                }

                /* PWA optimizations */
                .safe-area-inset {
                  padding-top: env(safe-area-inset-top);
                  padding-bottom: env(safe-area-inset-bottom);
                }

                /* Touch optimizations */
                * {
                  -webkit-tap-highlight-color: transparent;
                  -webkit-touch-callout: none;
                }

                /* Smooth scrolling */
                html {
                  -webkit-overflow-scrolling: touch;
                  scroll-behavior: smooth;
                }

                /* Prevent pull-to-refresh on Chrome */
                body {
                  overscroll-behavior-y: contain;
                }
              `}</style>

          {/* Header */}
          <header className="bg-white/80 backdrop-blur-xl px-6 py-5 sticky top-0 z-50">
            <div className={`relative ${isClientView ? 'max-w-md mx-auto' : 'max-w-7xl mx-auto'}`}>
              <div className="flex items-center justify-between">
                <Link to={getHomePath()}>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-2xl flex items-center justify-center shadow-sm">
                      <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-[#1a1a1a]">
                        EJT Fitness
                      </h1>
                    </div>
                    </div>
                    </Link>
                    </div>
            </div>
          </header>

          {/* Main Content */}
          <main className={`relative z-10 ${isClientView ? 'max-w-md mx-auto' : ''}`}>
            {children}
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className={`flex justify-around items-center px-2 py-3 ${isClientView ? 'max-w-md mx-auto' : 'max-w-7xl mx-auto'}`}>
              {navItems.map((item) => {
                const isActive = isNavItemActive(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="flex flex-col items-center gap-0.5 transition-all duration-200 relative py-2 px-4"
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-[#0ea5e9]/10 rounded-2xl"></div>
                    )}
                    <div className="relative">
                      <Icon className={`w-6 h-6 transition-colors ${isActive ? "text-[#0ea5e9]" : "text-gray-400"}`} />
                      {item.badge > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">{item.badge > 9 ? '9+' : item.badge}</span>
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium ${isActive ? "text-[#0ea5e9]" : "text-gray-400"}`}>{item.name}</span>
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