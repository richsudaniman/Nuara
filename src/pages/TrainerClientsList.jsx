import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, UserPlus, UserMinus, ChevronRight, User, Mail, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

import ClientRow from "@/components/trainer/ClientRow";
import AssignClientRow from "@/components/trainer/AssignClientRow";

export default function TrainerClientsList() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("my-clients");

  const { data: trainer } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["trainerAssignments", trainer?.id],
    queryFn: () =>
      base44.entities.PractitionerPatientAssignment.filter({
        trainer_id: trainer.id,
        is_active: true,
      }),
    enabled: !!trainer?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allAssignments = [] } = useQuery({
    queryKey: ["allActiveAssignments"],
    queryFn: async () => {
      const all = await base44.entities.PractitionerPatientAssignment.list();
      return all.filter((a) => a.is_active);
    },
    enabled: !!trainer?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
    enabled: !!trainer?.id,
    staleTime: 5 * 60 * 1000,
  });

  const assignMutation = useMutation({
    mutationFn: async (clientId) => {
      const existingOther = allAssignments.find(
        (a) => a.client_id === clientId && a.is_active && a.trainer_id !== trainer.id
      );
      if (existingOther) throw new Error("Client already assigned to another practitioner");

      await base44.entities.User.update(clientId, { assigned_trainer_id: trainer.id });

      const existing = assignments.find((a) => a.client_id === clientId && a.is_active);
      if (existing) return existing;

      return base44.entities.PractitionerPatientAssignment.create({
        trainer_id: trainer.id,
        client_id: clientId,
        assigned_date: new Date().toISOString().split("T")[0],
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainerAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["allActiveAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });

  const unassignMutation = useMutation({
    mutationFn: async (clientId) => {
      await base44.entities.User.update(clientId, { assigned_trainer_id: null });
      const assignment = assignments.find((a) => a.client_id === clientId && a.is_active);
      if (assignment) await base44.entities.PractitionerPatientAssignment.delete(assignment.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainerAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["allActiveAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });

  const clientIds = assignments.map((a) => a.client_id);
  const myClients = allUsers.filter((u) => clientIds.includes(u.id));
  const availableClients = allUsers.filter(
    (u) => (u.role === "user" || !u.role) && !clientIds.includes(u.id)
  );

  const filterBySearch = (list) =>
    list.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredMyClients = filterBySearch(myClients);
  const filteredAvailable = filterBySearch(availableClients);

  const isAssignedToOther = (clientId) =>
    allAssignments.some((a) => a.client_id === clientId && a.is_active && a.trainer_id !== trainer?.id);

  const getAssignment = (clientId) => assignments.find((a) => a.client_id === clientId);

  const isLoading = assignmentsLoading || usersLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-sm text-gray-500 mt-1">
          {assignments.length} active client{assignments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-gray-200 h-10 rounded-lg text-sm"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-9">
          <TabsTrigger value="my-clients" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
            My clients ({myClients.length})
          </TabsTrigger>
          <TabsTrigger value="assign" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Assign new
          </TabsTrigger>
        </TabsList>

        {/* My Clients Tab */}
        <TabsContent value="my-clients" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : filteredMyClients.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {filteredMyClients.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  assignment={getAssignment(client.id)}
                  onUnassign={() => unassignMutation.mutate(client.id)}
                  isUnassigning={unassignMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-700 mb-1">
                {searchQuery ? "No clients match your search" : "No clients assigned yet"}
              </p>
              <p className="text-sm text-gray-400">
                {searchQuery
                  ? "Try different search terms"
                  : 'Switch to the "Assign new" tab to add clients'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Assign New Tab */}
        <TabsContent value="assign" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : filteredAvailable.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {filteredAvailable.map((client) => (
                <AssignClientRow
                  key={client.id}
                  client={client}
                  isAssignedToOther={isAssignedToOther(client.id)}
                  onAssign={() => assignMutation.mutate(client.id)}
                  isAssigning={assignMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <UserPlus className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-700 mb-1">
                {searchQuery ? "No users match your search" : "All users are already assigned"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}