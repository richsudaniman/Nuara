import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, X, Gamepad2, Play } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function Learn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const mockActivities = [
    { id: 1, title: "Sound Match Challenge", description: "Listen to pairs of words and identify if they have the same or different sounds.", category: "articulation", difficulty_level: "beginner", duration_minutes: 10, notes: "Tap 'Same' or 'Different' as you hear the word pairs." },
    { id: 2, title: "Sentence Builder — Level 3", description: "Create complex sentences using picture prompts. Build sentences with 6-8 words.", category: "language", difficulty_level: "intermediate", duration_minutes: 15, notes: "Drag and drop words to create meaningful sentences." },
    { id: 3, title: "/r/ Sound Recording Studio", description: "Record yourself saying /r/ words and compare them to the correct pronunciation.", category: "articulation", difficulty_level: "intermediate", duration_minutes: 12, notes: "Practice words: red, rabbit, run, road, rain, ring" },
    { id: 4, title: "Fluency Breathing Game", description: "Interactive breathing exercises to help with speech fluency and pacing.", category: "fluency", difficulty_level: "beginner", duration_minutes: 8, notes: "Follow the circle as it expands and shrinks" },
    { id: 5, title: "Story Sequencing Challenge", description: "Put story events in the correct order and then retell the story.", category: "language", difficulty_level: "intermediate", duration_minutes: 15, notes: "Drag pictures into order, then tell the story" },
    { id: 6, title: "Tongue Twister Marathon", description: "Try saying fun tongue twisters at different speeds.", category: "articulation", difficulty_level: "advanced", duration_minutes: 10, notes: "Start slow, then increase speed!" },
    { id: 7, title: "Category Naming Speed Round", description: "Name as many items as you can in a category within 60 seconds.", category: "language", difficulty_level: "beginner", duration_minutes: 5, notes: "Animals, Food, Clothing, Transportation…" },
    { id: 8, title: "Listening Comprehension Quiz", description: "Listen to short stories and answer questions about what you heard.", category: "listening", difficulty_level: "intermediate", duration_minutes: 20, notes: "Answer who, what, where, when, why questions" }
  ];

  const filteredVideos = mockActivities.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || video.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#FAFAFB] min-h-screen px-5 py-6 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[26px] font-bold text-[#0F0F12] tracking-tight leading-tight">Practice</h1>
        <p className="text-[14px] text-[#6B6B75]">Extra games to boost your skills and earn points.</p>
      </div>

      {/* Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border-[#EFEFF2] rounded-xl text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-1 focus-visible:ring-[#A78BFA]"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full h-11 bg-white border-[#EFEFF2] rounded-xl text-[14px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activities</SelectItem>
            <SelectItem value="articulation">Articulation</SelectItem>
            <SelectItem value="language">Language</SelectItem>
            <SelectItem value="fluency">Fluency</SelectItem>
            <SelectItem value="listening">Listening</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activities */}
      {filteredVideos.length > 0 ? (
        <div className="space-y-2.5">
          {filteredVideos.map(video => (
            <button
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="w-full bg-white border border-[#EFEFF2] hover:border-[#E5E5EA] rounded-2xl p-4 text-left transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#EDE7FE] flex items-center justify-center flex-shrink-0">
                  <Gamepad2 className="w-5 h-5 text-[#A78BFA]" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[15px] font-semibold text-[#0F0F12] leading-tight">{video.title}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-[11px] font-bold text-[#F59E0B]">+{video.duration_minutes}</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#6B6B75] line-clamp-2 mb-2">{video.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#FAFAFB] border border-[#EFEFF2] rounded-md text-[10px] font-medium text-[#6B6B75] uppercase tracking-wider">
                      {video.category}
                    </span>
                    {video.difficulty_level && (
                      <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">
                        {video.difficulty_level}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Gamepad2}
          title="No activities found"
          description="Try adjusting your search or filters"
          variant="info"
        />
      )}

      {/* Detail Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden">
            <div className="p-5 border-b border-[#EFEFF2] flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mb-1">{selectedVideo.category}</p>
                <h3 className="text-[18px] font-semibold text-[#0F0F12] leading-tight">{selectedVideo.title}</h3>
              </div>
              <button onClick={() => setSelectedVideo(null)} className="text-[#9CA3AF] hover:text-[#0F0F12] flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-[14px] text-[#6B6B75] leading-relaxed">{selectedVideo.description}</p>

              <div className="bg-[#FAFAFB] border border-[#EFEFF2] rounded-xl p-3.5">
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-[0.12em] mb-1.5">How to play</p>
                <p className="text-[13px] text-[#0F0F12]">{selectedVideo.notes}</p>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl">
                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                <p className="text-[13px] text-[#0F0F12]">
                  Earn <span className="font-bold text-[#F59E0B]">+{selectedVideo.duration_minutes} points</span> for completing this activity.
                </p>
              </div>

              <button className="w-full py-3 bg-[#A78BFA] hover:bg-[#9275F5] text-white text-[14px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Play className="w-4 h-4 fill-white" />
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}