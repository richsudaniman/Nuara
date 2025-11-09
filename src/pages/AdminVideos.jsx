import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Search, Trash2, Play, X, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminVideos() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['allVideos'],
    queryFn: () => base44.entities.ExerciseVideo.list('-created_date'),
    initialData: [],
  });

  const { data: allUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (videoId) => base44.entities.ExerciseVideo.delete(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVideos'] });
    },
  });

  const handleDelete = async (videoId) => {
    if (confirm('Are you sure you want to delete this video?')) {
      await deleteVideoMutation.mutateAsync(videoId);
    }
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTrainerName = (trainerId) => {
    const trainer = allUsers.find(u => u.id === trainerId);
    return trainer?.full_name || 'Unknown Trainer';
  };

  return (
    <div className="p-6 space-y-5 relative">
      <div className="absolute top-10 right-10 w-20 h-20 border border-[#0ea5e9]/20 rotate-45 pointer-events-none"></div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
          <Video className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-black italic text-[#1a1a1a]">VIDEO MANAGEMENT</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-gray-300"
        />
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-lg bg-gray-100" />)}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid gap-3">
          {filteredVideos.map(video => (
            <Card key={video.id} className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-colors">
              <CardContent className="p-0">
                <div className="flex gap-4">
                  <div 
                    className="w-32 h-32 bg-gray-100 flex-shrink-0 relative overflow-hidden cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    {video.video_url ? (
                      <video 
                        src={video.video_url} 
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-12 h-12 text-[#0ea5e9]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white fill-current" />
                    </div>
                  </div>

                  <div className="flex-1 p-4">
                    <h3 className="font-black italic text-[#1a1a1a] text-lg mb-1">{video.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-gray-500">By: {getTrainerName(video.uploaded_by_trainer_id)}</span>
                      {video.duration_minutes > 0 && (
                        <span className="text-xs text-gray-500 font-semibold">{video.duration_minutes} min</span>
                      )}
                      <span className="px-2 py-0.5 text-xs font-bold bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-full">
                        {video.category}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedVideo(video)}
                        className="gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Watch
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(video.id)}
                        disabled={deleteVideoMutation.isPending}
                        className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 italic">
          {searchQuery ? "No videos found matching your search" : "No videos available"}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-white z-50 overflow-y-auto"
          style={{ paddingBottom: '80px' }}
        >
          <button 
            onClick={() => setSelectedVideo(null)}
            className="fixed top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="bg-black">
            <video 
              src={selectedVideo.video_url} 
              controls 
              autoPlay
              loop
              playsInline
              className="w-full"
              style={{ maxHeight: '45vh' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-xl font-black italic text-[#1a1a1a] mb-2">{selectedVideo.title}</h2>
              
              <div className="flex items-center gap-2 flex-wrap">
                {selectedVideo.duration_minutes > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                    <Clock className="w-3 h-3 text-[#0ea5e9]" />
                    <span className="text-xs font-bold text-gray-700">{selectedVideo.duration_minutes} min</span>
                  </div>
                )}
                <span className="px-2 py-1 text-xs font-bold bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-full">
                  {selectedVideo.category}
                </span>
                <span className="text-xs text-gray-500">
                  Uploaded by: {getTrainerName(selectedVideo.uploaded_by_trainer_id)}
                </span>
              </div>
            </div>

            {selectedVideo.description && (
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-[#0ea5e9]"></div>
                  <h3 className="font-black italic text-[#1a1a1a] uppercase text-sm">Description</h3>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedVideo.description}</p>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button
                onClick={() => setSelectedVideo(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-black italic py-6"
              >
                Close
              </Button>
              <Button
                onClick={() => handleDelete(selectedVideo.id)}
                disabled={deleteVideoMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black italic py-6"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Video
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}