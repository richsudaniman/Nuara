import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Award, Search, Users, ChevronDown, ChevronUp, Plus, Edit, X, UserX, UserCheck, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminTrainers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTrainer, setExpandedTrainer] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    specialties: "",
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['allAssignments'],
    queryFn: () => base44.entities.TrainerClientAssignment.filter({ is_active: true }),
    initialData: [],
  });

  const updateTrainerMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setEditingTrainer(null);
      resetForm();
    },
  });

  const toggleTrainerStatusMutation = useMutation({
    mutationFn: ({ userId, newUserType }) => base44.entities.User.update(userId, { user_type: newUserType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      bio: "",
      specialties: "",
    });
  };

  const handleSubmit = async () => {
    if (editingTrainer) {
      await updateTrainerMutation.mutateAsync({
        userId: editingTrainer.id,
        data: { ...formData, user_type: 'trainer' }
      });
    }
  };

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      full_name: trainer.full_name || "",
      email: trainer.email || "",
      phone: trainer.phone || "",
      bio: trainer.bio || "",
      specialties: trainer.specialties || "",
    });
    setShowCreateForm(true);
  };

  const handleDeactivate = async (trainerId) => {
    if (confirm('Deactivate this trainer? Their clients will remain but the trainer will lose access.')) {
      await toggleTrainerStatusMutation.mutateAsync({ userId: trainerId, newUserType: 'client' });
    }
  };

  const handleActivate = async (userId) => {
    if (confirm('Activate this user as a trainer?')) {
      await toggleTrainerStatusMutation.mutateAsync({ userId: userId, newUserType: 'trainer' });
    }
  };

  const trainers = allUsers.filter(u => u.user_type === 'trainer');
  const regularUsers = allUsers.filter(u => u.user_type === 'client' || !u.user_type);
  
  const filteredTrainers = trainers.filter(trainer =>
    trainer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTrainerClients = (trainerId) => {
    const trainerAssignments = assignments.filter(a => a.trainer_id === trainerId);
    const clientIds = trainerAssignments.map(a => a.client_id);
    return allUsers.filter(u => clientIds.includes(u.id));
  };

  const isLoading = usersLoading || assignmentsLoading;

  return (
    <div className="p-6 pb-32 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <Award className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-black italic text-[#1a1a1a]">TRAINER MANAGEMENT</h1>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("AdminInviteUser")}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold italic gap-2">
              <UserPlus className="w-4 h-4" />
              Invite Trainer
            </Button>
          </Link>
          <Button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              if (showCreateForm) {
                setEditingTrainer(null);
                resetForm();
              }
            }}
            variant="outline"
            className="font-bold italic"
          >
            <Edit className="w-4 h-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Edit Existing'}
          </Button>
        </div>
      </div>

      {/* Edit Trainer Form */}
      {showCreateForm && (
        <Card className="bg-white border-2 border-[#0ea5e9] glow-blue">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black italic text-[#1a1a1a] text-lg">EDIT TRAINER DETAILS</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTrainer(null);
                  resetForm();
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> To create a new trainer, use the "Invite Trainer" button above. Use this form to edit existing trainer details.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Full Name *</label>
                <Input
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-white border-gray-300"
                  disabled={!editingTrainer}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Email *</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border-gray-300"
                  disabled={true}
                />
                {!editingTrainer && (
                  <p className="text-xs text-gray-500 mt-1">Select a trainer to edit their details.</p>
                )}
                {editingTrainer && (
                  <p className="text-xs text-gray-500 mt-1">Email cannot be edited directly.</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Phone</label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white border-gray-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Bio / About</label>
                <Textarea
                  placeholder="Tell clients about this trainer's experience and expertise..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="bg-white border-gray-300 h-24"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Specialties</label>
                <Input
                  placeholder="e.g., Strength Training, Weight Loss, Nutrition"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  className="bg-white border-gray-300"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={updateTrainerMutation.isPending || !editingTrainer}
                className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic glow-blue"
              >
                {updateTrainerMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search trainers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-gray-300"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Trainers</p>
            <p className="text-2xl font-black italic text-[#1a1a1a]">{trainers.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Clients</p>
            <p className="text-2xl font-black italic text-[#1a1a1a]">{assignments.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Avg per Trainer</p>
            <p className="text-2xl font-black italic text-[#1a1a1a]">
              {trainers.length > 0 ? Math.round(assignments.length / trainers.length) : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trainers List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-gray-100" />)}
        </div>
      ) : filteredTrainers.length > 0 ? (
        <div className="space-y-3">
          {filteredTrainers.map(trainer => {
            const clients = getTrainerClients(trainer.id);
            const isExpanded = expandedTrainer === trainer.id;
            
            return (
              <Card key={trainer.id} className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-all">
                <CardContent className="p-4">
                  <div 
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedTrainer(isExpanded ? null : trainer.id)}
                  >
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      {trainer.profile_photo_url ? (
                        <img src={trainer.profile_photo_url} alt={trainer.full_name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Award className="w-8 h-8 text-purple-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-black italic text-[#1a1a1a] text-lg">{trainer.full_name || 'Trainer'}</h3>
                      <p className="text-sm text-gray-500">{trainer.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-[#0ea5e9]" />
                          <span className="text-sm font-bold text-gray-600">{clients.length} clients</span>
                        </div>
                        {trainer.specialties && (
                          <span className="text-xs text-gray-500 italic">{trainer.specialties}</span>
                        )}
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* Trainer Details */}
                      {trainer.bio && (
                        <div>
                          <h4 className="font-bold italic text-gray-600 text-sm mb-2 uppercase">About</h4>
                          <p className="text-sm text-gray-700">{trainer.bio}</p>
                        </div>
                      )}

                      {trainer.phone && (
                        <div>
                          <h4 className="font-bold italic text-gray-600 text-sm mb-1 uppercase">Contact</h4>
                          <p className="text-sm text-gray-700">{trainer.phone}</p>
                        </div>
                      )}

                      {/* Assigned Clients */}
                      {clients.length > 0 && (
                        <div>
                          <h4 className="font-bold italic text-gray-600 text-sm mb-3 uppercase">Assigned Clients</h4>
                          <div className="space-y-2">
                            {clients.map(client => (
                              <div key={client.id} className="flex items-center gap-3 p-2 bg-gray-50">
                                <div className="w-10 h-10 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center">
                                  {client.profile_photo_url ? (
                                    <img src={client.profile_photo_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span className="text-[#0ea5e9] font-bold text-sm">{client.full_name?.charAt(0) || 'C'}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-sm text-[#1a1a1a]">{client.full_name || 'Client'}</p>
                                  <p className="text-xs text-gray-500">{client.email}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(trainer);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Details
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeactivate(trainer.id);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 text-red-600 border-red-300 hover:bg-red-50"
                          disabled={toggleTrainerStatusMutation.isPending}
                        >
                          <UserX className="w-4 h-4" />
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  )}

                  {isExpanded && clients.length === 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center text-gray-500 italic text-sm">
                      No clients assigned yet
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 italic">
          {searchQuery ? "No trainers found matching your search" : "No trainers found"}
        </div>
      )}

      {/* Promote Users to Trainers Section */}
      {regularUsers.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardContent className="p-5">
            <h3 className="font-black italic text-[#1a1a1a] text-lg mb-3">PROMOTE USERS TO TRAINERS</h3>
            <p className="text-sm text-gray-600 mb-4">Select existing users to promote to trainer status</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {regularUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-gray-200">
                  <div>
                    <p className="font-bold text-sm text-[#1a1a1a]">{user.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Button
                    onClick={() => handleActivate(user.id)}
                    size="sm"
                    disabled={toggleTrainerStatusMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Make Trainer
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}