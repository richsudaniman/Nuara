
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar, Dumbbell, UtensilsCrossed, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ClientProgress({ clientId }) {
  const { data: workoutLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['clientWorkoutLogs', clientId],
    queryFn: () => base44.entities.WorkoutLog.filter({ logged_by_client_id: clientId }, '-completed_date'),
    initialData: [],
    enabled: !!clientId,
  });

  const { data: calorieLogs, isLoading: calorieLogsLoading } = useQuery({
    queryKey: ['clientCalorieLogs', clientId],
    queryFn: () => base44.entities.CalorieLog.filter({ logged_by_client_id: clientId }, '-date'),
    initialData: [],
    enabled: !!clientId,
  });

  const { data: progressPhotos, isLoading: photosLoading } = useQuery({
    queryKey: ['clientProgressPhotos', clientId],
    queryFn: () => base44.entities.ProgressPhoto.filter({ client_id: clientId }, '-date'),
    initialData: [],
    enabled: !!clientId,
  });

  const { data: progressMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['clientProgressMetrics', clientId],
    queryFn: () => base44.entities.ProgressMetric.filter({ client_id: clientId }, '-date'),
    initialData: [],
    enabled: !!clientId,
  });

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  
  const weeklyWorkouts = workoutLogs.filter(log => new Date(log.completed_date) >= thisWeekStart).length;
  const totalWorkouts = workoutLogs.length;
  
  const recentCalories = calorieLogs.slice(0, 7);
  const avgDailyCalories = recentCalories.length > 0
    ? Math.round(recentCalories.reduce((sum, log) => sum + (log.calories || 0), 0) / recentCalories.length)
    : 0;

  const latestWeight = progressMetrics.find(m => m.metric_type === 'weight');

  const isLoading = logsLoading || calorieLogsLoading || metricsLoading || photosLoading;

  return (
    <div className="space-y-4">
      <h3 className="font-black italic text-[#1a1a1a] text-lg">CLIENT PROGRESS</h3>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-lg bg-gray-100" />)}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-[#0ea5e9]/10 rounded-lg flex items-center justify-center mb-3">
                  <Dumbbell className="w-5 h-5 text-[#0ea5e9]" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">This Week</p>
                <p className="text-3xl font-black italic text-[#1a1a1a]">{weeklyWorkouts}</p>
                <p className="text-xs text-gray-500">workouts</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total</p>
                <p className="text-3xl font-black italic text-[#1a1a1a]">{totalWorkouts}</p>
                <p className="text-xs text-gray-500">workouts</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Avg Daily</p>
                <p className="text-3xl font-black italic text-[#1a1a1a]">{avgDailyCalories}</p>
                <p className="text-xs text-gray-500">calories</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Weight</p>
                <p className="text-3xl font-black italic text-[#1a1a1a]">
                  {latestWeight ? `${latestWeight.value}` : '-'}
                </p>
                <p className="text-xs text-gray-500">{latestWeight?.unit || 'lbs'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Photos */}
          <Card className="bg-white border-2 border-gray-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-[#0ea5e9]" />
                <h4 className="font-black italic text-[#1a1a1a]">PROGRESS PHOTOS</h4>
              </div>
              {progressPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {progressPhotos.slice(0, 6).map(photo => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#0ea5e9] transition-colors">
                      <img 
                        src={photo.photo_url} 
                        alt="Progress" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                        {format(new Date(photo.date), 'MMM d')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 italic">No progress photos yet</div>
              )}
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className="bg-white border-2 border-gray-200">
            <CardContent className="p-5">
              <h4 className="font-black italic text-[#1a1a1a] mb-4">RECENT WORKOUTS</h4>
              {workoutLogs.length > 0 ? (
                <div className="space-y-3">
                  {workoutLogs.slice(0, 10).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 border-l-4 border-[#0ea5e9]">
                      <div>
                        <p className="font-bold italic text-[#1a1a1a] text-sm">{log.exercise_name}</p>
                        {log.sets_completed && (
                          <p className="text-xs text-gray-500">{log.sets_completed} sets completed</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(log.completed_date), 'MMM d')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 italic">No workout logs yet</div>
              )}
            </CardContent>
          </Card>

          {/* Recent Nutrition Logs */}
          <Card className="bg-white border-2 border-gray-200">
            <CardContent className="p-5">
              <h4 className="font-black italic text-[#1a1a1a] mb-4">RECENT NUTRITION</h4>
              {calorieLogs.length > 0 ? (
                <div className="space-y-3">
                  {calorieLogs.slice(0, 10).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 border-l-4 border-orange-500">
                      <div>
                        <p className="font-bold italic text-[#1a1a1a] text-sm">{log.meal_name}</p>
                        <p className="text-xs text-gray-500">{log.meal_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-orange-600 text-lg">{log.calories}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(log.date), 'MMM d')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 italic">No nutrition logs yet</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
