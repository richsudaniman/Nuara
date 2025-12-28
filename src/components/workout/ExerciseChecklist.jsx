import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, CheckCircle2, Circle, Video } from "lucide-react";
import { useState } from "react";
import ExerciseVideoModal from "./ExerciseVideoModal";

export default function ExerciseChecklist({ exercises = [], workoutType, onExerciseComplete, completedLogs = [] }) {
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [weights, setWeights] = useState({});

  const isExerciseCompleted = (exerciseName) => {
    return completedLogs.some(log => log.exercise_name === exerciseName);
  };

  const getCompletedWeight = (exerciseName) => {
    const log = completedLogs.find(log => log.exercise_name === exerciseName);
    return log?.weight_used;
  };

  if (!exercises || exercises.length === 0) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-5">
          <div className="text-center py-8 text-gray-500 italic">
            No exercises assigned yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#0ea5e9] flex items-center justify-center glow-blue" style={{clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'}}>
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg italic text-[#1a1a1a]">{workoutType}</h3>
              <p className="text-xs text-gray-500">{exercises.length} exercises</p>
            </div>
          </div>

          <div className="space-y-3">
            {exercises.map((exercise, index) => {
              const completed = isExerciseCompleted(exercise.name);
              
              return (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    completed 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-gray-50 border-gray-200 hover:border-[#0ea5e9]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold italic text-[#1a1a1a]">{exercise.name}</h4>
                        {completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-semibold text-[#0ea5e9]">{exercise.sets} sets</span> × {exercise.reps} reps
                      </p>

                      {!completed ? (
                        <div className="mb-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Weight (lbs) - Optional</label>
                          <Input 
                            type="number" 
                            placeholder="0"
                            className="h-8 w-24 bg-white border-gray-300 text-sm"
                            value={weights[exercise.name] || ''}
                            onChange={(e) => setWeights({...weights, [exercise.name]: e.target.value})}
                          />
                        </div>
                      ) : (
                        getCompletedWeight(exercise.name) > 0 && (
                          <p className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1">
                            <Dumbbell className="w-3 h-3" />
                            {getCompletedWeight(exercise.name)} lbs logged
                          </p>
                        )
                      )}
                      
                      {exercise.notes && (
                        <p className="text-xs text-gray-500 italic mb-3">{exercise.notes}</p>
                      )}

                      <div className="flex gap-2">
                        {!completed && (
                          <Button
                            onClick={() => onExerciseComplete(exercise.name, weights[exercise.name])}
                            size="sm"
                            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        
                        {exercise.video_url && (
                          <Button
                            onClick={() => setSelectedVideoUrl(exercise.video_url)}
                            size="sm"
                            variant="outline"
                            className="gap-1"
                          >
                            <Video className="w-4 h-4" />
                            Watch Form
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedVideoUrl && (
        <ExerciseVideoModal
          videoUrl={selectedVideoUrl}
          onClose={() => setSelectedVideoUrl(null)}
        />
      )}
    </>
  );
}