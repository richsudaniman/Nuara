import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Video, Plus, Upload, X, Play, Search, Clock, Trash2, User, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminVideos() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "articulation",
    duration_minutes: 0,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['allVideos'],
    queryFn: () => base44.entities.TherapyActivity.list('-created_date'),
    initialData: [],
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.TherapyActivity.create({
        ...data,
        uploaded_by_trainer_id: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVideos'] });
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        category: "articulation",
        duration_minutes: 0,
      });
      setUploadProgress(0);
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return base44.entities.TherapyActivity.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVideos'] });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (videoId) => base44.entities.TherapyActivity.delete(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVideos'] });
      setSelectedVideo(null);
    },
  });

  const handleDelete = async (videoId, e) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      await deleteVideoMutation.mutateAsync(videoId);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      e.target.value = '';
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('Video file is too large. Maximum size is 100MB. Please compress your video first.');
      e.target.value = '';
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a title first');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      setUploadProgress(30);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setUploadProgress(70);
      await uploadVideoMutation.mutateAsync({
        ...formData,
        video_url: file_url,
      });
      
      setUploadProgress(100);
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading video: ' + error.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const getTrainerName = (trainerId) => {
    const trainer = allUsers.find(u => u.id === trainerId);
    return trainer?.full_name || 'Unknown Clinician';
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ["articulation", "language", "fluency", "voice", "listening", "social", "cognitive", "mobility", "tutorial", "education"];
  const isLoading = videosLoading || usersLoading;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
          <p className="text-gray-500">Manage platform-wide exercise videos and tutorials</p>
        </div>
        
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg text-teal-500">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Videos</p>
                <p className="text-xl font-black text-gray-900">{videos.length}</p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold shadow-sm rounded-lg h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upload Form */}
      {showForm && (
        <Card className="bg-white border-none shadow-lg rounded-xl overflow-hidden relative z-10">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Upload New Video</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="rounded-full h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Title *</label>
                <Input
                  placeholder="Exercise or lesson name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white border-gray-300"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Description</label>
                <Textarea
                  placeholder="What does this video teach?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white border-gray-300 h-20"
                  disabled={uploading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Category</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={uploading}
                  >
                    <SelectTrigger className="bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="bg-white border-gray-300"
                    disabled={uploading}
                  />
                </div>
              </div>

              {uploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-semibold">Uploading...</span>
                    <span className="text-teal-500 font-black">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#14b8a6] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading || !formData.title.trim()}
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-600 mb-1">
                    {uploading ? 'Uploading...' : 'Click to select video file'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Max size: 100MB • Formats: MP4, MOV, AVI, etc.
                  </p>
                  <p className="text-xs text-teal-500 mt-2">
                    💡 Tip: Compress large videos before uploading
                  </p>
                  {!formData.title.trim() && (
                    <p className="text-xs text-red-500 mt-2">Please enter a title first</p>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-transparent focus:bg-white focus:border-teal-500 h-11 rounded-lg text-base transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-64 rounded-xl bg-gray-100" />)}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map(video => (
            <Card 
              key={video.id} 
              className="bg-white border-none shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden cursor-pointer group flex flex-col h-full"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                {video.video_url ? (
                  <video 
                    src={video.video_url} 
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <Video className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 text-teal-500 ml-1" />
                  </div>
                </div>
                {video.duration_minutes > 0 && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs font-medium text-white">
                    {video.duration_minutes}:00
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8 rounded-full shadow-md"
                        onClick={(e) => handleDelete(video.id, e)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
              </div>

              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 line-clamp-1 flex-1 pr-2">{video.title}</h3>
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-500 rounded-md flex-shrink-0">
                    {video.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{video.description}</p>
                
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">{getTrainerName(video.uploaded_by_trainer_id)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(video.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            {searchQuery ? "No Videos Found" : "No Videos Yet"}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {searchQuery ? "Try adjusting your search terms" : "Upload your first video to start building your library."}
          </p>
          {!searchQuery && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          )}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-5xl max-h-[70vh] flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-300 shadow-2xl ring-1 ring-black/5">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white rounded-full text-gray-500 hover:text-gray-900 transition-all backdrop-blur-md border border-gray-200/50 shadow-sm group"
            >
              <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
            </button>

            {/* Video Section */}
            <div className="bg-black w-full md:w-[60%] h-[300px] md:h-auto flex items-center justify-center shrink-0 relative">
              <video 
                src={selectedVideo.video_url} 
                controls 
                autoPlay
                className="w-full h-full object-contain"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
              <div className="p-8 overflow-y-auto custom-scrollbar h-full flex flex-col">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#14b8a6]/10 text-teal-500">
                      {selectedVideo.category}
                    </span>
                    {selectedVideo.duration_minutes > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">{selectedVideo.duration_minutes}m</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium truncate max-w-[150px]">
                            {getTrainerName(selectedVideo.uploaded_by_trainer_id)}
                        </span>
                    </div>
                  </div>
                  <h2 className="text-3xl font-black italic text-gray-900 leading-none tracking-tight mb-4">{selectedVideo.title}</h2>
                  
                  <div className="flex gap-2">
                    <Button 
                        variant="destructive" 
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDelete(selectedVideo.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Video
                    </Button>
                  </div>
                </div>

                {/* Description */}
                {selectedVideo.description && (
                  <div className="mb-8">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedVideo.description}
                    </p>
                  </div>
                )}

                {/* Notes Editor */}
                <div className="group relative bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all mt-auto">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]"></div>
                      Admin/Clinician Notes
                    </span>
                    <span className="text-[10px] text-teal-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-current animate-pulse"></div>
                      Auto-saving
                    </span>
                  </div>
                  <Textarea
                    placeholder="Add form cues, modifications, or specific instructions..."
                    defaultValue={selectedVideo.notes || ""}
                    className="bg-transparent border-none text-sm text-gray-700 placeholder:text-gray-400 focus:ring-0 px-0 min-h-[100px] resize-none focus-visible:ring-0"
                    onChange={(e) => {
                      const val = e.target.value;
                      clearTimeout(window._noteTimeout);
                      window._noteTimeout = setTimeout(() => {
                        updateVideoMutation.mutate({
                          id: selectedVideo.id,
                          data: { notes: val }
                        });
                      }, 1000);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}