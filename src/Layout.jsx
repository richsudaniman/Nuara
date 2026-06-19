import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Activity, TrendingUp, GraduationCap, Users, Video, UserPlus, Award, MessageCircle, Menu, X, LogOut, Settings, Gamepad2, Mic, ClipboardList, BarChart2, UserCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import AuthGuard from "@/components/AuthGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    const trainerPages = ['HomeworkBuilder', 'Recordings', 'ProgressGoals'];
    if (currentPageName?.startsWith('Trainer') || trainerPages.includes(currentPageName)) {
      return 'trainer';
    }
    if (currentPageName?.startsWith('Admin')) {
      return 'admin';
    }
    
    // Client pages - always show client view
    const clientPages = ['Home', 'Exercises', 'Progress', 'Learn', 'Messages', 'MockMessages'];
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
  const isManagementView = isAdminView || isTrainerView;

  // Patient navigation
  const clientNavItems = [
    { name: "Home", path: createPageUrl("Home"), icon: Home },
    { name: "Therapy", path: createPageUrl("Exercises"), icon: Activity },
    { name: "Practice", path: createPageUrl("Learn"), icon: Gamepad2 },
    { name: "Progress", path: createPageUrl("Progress"), icon: TrendingUp },
    { name: "Messages", path: createPageUrl("MockMessages"), icon: MessageCircle, badge: 2 },
  ];

  // Get assignment count for caseload badge
  const { data: trainerAssignments } = useQuery({
    queryKey: ['trainerAssignments', user?.id],
    queryFn: () => base44.entities.PractitionerPatientAssignment.filter({ trainer_id: user.id, is_active: true }),
    enabled: !!user?.id && isTrainerView,
    staleTime: 5 * 60 * 1000,
  });

  // Trainer navigation — grouped
  const trainerNavItems = [
    { name: "Dashboard", path: createPageUrl("TrainerDashboard"), icon: Home, group: "CLINIC" },
    { name: "Caseload", path: createPageUrl("TrainerClients"), icon: Users, group: "CLINIC", badge: trainerAssignments?.length || 14 },
    { name: "Recordings", path: createPageUrl("Recordings"), icon: Mic, group: "CLINIC", badge: 6 },
    { name: "Homework builder", path: createPageUrl("HomeworkBuilder"), icon: ClipboardList, group: "CLINIC" },
    { name: "Progress & goals", path: createPageUrl("ProgressGoals"), icon: BarChart2, group: "REPORTS" },
    { name: "Messages", path: createPageUrl("TrainerMessages"), icon: MessageCircle, group: "REPORTS", badge: unreadCount || 0 },
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

  const handleLogout = () => {
    base44.auth.logout();
  };

  // CLIENT LAYOUT (Mobile-first, Bottom Nav)
  if (isClientView) {
    return (
      <ErrorBoundary>
        <AuthGuard>
          <div className="min-h-screen bg-[#FAFAFB] pb-60 relative overflow-x-hidden safe-area-inset">
            <style>{`
              .safe-area-inset {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
              }
              * {
                -webkit-tap-highlight-color: transparent;
              }
              html {
                -webkit-overflow-scrolling: touch;
                scroll-behavior: smooth;
              }
              body {
                overscroll-behavior-y: contain;
                background: #FAFAFB;
              }
            `}</style>

            {/* Header */}
            <header className="bg-white px-5 py-3.5 sticky top-0 z-50 border-b border-[#EFEFF2]">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <Link to={getHomePath()}>
                    <div className="flex items-center gap-2.5 cursor-pointer">
                      <div className="w-9 h-9 rounded-xl bg-[#A78BFA] flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="leading-none">
                        <h1 className="text-[17px] font-bold text-[#0F0F12] tracking-tight">SLP-tec</h1>
                        <p className="text-[8px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mt-1">Speech Therapy Portal</p>
                      </div>
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-[#9CA3AF] hover:text-[#0F0F12]">
                    <LogOut className="w-5 h-5" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-md mx-auto pb-16">
              {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white z-50 border-t border-[#EFEFF2]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <div className="flex justify-around items-center px-2 py-2.5 max-w-md mx-auto">
                {navItems.map((item) => {
                  const isActive = isNavItemActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="flex flex-col items-center gap-1 py-1.5 px-3 relative"
                    >
                      <div className="relative">
                        <Icon className={`w-[22px] h-[22px] ${isActive ? "text-[#0F0F12]" : "text-[#9CA3AF]"}`} strokeWidth={isActive ? 2.25 : 1.75} />
                        {item.badge > 0 && (
                          <div className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-1 bg-[#A78BFA] rounded-full flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold">{item.badge > 9 ? '9+' : item.badge}</span>
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] ${isActive ? "text-[#0F0F12] font-semibold" : "text-[#9CA3AF] font-medium"}`}>{item.name}</span>
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

  // MANAGEMENT LAYOUT (Admin & Trainer - Desktop Sidebar / Mobile Drawer)
  return (
    <ErrorBoundary>
      <AuthGuard>
        <div className="min-h-screen bg-[#f9fafb] flex flex-col lg:flex-row">
          <style>{`
            :root {
              --primary-teal: #14b8a6;
              --primary-green: #10b981;
              --accent-purple: #8b5cf6;
              --text-dark: #1e293b;
            }
          `}</style>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 h-screen sticky top-0">
            <div className="px-5 py-5 border-b border-gray-100">
              <Link to={getHomePath()} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900 leading-none mb-0.5">SLP-tec</h1>
                  <p className="text-[11px] text-gray-400">{isAdminView ? 'Admin portal' : 'Practitioner portal'}</p>
                </div>
              </Link>
            </div>

            <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
              {(() => {
                let lastGroup = null;
                return navItems.map((item) => {
                  const isActive = isNavItemActive(item.path);
                  const Icon = item.icon;
                  const showGroupHeader = item.group && item.group !== lastGroup;
                  lastGroup = item.group || lastGroup;
                  return (
                    <React.Fragment key={item.name}>
                      {showGroupHeader && (
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 pt-5 pb-1.5">{item.group}</p>
                      )}
                      <Link
                        to={item.path}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                          isActive 
                            ? "bg-purple-50 text-purple-700 font-semibold" 
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-purple-600" : "text-gray-400"}`} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.name}</span>
                        {item.badge > 0 && (
                          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-purple-200 text-purple-800" : "bg-purple-100 text-purple-600"
                          }`}>
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </Link>
                    </React.Fragment>
                  );
                });
              })()}
            </nav>

            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{isTrainerView ? 'SLP · CCC-SLP' : user?.email}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-teal-100 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="w-6 h-6 text-gray-700" />
              </Button>
              <Link to={getHomePath()} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-lg block leading-none">SLP-tec</span>
                  <span className="text-[8px] font-semibold text-purple-600 uppercase tracking-wider block">Speech Therapy Portal</span>
                </div>
              </Link>
            </div>
            <div className="w-8"></div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="fixed inset-y-0 left-0 w-[320px] bg-gradient-to-b from-teal-50/50 to-white shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="p-5 border-b border-teal-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                  <Link to={getHomePath()} className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">SLP-tec</h2>
                      <p className="text-[11px] text-gray-500 font-medium">{isAdminView ? 'Admin portal' : 'Practitioner portal'}</p>
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-5 h-5 text-gray-400" />
                  </Button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {(() => {
                    let lastGroup = null;
                    return navItems.map((item) => {
                      const isActive = isNavItemActive(item.path);
                      const Icon = item.icon;
                      const showGroupHeader = item.group && item.group !== lastGroup;
                      lastGroup = item.group || lastGroup;
                      return (
                        <React.Fragment key={item.name}>
                          {showGroupHeader && (
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1">{item.group}</p>
                          )}
                          <Link
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                              isActive 
                                ? "bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-700 font-bold shadow-sm" 
                                : "text-gray-600 hover:bg-white/60"
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isActive ? "text-teal-600" : "text-gray-400"}`} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.name}</span>
                            {item.badge > 0 && (
                              <span className="ml-auto bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {item.badge > 9 ? '9+' : item.badge}
                              </span>
                            )}
                          </Link>
                        </React.Fragment>
                      );
                    });
                  })()}
                </nav>

                <div className="p-4 border-t border-teal-100 bg-gradient-to-b from-transparent to-teal-50/30">
                  <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center text-red-600 border-teal-200 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 overflow-y-auto">
            {children}
          </main>
        </div>
      </AuthGuard>
    </ErrorBoundary>
  );
}