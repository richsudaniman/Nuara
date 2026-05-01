import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Star, X, Play, Sparkles } from "lucide-react";
import EmptyState from "../components/EmptyState";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "articulation", label: "Sounds", emoji: "🔤" },
  { id: "language", label: "Language", emoji: "💬" },
  { id: "fluency", label: "Fluency", emoji: "🌊" },
  { id: "listening", label: "Listening", emoji: "👂" },
];

const DIFFICULTY_STYLE = {
  beginner: { label: "Easy", className: "bg-[#D1FAE5] text-[#059669]" },
  intermediate: { label: "Medium", className: "bg-[#FEF3C7] text-[#B45309]" },
  advanced: { label: "Tricky", className: "bg-[#FCE7F3] text-[#DB2777]" },
};

export default function Learn() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const mockActivities = [
    { id: 1, title: "Sound Match Challenge", emoji: "🎯", color: "bg-[#FEF3C7]", description: "Listen to pairs of words and spot the sneaky differences!", category: "articulation", difficulty_level: "beginner", duration_minutes: 10, notes: "Tap 'Same' or 'Different' as you hear the word pairs." },
    { id: 2, title: "Sentence Builder", emoji: "🧩", color: "bg-[#DBEAFE]", description: "Build big, awesome sentences from picture clues!", category: "language", difficulty_level: "intermediate", duration_minutes: 15, notes: "Drag and drop words to create meaningful sentences." },
    { id: 3, title: "Roaring /r/ Studio", emoji: "🦁", color: "bg-[#FED7AA]", description: "Record your roar! Then hear how cool you sound.", category: "articulation", difficulty_level: "intermediate", duration_minutes: 12, notes: "Practice words: red, rabbit, run, road, rain, ring" },
    { id: 4, title: "Bubble Breathing", emoji: "🫧", color: "bg-[#CFFAFE]", description: "Follow the bubble — breathe in, breathe out, speak smooth!", category: "fluency", difficulty_level: "beginner", duration_minutes: 8, notes: "Follow the circle as it expands and shrinks" },
    { id: 5, title: "Story Sequencing", emoji: "📖", color: "bg-[#EDE9FE]", description: "Put the story in order, then tell it your way!", category: "language", difficulty_level: "intermediate", duration_minutes: 15, notes: "Drag pictures into order, then tell the story" },
    { id: 6, title: "Tongue Twister Race", emoji: "👅", color: "bg-[#FCE7F3]", description: "How fast can YOU say it? Time yourself and beat your record!", category: "articulation", difficulty_level: "advanced", duration_minutes: 10, notes: "Start slow, then increase speed!" },
    { id: 7, title: "Speed Naming", emoji: "⚡", color: "bg-[#FFEDD5]", description: "Name everything you can in 60 seconds — go go go!", category: "language", difficulty_level: "beginner", duration_minutes: 5, notes: "Animals, Food, Clothing, Transportation…" },
    { id: 8, title: "Detective Ears", emoji: "🕵️", color: "bg-[#E0E7FF]", description: "Become a sound detective and crack the case!", category: "listening", difficulty_level: "intermediate", duration_minutes: 20, notes: "Answer who, what, where, when, why questions" }
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
      <div className="space-y-1.5">
        <h1 className="text-[28px] font-bold text-[#0F0F12] tracking-tight leading-tight flex items-center gap-2">
          Practice Time! <span>🎮</span>
        </h1>
        <p className="text-[14px] text-[#6B6B75]">Pick a game, have fun, earn points!</p>
      </div>

      {/* Daily challenge banner */}
      <div className="bg-gradient-to-br from-[#A78BFA] to-[#8B6FE8] rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-7xl opacity-20">🌟</div>
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/80 mb-1">Today's challenge</p>
          <h3 className="text-[18px] font-bold leading-tight mb-1">Beat your best score!</h3>
          <p className="text-[13px] text-white/90 mb-3">Complete 3 games to earn a bonus star ⭐</p>
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 rounded-full bg-white/30 border-2 border-[#A78BFA] flex items-center justify-center text-[10px]">⭐</div>
              <div className="w-6 h-6 rounded-full bg-white/30 border-2 border-[#A78BFA] flex items-center justify-center text-[10px]">⭐</div>
              <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-[#A78BFA] flex items-center justify-center text-[10px] opacity-50">⭐</div>
            </div>
            <span className="text-[12px] font-semibold">2 of 3 done</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <Input
          placeholder="Find a game..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white border-[#EFEFF2] rounded-xl text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-1 focus-visible:ring-[#A78BFA]"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => {
          const isActive = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                isActive
                  ? 'bg-[#A78BFA] text-white'
                  : 'bg-white border border-[#EFEFF2] text-[#0F0F12] hover:border-[#E5E5EA]'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Activities — playful 2-column grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5">
          {filteredVideos.map(video => {
            const diff = DIFFICULTY_STYLE[video.difficulty_level] || DIFFICULTY_STYLE.beginner;
            return (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="bg-white border border-[#EFEFF2] hover:border-[#E5E5EA] rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] flex flex-col"
              >
                <div className={`w-full aspect-square ${video.color} rounded-2xl flex items-center justify-center mb-3 text-5xl`}>
                  {video.emoji}
                </div>
                <p className="text-[14px] font-bold text-[#0F0F12] leading-tight mb-1.5 line-clamp-2">{video.title}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${diff.className}`}>
                    {diff.label}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-[11px] font-bold text-[#F59E0B]">+{video.duration_minutes}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No games found 🔍"
          description="Try a different search or category"
          variant="info"
        />
      )}

      {/* Detail Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden">
            <div className="relative">
              <div className={`${selectedVideo.color} px-5 pt-6 pb-5`}>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 hover:bg-white text-[#0F0F12] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="text-6xl mb-3">{selectedVideo.emoji}</div>
                  <h3 className="text-[22px] font-bold text-[#0F0F12] leading-tight">{selectedVideo.title}</h3>
                  <p className="text-[13px] text-[#0F0F12]/70 font-medium mt-1.5 max-w-[280px]">{selectedVideo.description}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-[#FAFAFB] border border-[#EFEFF2] rounded-2xl p-4">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.12em] mb-1.5">How to play</p>
                <p className="text-[13px] text-[#0F0F12] leading-relaxed">{selectedVideo.notes}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Reward</p>
                    <p className="text-[13px] font-bold text-[#F59E0B]">+{selectedVideo.duration_minutes} pts</p>
                  </div>
                </div>
                <div className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-xl p-3 flex items-center gap-2">
                  <span className="text-base">⏱️</span>
                  <div>
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Time</p>
                    <p className="text-[13px] font-bold text-[#0284C7]">~{selectedVideo.duration_minutes} min</p>
                  </div>
                </div>
              </div>

              <button className="w-full py-3.5 bg-[#A78BFA] hover:bg-[#9275F5] text-white text-[15px] font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
                <Play className="w-4 h-4 fill-white" />
                Let's play!
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}