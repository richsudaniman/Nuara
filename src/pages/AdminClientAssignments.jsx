import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, UserPlus, RefreshCw, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="p-6 pb-32 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
          <Users className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-black italic text-[#1a1a1a]">CLIENT ASSIGNMENTS</h1>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Clients</p>
              <p className="text-3xl font-black italic text-[#1a1a1a]">{clients.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Active Trainers</p>
              <p className="text-3xl font-black italic text-[#1a1a1a]">{trainers.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-none">
            <CardContent className="p-4">
              <p className="text-xs text-white/80 uppercase font-bold mb-1">Unassigned</p>
              <p className="text-3xl font-black italic text-white">{unassignedClients.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-300"
          />
        </div>
        <Select value={filterTrainer} onValueChange={setFilterTrainer}>
          <SelectTrigger className="w-40 bg-white border-gray-300">
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

      {/* Trainer Workload Overview */}
      {!isLoading && (
        <Card className="bg-white border-2 border-gray-200">
          <CardContent className="p-5">
            <h3 className="font-black italic text-[#1a1a1a] text-lg mb-4">TRAINER WORKLOAD</h3>
            <div className="space-y-3">
              {trainers.map(trainer => {
                const clientCount = getTrainerClientCount(trainer.id);
                const capacity = 20; // You can make this configurable
                const percentage = (clientCount / capacity) * 100;
                
                return (
                  <div key={trainer.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-[#1a1a1a]">{trainer.full_name || trainer.email}</p>
                        <p className="text-xs text-gray-500">{clientCount} / {capacity} clients</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        percentage >= 80 ? 'bg-red-100 text-red-700' :
                        percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
      )}

      {/* Clients List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-gray-100" />)}
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="space-y-3">
          {filteredClients.map(client => {
            const trainer = getClientTrainer(client.id);
            
            return (
              <Card key={client.id} className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
                        {client.profile_photo_url ? (
                          <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[#0ea5e9] font-black italic text-lg">
                            {client.full_name?.charAt(0) || 'C'}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-black italic text-[#1a1a1a]">{client.full_name || 'Client'}</h3>
                        <p className="text-sm text-gray-500">{client.email}</p>
                        
                        {trainer ? (
                          <div className="flex items-center gap-2 mt-2">
                            <ArrowRight className="w-4 h-4 text-[#0ea5e9]" />
                            <span className="text-xs font-bold text-[#0ea5e9]">{trainer.full_name || trainer.email}</span>
                          </div>
                        ) : (
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-bold bg-orange-100 text-orange-700 rounded-full">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAssignClick(client)}
                      size="sm"
                      className={trainer ? "bg-purple-600 hover:bg-purple-700" : "bg-[#0ea5e9] hover:bg-[#0284c7]"}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {trainer ? 'Reassign' : 'Assign'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 italic">
          {searchQuery ? "No clients found matching your search" : "No clients found"}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white max-w-md w-full">
            <CardContent className="p-6">
              <h3 className="font-black italic text-[#1a1a1a] text-xl mb-4">
                {getClientTrainer(selectedClient.id) ? 'REASSIGN CLIENT' : 'ASSIGN CLIENT'}
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Client:</p>
                <p className="font-bold text-[#1a1a1a]">{selectedClient.full_name || selectedClient.email}</p>
              </div>

              {getClientTrainer(selectedClient.id) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Currently assigned to: <span className="font-bold">{getClientTrainer(selectedClient.id).full_name}</span>
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="text-sm font-bold text-gray-600 mb-2 block">Select Trainer:</label>
                <Select value={newTrainerId} onValueChange={setNewTrainerId}>
                  <SelectTrigger className="bg-white border-gray-300">
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
                  className="flex-1"
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignSubmit}
                  disabled={!newTrainerId || isPending}
                  className="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic"
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