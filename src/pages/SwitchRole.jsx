import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, User, Award, Shield } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function SwitchRole() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('viewMode') || 'client';
    }
    return 'client';
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
  });

  const switchView = (viewMode) => {
    localStorage.setItem('viewMode', viewMode);
    setCurrentView(viewMode);
    
    setTimeout(() => {
      if (viewMode === 'admin') {
        window.location.href = createPageUrl('AdminDashboard');
      } else if (viewMode === 'trainer') {
        window.location.href = createPageUrl('TrainerDashboard');
      } else {
        window.location.href = createPageUrl('Home');
      }
    }, 100);
  };

  // Always show all three roles for testing purposes
  const availableRoles = [
    {
      id: 'client',
      name: 'Client View',
      description: 'Access your workouts, nutrition, and progress',
      icon: User,
      bgColor: 'bg-[#0ea5e9]',
      textColor: 'text-[#0ea5e9]',
    },
    {
      id: 'trainer',
      name: 'Clinician Portal',
      description: 'Manage your clients and their programs',
      icon: Award,
      bgColor: 'bg-purple-600',
      textColor: 'text-purple-600',
    },
    {
      id: 'admin',
      name: 'Admin Portal',
      description: 'Manage users, clinicians, and platform settings',
      icon: Shield,
      bgColor: 'bg-red-600',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
      <Card className="bg-white border-2 border-[#0ea5e9] max-w-md w-full glow-blue">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <UserCircle className="w-16 h-16 text-[#0ea5e9] mx-auto mb-4" />
            <h1 className="text-2xl font-black italic text-[#1a1a1a]">SELECT YOUR VIEW</h1>
            <p className="text-sm text-gray-600 mt-2">
              Current: <span className="font-bold text-[#0ea5e9] capitalize">{currentView}</span>
            </p>
            {user?.email && (
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            )}
          </div>

          <div className="space-y-3">
            {availableRoles.map((role) => {
              const IconComponent = role.icon;
              const isSelected = currentView === role.id;

              return (
                <Button
                  key={role.id}
                  onClick={() => switchView(role.id)}
                  className={`w-full h-20 ${
                    isSelected 
                      ? `${role.bgColor} text-white border-2 border-transparent` 
                      : `bg-white text-[#1a1a1a] border-2 border-gray-200 hover:border-gray-300`
                  } font-bold italic flex items-center justify-start gap-4 px-6 transition-all`}
                >
                  <IconComponent className={`w-8 h-8 ${isSelected ? 'text-white' : role.textColor}`} />
                  <div className="text-left">
                    <div className="text-lg">{role.name}</div>
                    <div className={`text-xs font-normal ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                      {role.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="mt-6 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-xs text-blue-800">
              <strong>Testing Mode:</strong> Switch between roles to test different user experiences. All views are available for testing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}