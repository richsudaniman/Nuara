import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Plus, Upload, X, Play, Search, Clock, Trash2, ArrowLeft, Loader2, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminEducationalContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "education",
    difficulty_level: "beginner",
    duration_minutes: 0,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: educationalVideos, isLoading } = useQuery({
    queryKey: ['educationalVideos'],
    queryFn: async () => {
      const allVideos = await base44.entities.TherapyActivity.list('-created_date');
      return allVideos.filter(v => v.category === 'education' || v.category === 'tutorial');
    },
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
      queryClient.invalidateQueries({ queryKey: ['educationalVideos'] });
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        category: "education",
        difficulty_level: "beginner",
        duration_minutes: 0,
      });
      setUploadProgress(0);
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (videoId) => base44.entities.TherapyActivity.delete(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalVideos'] });
      setSelectedVideo(null);
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      e.target.value = '';
      return;
    }

    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Video file is too large. Maximum size is 500MB');
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
      alert('Educational content uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading video: ' + error.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (videoId) => {
    if (confirm('Are you sure you want to delete this educational content?')) {
      await deleteVideoMutation.mutateAsync(videoId);
    }
  };

  const filteredVideos = educationalVideos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("AdminDashboard")}>
             <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
             </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Educational Content</h1>
            <p className="text-sm text-gray-500 mt-1">Manage tutorials and learning materials</p>
          </div>
        </div>
        
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold shadow-sm rounded-lg h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Content
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-sky-500 to-blue-600 border-none shadow-md text-white">
        <CardContent className="p-6 flex items-start gap-4">
           <div className="p-3 bg-white/20 rounded-lg text-white">
              <GraduationCap className="w-6 h-6" />
           </div>
           <div>
              <h3 className="font-bold text-lg mb-1">Knowledge Base</h3>
              <p className="text-sm text-white/90 leading-relaxed max-w-2xl">
                Upload educational videos, tutorials, and guides to help clients understand fitness concepts, 
                nutrition basics, and proper form. These resources appear in the "Learn" section for clients.
              </p>
           </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form (Sticky) */}
        {showForm && (
          <div className="lg:col-span-1">
            <Card className="bg-white border-none shadow-md rounded-xl overflow-hidden sticky top-6">
               <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Upload New Content</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="h-8 w-8 p-0 rounded-full">
                    <X className="w-4 h-4 text-gray-400" />
                  </Button>
               </div>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Title *</label>
                    <Input
                      placeholder="Tutorial or lesson name"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white border-gray-200"
                      disabled={uploading}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Description</label>
                    <Textarea
                      placeholder="What does this content teach?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white border-gray-200 h-24 resize-none"
                      disabled={uploading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Category</label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                        disabled={uploading}
                      >
                        <SelectTrigger className="bg-white border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="tutorial">Tutorial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Duration (min)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                        className="bg-white border-gray-200"
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Difficulty Level</label>
                    <Select 
                      value={formData.difficulty_level} 
                      onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                      disabled={uploading}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {uploading && uploadProgress > 0 && (
                    <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex justify-between text-xs font-bold text-blue-700">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0ea5e9] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-200 hover:border-[#0ea5e9] hover:bg-blue-50 transition-colors rounded-xl p-6 text-center group">
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading || !formData.title.trim()}
                      />
                      <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:text-[#0ea5e9] transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-gray-600 mb-1">
                        {uploading ? 'Uploading...' : 'Click to select video'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Max: 500MB • MP4, MOV
                      </p>
                      {!formData.title.trim() && (
                        <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 py-1 px-2 rounded inline-block">
                           Enter title first
                        </p>
                      )}
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content List */}
        <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200 h-11 shadow-sm"
                    />
                </div>
                {!showForm && (
                     <p className="text-sm text-gray-500 font-medium whitespace-nowrap hidden md:block">
                        {filteredVideos.length} items found
                     </p>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl bg-gray-100" />)}
                </div>
            ) : filteredVideos.length > 0 ? (
                <div className={`grid grid-cols-1 ${showForm ? 'md:grid-cols-2' : 'md:grid-cols-3 lg:grid-cols-4'} gap-6`}>
                {filteredVideos.map(video => (
                    <Card 
                    key={video.id} 
                    className="bg-white border-none shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden cursor-pointer group flex flex-col h-full"
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
                            <Play className="w-10 h-10 text-gray-300" />
                        </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm transform scale-90 group-hover:scale-100 transition-transform">
                              <Play className="w-4 h-4 text-[#0ea5e9] ml-0.5" />
                           </div>
                        </div>
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button
                                size="icon"
                                variant="destructive"
                                className="h-7 w-7 rounded-full shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(video.id);
                                }}
                             >
                                <Trash2 className="w-3.5 h-3.5" />
                             </Button>
                        </div>

                        {video.duration_minutes > 0 && (
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-[10px] font-bold text-white flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {video.duration_minutes}m
                            </div>
                        )}
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-gray-900 line-clamp-1 text-sm flex-1 mr-2">{video.title}</h3>
                             <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-sky-50 text-sky-600 flex-shrink-0">
                                {video.category}
                             </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed flex-1">{video.description}</p>
                        
                        <div className="flex items-center gap-2 mt-auto">
                            {video.difficulty_level && (
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border capitalize ${
                                    video.difficulty_level === 'beginner' ? 'bg-green-50 text-green-700 border-green-100' :
                                    video.difficulty_level === 'intermediate' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                {video.difficulty_level}
                                </span>
                            )}
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <GraduationCap className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">No Content Found</h3>
                <p className="text-sm text-gray-500">
                    {searchQuery ? "Try adjusting your search terms" : "Upload your first educational video"}
                </p>
                {!searchQuery && (
                    <Button 
                        variant="link" 
                        className="text-[#0ea5e9] font-bold mt-2"
                        onClick={() => setShowForm(true)}
                    >
                        Upload Content
                    </Button>
                )}
                </div>
            )}
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[80vh] flex flex-col md:flex-row shadow-2xl">
            <div className="bg-black w-full md:w-[60%] flex items-center justify-center">
                 <video 
                    src={selectedVideo.video_url} 
                    controls 
                    autoPlay
                    className="w-full h-full max-h-[50vh] md:max-h-full object-contain"
                />
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col">
                <div className="flex justify-between items-start mb-4">
                     <div>
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                            {selectedVideo.category}
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedVideo.title}</h2>
                     </div>
                     <button onClick={() => setSelectedVideo(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                     </button>
                </div>

                <div className="flex items-center gap-3 mb-6 text-xs font-medium text-gray-500">
                    {selectedVideo.duration_minutes > 0 && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {selectedVideo.duration_minutes} min
                        </div>
                    )}
                    {selectedVideo.difficulty_level && (
                        <div className="capitalize px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                            {selectedVideo.difficulty_level}
                        </div>
                    )}
                </div>

                <div className="prose prose-sm text-gray-600 mb-8 flex-1 overflow-y-auto">
                    <p>{selectedVideo.description}</p>
                </div>

                <div className="pt-4 mt-auto border-t border-gray-100">
                    <Button
                        variant="destructive"
                        className="w-full gap-2"
                        onClick={() => handleDelete(selectedVideo.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Content
                    </Button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}