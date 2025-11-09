import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Edit, Shield, User, Award, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EmptyState from "../components/EmptyState";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }) => base44.entities.User.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setEditingUser(null);
    },
  });

  const handleRoleChange = async (userId, newRole) => {
    await updateUserMutation.mutateAsync({ userId, data: { role: newRole } });
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter || (!user.role && roleFilter === "user");
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role) => {
    if (role === 'admin') return Shield;
    if (role === 'trainer') return Award;
    return User;
  };

  const getRoleColor = (role) => {
    if (role === 'admin') return "text-red-600 bg-red-100";
    if (role === 'trainer') return "text-purple-600 bg-purple-100";
    return "text-blue-600 bg-blue-100";
  };

  return (
    <div className="p-4 md:p-6 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black italic text-[#1a1a1a]">USER MANAGEMENT</h1>
        </div>
        <Link to={createPageUrl("AdminInviteUser")}>
          <Button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic gap-2 w-full sm:w-auto">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Invite User</span>
            <span className="sm:hidden">Invite</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-300"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-32 bg-white border-gray-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="trainer">Trainer</SelectItem>
            <SelectItem value="user">Client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-gray-100" />)}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="space-y-3">
          {filteredUsers.map(user => {
            const RoleIcon = getRoleIcon(user.role);
            const isEditing = editingUser?.id === user.id;
            
            return (
              <Card key={user.id} className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-all">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex items-start gap-4 flex-1 w-full">
                      <div className="w-14 h-14 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0">
                        {user.profile_photo_url ? (
                          <img src={user.profile_photo_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <RoleIcon className="w-6 h-6 text-[#0ea5e9]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-black italic text-[#1a1a1a] truncate">{user.full_name || 'User'}</h3>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role || 'user'}
                          </span>
                          <span className="text-xs text-gray-400 truncate">ID: {user.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      {isEditing ? (
                        <div className="flex flex-col gap-2 w-full">
                          <Select
                            value={editingUser.role || 'user'}
                            onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                          >
                            <SelectTrigger className="w-full bg-white border-gray-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="trainer">Trainer</SelectItem>
                              <SelectItem value="user">Client</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(null)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRoleChange(user.id, editingUser.role)}
                              disabled={updateUserMutation.isPending}
                              className="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                          className="gap-2 w-full"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit Role</span>
                          <span className="sm:hidden">Edit</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No Users Found"
          description={searchQuery ? "No users match your search criteria" : "No users in the system yet"}
          variant="info"
        />
      )}
    </div>
  );
}