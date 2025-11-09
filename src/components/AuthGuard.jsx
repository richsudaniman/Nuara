import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthGuard({ children }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          // Redirect to login
          base44.auth.redirectToLogin(window.location.pathname);
          return null;
        }
        return await base44.auth.me();
      } catch (error) {
        console.error("Auth error:", error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-md mx-auto space-y-4">
          <Skeleton className="h-24 rounded-lg bg-gray-100" />
          <Skeleton className="h-48 rounded-lg bg-gray-100" />
          <Skeleton className="h-48 rounded-lg bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">Unable to verify your login status.</p>
          <Button
            onClick={() => base44.auth.redirectToLogin()}
            className="bg-[#0ea5e9] text-white font-bold"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return children;
}