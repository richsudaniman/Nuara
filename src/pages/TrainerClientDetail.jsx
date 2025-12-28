import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowLeft, Dumbbell, UtensilsCrossed, Target, FileText, TrendingUp, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ClientWorkoutPlans from "../components/trainer/ClientWorkoutPlans";
import ClientNutritionPlans from "../components/trainer/ClientNutritionPlans";
import ClientGoals from "../components/trainer/ClientGoals";
import ClientProgress from "../components/trainer/ClientProgress";
import ClientNotes from "../components/trainer/ClientNotes";
import ClientMessages from "../components/trainer/ClientMessages"; // New import

export default function TrainerClientDetail() {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const clientId = state?.clientId || searchParams.get('clientId');

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.find(u => u.id === clientId) || null;
    },
    enabled: !!clientId,
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  if (!clientId) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 font-semibold">No client ID provided</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link to={createPageUrl("TrainerClients")}>
          <Button variant="ghost" className="pl-0 gap-2 text-gray-500 hover:text-[#0ea5e9] hover:bg-transparent mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </Button>
        </Link>
        
        {clientLoading ? (
          <Skeleton className="h-32 rounded-xl bg-gray-100" />
        ) : client ? (
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0">
                  {client.profile_photo_url ? (
                    <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{client.full_name || 'Client'}</h1>
                      <p className="text-gray-500">{client.email}</p>
                    </div>
                    {/* Placeholder for future actions like "Edit Client" */}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {client.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-semibold text-gray-400 uppercase text-xs">Phone</span>
                        {client.phone}
                      </div>
                    )}
                    {/* Add more meta info if available */}
                  </div>
                  
                  {client.bio && (
                    <div className="pt-2">
                      <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">{client.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-yellow-50 border-none rounded-xl">
            <CardContent className="p-6 text-center">
              <p className="text-yellow-700 font-semibold">Client not found</p>
              <p className="text-sm text-yellow-600 mt-2">ID: {clientId}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="workouts" className="w-full space-y-6">
        <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-full justify-start h-auto flex-wrap gap-1"> 
          <TabsTrigger 
            value="workouts" 
            className="flex-1 min-w-[100px] data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white text-gray-600 font-semibold rounded-lg py-2.5 transition-all"
          >
            <Dumbbell className="w-4 h-4 mr-2" />
            Workouts
          </TabsTrigger>
          <TabsTrigger 
            value="nutrition" 
            className="flex-1 min-w-[100px] data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white text-gray-600 font-semibold rounded-lg py-2.5 transition-all"
          >
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Nutrition
          </TabsTrigger>
          <TabsTrigger 
            value="goals" 
            className="flex-1 min-w-[100px] data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white text-gray-600 font-semibold rounded-lg py-2.5 transition-all"
          >
            <Target className="w-4 h-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="flex-1 min-w-[100px] data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white text-gray-600 font-semibold rounded-lg py-2.5 transition-all"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger 
            value="messages" 
            className="flex-1 min-w-[100px] data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white text-gray-600 font-semibold rounded-lg py-2.5 transition-all"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger 
            value="notes" 
            className="flex-1 min-w-[100px] data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white text-gray-600 font-semibold rounded-lg py-2.5 transition-all"
          >
            <FileText className="w-4 h-4 mr-2" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workouts" className="mt-4">
          <ClientWorkoutPlans clientId={clientId} />
        </TabsContent>

        <TabsContent value="nutrition" className="mt-4">
          <ClientNutritionPlans clientId={clientId} />
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <ClientGoals clientId={clientId} />
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <ClientProgress clientId={clientId} />
        </TabsContent>

        <TabsContent value="messages" className="mt-4"> {/* New TabsContent for Messages */}
          {userLoading ? (
            <Skeleton className="h-96 rounded-lg bg-gray-100" />
          ) : (
            <ClientMessages clientId={clientId} trainerId={user?.id} />
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          {userLoading ? (
            <Skeleton className="h-40 rounded-lg bg-gray-100" />
          ) : (
            <ClientNotes clientId={clientId} trainerId={user?.id} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}