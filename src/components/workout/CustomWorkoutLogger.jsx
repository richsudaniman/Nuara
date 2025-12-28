import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, X, Dumbbell } from "lucide-react";

export default function CustomWorkoutLogger({ onLogExercise, todaysLogs = [] }) {
  const [isLogging, setIsLogging] = useState(false);
  const [exercise, setExercise] = useState({ name: "", sets: "", reps: "", weight: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!exercise.name) return;
    
    onLogExercise({
      exercise_name: exercise.name,
      sets_completed: parseInt(exercise.sets) || 0,
      reps_completed: parseInt(exercise.reps) || 0,
      weight_used: parseFloat(exercise.weight) || 0,
      workout_plan_id: null // Explicitly null for custom
    });
    
    setExercise({ name: "", sets: "", reps: "", weight: "" });
    setIsLogging(false);
  };

  // Filter logs that don't have a plan ID (custom logs)
  const customLogs = todaysLogs.filter(log => !log.workout_plan_id);

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Dumbbell className="w-4 h-4 text-gray-400" />
        <h3 className="font-bold text-gray-600 text-sm uppercase tracking-wider">Additional Exercises</h3>
      </div>

      {/* List of custom logs for today */}
      {customLogs.length > 0 && (
        <div className="space-y-2 mb-4">
          {customLogs.map((log, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div>
                <span className="font-bold text-gray-800 block">{log.exercise_name}</span>
                <span className="text-gray-500 text-xs">
                  {log.sets_completed} sets × {log.reps_completed} reps
                </span>
              </div>
              {log.weight_used > 0 && (
                <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">
                  {log.weight_used} lbs
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isLogging ? (
        <Card className="bg-white border-2 border-[#0ea5e9] glow-blue animate-in fade-in zoom-in-95 duration-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-[#0ea5e9] text-sm uppercase">Log Custom Exercise</h4>
              <Button variant="ghost" size="sm" onClick={() => setIsLogging(false)} className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-500">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Exercise Name</label>
                <Input 
                  value={exercise.name} 
                  onChange={e => setExercise({...exercise, name: e.target.value})}
                  placeholder="e.g. Bicep Curls"
                  className="bg-white"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sets</label>
                  <Input 
                    type="number" 
                    value={exercise.sets} 
                    onChange={e => setExercise({...exercise, sets: e.target.value})}
                    placeholder="3"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Reps</label>
                  <Input 
                    type="number" 
                    value={exercise.reps} 
                    onChange={e => setExercise({...exercise, reps: e.target.value})}
                    placeholder="10"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Lbs</label>
                  <Input 
                    type="number" 
                    value={exercise.weight} 
                    onChange={e => setExercise({...exercise, weight: e.target.value})}
                    placeholder="25"
                    className="bg-white"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold">
                <Save className="w-4 h-4 mr-2" /> Save Log
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsLogging(true)} 
          variant="outline" 
          className="w-full border-dashed border-2 border-gray-300 text-gray-500 hover:border-[#0ea5e9] hover:text-[#0ea5e9] h-12"
        >
          <Plus className="w-4 h-4 mr-2" /> Log Extra Exercise
        </Button>
      )}
    </div>
  );
}