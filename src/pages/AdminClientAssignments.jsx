import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, RefreshCw, ArrowRight, ArrowLeft, UserPlus, UserX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminClientAssignments() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTrainer, setFilterTrainer] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);
  const [newTrainerId, setNewTrainerId] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['allAssignments'],
    queryFn: () => base44.entities.TrainerClientAssignment.list('-created_date'),
    initialData: [],
  });

  const trainers = allUsers.filter(u => u.user_type === 'trainer');
  const clients = allUsers.filter(u => u.user_type !== 'trainer' && u.role !== 'admin' && u.role !== 'trainer');

  const assignClientMutation = useMutation({
    mutationFn: async ({ clientId, trainerId }) => {
      // First, deactivate any existing assignments for this client
      const existingAssignments = assignments.filter(a => a.client_id === clientId && a.is_active);
      for (const assignment of existingAssignments) {
        await base44.entities.TrainerClientAssignment.update(assignment.id, { is_active: false });
      }

      // Create new assignment
      return base44.entities.TrainerClientAssignment.create({
        trainer_id: trainerId,
        client_id: clientId,
        assigned_date: new Date().toISOString().split('T')[0],
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAssignments'] });
      setShowAssignModal(false);
      setSelectedClient(null);
      setNewTrainerId("");
    },
  });

  const reassignClientMutation = useMutation({
    mutationFn: async ({ clientId, oldTrainerId, newTrainerId }) => {
      // Deactivate old assignment
      const oldAssignment = assignments.find(a => 
        a.client_id === clientId && 
        a.trainer_id === oldTrainerId && 
        a.is_active
      );
      if (oldAssignment) {
        await base44.entities.TrainerClientAssignment.update(oldAssignment.id, { is_active: false });
      }

      // Create new assignment
      const newAssignment = await base44.entities.TrainerClientAssignment.create({
        trainer_id: newTrainerId,
        client_id: clientId,
        assigned_date: new Date().toISOString().split('T')[0],
        is_active: true
      });
      
      // Send email notifications
      try {
        const clientList = await base44.entities.User.filter({ id: clientId });
        const trainerList = await base44.entities.User.filter({ id: newTrainerId });
        const client = clientList[0];
        const trainer = trainerList[0];
        
        if (trainer?.email && client?.full_name) {
          await base44.integrations.Core.SendEmail({
            from_name: 'EJT Fitness',
            to: trainer.email,
            subject: `New Client Assigned: ${client.full_name}`,
            body: `Hi ${trainer.full_name || 'Trainer'},

A new client has been assigned to you:

Client Name: ${client.full_name}
Client Email: ${client.email}

Please log in to the trainer portal to start creating their workout and nutrition plans.

Best regards,
EJT Fitness Team`
          });
        }
        
        if (client?.email && trainer?.full_name) {
          await base44.integrations.Core.SendEmail({
            from_name: 'EJT Fitness',
            to: client.email,
            subject: `Your New Trainer: ${trainer.full_name}`,
            body: `Hi ${client.full_name},

You've been assigned a new trainer:

Trainer Name: ${trainer.full_name}
Trainer Email: ${trainer.email}

Your trainer will be creating customized workout and nutrition plans for you. Stay tuned!

Best regards,
EJT Fitness Team`
          });
        }
      } catch (emailError) {
        console.error('Error sending notification emails:', emailError);
      }
      
      return newAssignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAssignments'] });
      setShowAssignModal(false);
      setSelectedClient(null);
      setNewTrainerId("");
    },
  });

  const getClientTrainer = (clientId) => {
    const assignment = assignments.find(a => a.client_id === clientId && a.is_active);
    if (!assignment) return null;
    return trainers.find(t => t.id === assignment.trainer_id);
  };

  const getTrainerClientCount = (trainerId) => {
    return assignments.filter(a => a.trainer_id === trainerId && a.is_active).length;
  };

  const unassignedClients = clients.filter(client => !getClientTrainer(client.id));

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterTrainer === "all") return true;
    if (filterTrainer === "unassigned") return !getClientTrainer(client.id);
    
    const trainer = getClientTrainer(client.id);
    return trainer?.id === filterTrainer;
  });

  const handleAssignClick = (client) => {
    setSelectedClient(client);
    const currentTrainer = getClientTrainer(client.id);
    setNewTrainerId(currentTrainer?.id || "");
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedClient || !newTrainerId) return;

    const currentTrainer = getClientTrainer(selectedClient.id);
    
    if (currentTrainer) {
      // Reassign
      await reassignClientMutation.mutateAsync({
        clientId: selectedClient.id,
        oldTrainerId: currentTrainer.id,
        newTrainerId: newTrainerId
      });
    } else {
      // New assignment
      await assignClientMutation.mutateAsync({
        clientId: selectedClient.id,
        trainerId: newTrainerId
      });
    }
  };

  const isLoading = usersLoading || assignmentsLoading;
  const isPending = assignClientMutation.isPending || reassignClientMutation.isPending;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Link to={createPageUrl("AdminDashboard")}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 -ml-2">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Client Assignments</h1>
            </div>
            <p className="text-sm text-gray-500">Manage client-trainer relationships</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden group">
            <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="w-16 h-16 text-[#0ea5e9]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Clients</span>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-black text-[#0ea5e9]">{clients.length}</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden group">
            <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <UserPlus className="w-16 h-16 text-teal-600" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Trainers</span>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-black text-teal-600">{trainers.length}</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden group">
            <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <UserX className="w-16 h-16 text-orange-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Unassigned Clients</span>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-black text-orange-500">{unassignedClients.length}</span>
                        {unassignedClients.length > 0 && (
                            <span className="text-xs text-orange-600/70 font-bold bg-orange-50 px-2 py-0.5 rounded-full">ACTION NEEDED</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Client List */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200 h-11"
                />
                </div>
                <Select value={filterTrainer} onValueChange={setFilterTrainer}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200 h-11">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Trainers</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {trainers.map(trainer => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.full_name || trainer.email}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl bg-gray-100" />)}
                </div>
            ) : filteredClients.length > 0 ? (
                <div className="space-y-4">
                {filteredClients.map(client => {
                    const trainer = getClientTrainer(client.id);
                    
                    return (
                    <Card key={client.id} className="bg-white border-none shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all group">
                        <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                                {client.profile_photo_url ? (
                                <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                <span className="text-gray-500 font-bold text-lg">
                                    {client.full_name?.charAt(0) || 'C'}
                                </span>
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{client.full_name || 'Client'}</h3>
                                <p className="text-sm text-gray-500">{client.email}</p>
                                
                                {trainer ? (
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs text-gray-400">Assigned to:</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                            {trainer.full_name?.charAt(0)}
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">{trainer.full_name || trainer.email}</span>
                                    </div>
                                </div>
                                ) : (
                                <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-orange-50 text-orange-600 rounded-full border border-orange-100">
                                    Unassigned
                                </span>
                                )}
                            </div>
                            </div>

                            <Button
                            onClick={() => handleAssignClick(client)}
                            size="sm"
                            variant="outline"
                            className={trainer ? "text-gray-600 hover:text-gray-900 border-gray-200 bg-white" : "bg-[#0ea5e9] hover:bg-[#0284c7] text-white border-transparent"}
                            >
                            <RefreshCw className="w-3.5 h-3.5 mr-2" />
                            {trainer ? 'Reassign' : 'Assign'}
                            </Button>
                        </div>
                        </CardContent>
                    </Card>
                    );
                })}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No clients found</p>
                </div>
            )}
        </div>

        {/* Sidebar: Workload */}
        <div className="space-y-6">
             <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                    <h3 className="font-bold text-gray-900">Trainer Workload</h3>
                </div>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                    {trainers.map(trainer => {
                        const clientCount = getTrainerClientCount(trainer.id);
                        const capacity = 20; 
                        const percentage = (clientCount / capacity) * 100;
                        
                        return (
                        <div key={trainer.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">
                                        {trainer.full_name?.charAt(0)}
                                    </div>
                                    <p className="font-bold text-sm text-gray-700">{trainer.full_name || trainer.email}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    percentage >= 80 ? 'bg-red-50 text-red-600' :
                                    percentage >= 50 ? 'bg-yellow-50 text-yellow-600' :
                                    'bg-green-50 text-green-600'
                                }`}>
                                    {clientCount}/{capacity}
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-300 ${
                                percentage >= 80 ? 'bg-red-500' :
                                percentage >= 50 ? 'bg-yellow-500' :
                                'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="bg-white max-w-md w-full border-none shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 text-xl mb-6">
                {getClientTrainer(selectedClient.id) ? 'Reassign Client' : 'Assign Client'}
              </h3>

              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Client</p>
                <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {selectedClient.full_name?.charAt(0)}
                    </div>
                    <p className="font-bold text-gray-900">{selectedClient.full_name || selectedClient.email}</p>
                </div>
              </div>

              {getClientTrainer(selectedClient.id) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    Currently assigned to: <span className="font-bold">{getClientTrainer(selectedClient.id).full_name}</span>
                  </p>
                </div>
              )}

              <div className="mb-8">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Select New Trainer</label>
                <Select value={newTrainerId} onValueChange={setNewTrainerId}>
                  <SelectTrigger className="bg-white border-gray-200 h-11">
                    <SelectValue placeholder="Choose a trainer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map(trainer => {
                      const clientCount = getTrainerClientCount(trainer.id);
                      return (
                        <SelectItem key={trainer.id} value={trainer.id}>
                          {trainer.full_name || trainer.email} ({clientCount} clients)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedClient(null);
                    setNewTrainerId("");
                  }}
                  className="flex-1 h-11"
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignSubmit}
                  disabled={!newTrainerId || isPending}
                  className="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold h-11"
                >
                  {isPending ? 'Assigning...' : 'Confirm'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}