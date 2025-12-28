import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Camera, Plus, Calendar, AlertCircle, Flame, Target, Dumbbell, UtensilsCrossed, Award, TrendingDown, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import EmptyState from "../components/EmptyState";
import AIInsights from "../components/progress/AIInsights";

export default function Progress() {
  const queryClient = useQueryClient();
  const [selectedMetricType, setSelectedMetricType] = useState("weight");
  const [newMetricValue, setNewMetricValue] = useState("");
  const [newMetricDate, setNewMetricDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['progressMetrics', user?.id],
    queryFn: () => base44.entities.ProgressMetric.filter({ client_id: user.id }, '-date'),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['progressPhotos', user?.id],
    queryFn: () => base44.entities.ProgressPhoto.filter({ client_id: user.id }, '-date'),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: () => base44.entities.FitnessGoal.filter({ assigned_to_client_id: user.id, is_active: true }),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: workoutLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['workoutLogs', user?.id],
    queryFn: () => base44.entities.WorkoutLog.filter({ logged_by_client_id: user.id }, '-completed_date'),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: calorieLogs, isLoading: calorieLogsLoading } = useQuery({
    queryKey: ['calorieLogs', user?.id],
    queryFn: () => base44.entities.CalorieLog.filter({ logged_by_client_id: user.id }, '-created_date'),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const addMetricMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgressMetric.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progressMetrics'] });
      setNewMetricValue("");
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.ProgressPhoto.create({
        client_id: user.id,
        photo_url: file_url,
        date: new Date().toISOString().split('T')[0],
        view_type: "front"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progressPhotos'] });
    },
  });

  const handleAddMetric = async () => {
    if (!newMetricValue || !user?.id) {
      alert("Please enter a value");
      return;
    }

    const value = parseFloat(newMetricValue);
    if (isNaN(value) || value <= 0) {
      alert("Please enter a valid positive number");
      return;
    }
    
    const units = {
      weight: "lbs",
      body_fat: "%",
      muscle_mass: "lbs",
      chest: "inches",
      waist: "inches",
      hips: "inches",
      arms: "inches",
      legs: "inches",
      max_bench: "lbs",
      max_squat: "lbs",
      max_deadlift: "lbs"
    };

    await addMetricMutation.mutateAsync({
      client_id: user.id,
      metric_type: selectedMetricType,
      value: value,
      unit: units[selectedMetricType],
      date: newMetricDate
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      e.target.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image is too large. Maximum size is 10MB');
      e.target.value = '';
      return;
    }
    
    setUploadingPhoto(true);
    try {
      await uploadPhotoMutation.mutateAsync(file);
    } catch (error) {
      alert('Error uploading photo: ' + error.message);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const { data: workoutPlans } = useQuery({
    queryKey: ['workoutPlans', user?.id],
    queryFn: () => base44.entities.WorkoutPlan.filter({ assigned_to_client_id: user.id }),
    initialData: [],
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Calculate dashboard metrics
  const calculateDashboardMetrics = () => {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

    // 1. Weekly Workout Adherence
    const assignedThisWeek = workoutPlans.filter(plan => {
      const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(plan.day_of_week);
      const planDate = new Date(weekStart);
      planDate.setDate(planDate.getDate() + dayIndex);
      return planDate >= weekStart && planDate <= today;
    }).length;

    const completedThisWeek = new Set(
      workoutLogs
        .filter(log => new Date(log.completed_date) >= weekStart && new Date(log.completed_date) <= today)
        .map(log => log.completed_date)
    ).size;

    const workoutAdherence = assignedThisWeek > 0 
      ? Math.min(Math.round((completedThisWeek / assignedThisWeek) * 100), 100)
      : 0;

    // 2. Total Volume (This Week)
    const thisWeekLogs = workoutLogs.filter(log => 
      new Date(log.completed_date) >= weekStart && new Date(log.completed_date) <= today
    );
    const thisWeekVolume = thisWeekLogs.reduce((sum, log) => {
      const weight = log.weight_used || 0;
      const reps = log.reps_completed || 0;
      const sets = log.sets_completed || 1;
      return sum + (weight * reps * sets);
    }, 0);

    // Last week volume for comparison
    const lastWeekStart = subDays(weekStart, 7);
    const lastWeekLogs = workoutLogs.filter(log => 
      new Date(log.completed_date) >= lastWeekStart && new Date(log.completed_date) < weekStart
    );
    const lastWeekVolume = lastWeekLogs.reduce((sum, log) => {
      const weight = log.weight_used || 0;
      const reps = log.reps_completed || 0;
      const sets = log.sets_completed || 1;
      return sum + (weight * reps * sets);
    }, 0);

    const volumeChange = lastWeekVolume > 0 
      ? Math.round(((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100)
      : 0;

    // 3. 7-Day Nutrition Consistency
    const calorieTarget = user?.daily_calorie_target || 2200;
    const buffer = Math.round(calorieTarget * 0.1); // 10% buffer
    
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(today, i).toISOString().split('T')[0];
      const dayLogs = calorieLogs.filter(log => log.date === date);
      const dayCalories = dayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      const onTarget = dayCalories >= (calorieTarget - buffer) && dayCalories <= (calorieTarget + buffer);
      last7Days.push({ date, onTarget });
    }

    const daysOnTarget = last7Days.filter(d => d.onTarget).length;
    const nutritionConsistency = Math.round((daysOnTarget / 7) * 100);

    return {
      workoutAdherence,
      assignedThisWeek,
      completedThisWeek,
      thisWeekVolume: Math.round(thisWeekVolume),
      volumeChange,
      nutritionConsistency,
      daysOnTarget,
    };
  };

  // Get weekly workout data for chart
  const getWeeklyWorkoutData = () => {
    const last8Weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = endOfWeek(weekStart);
      
      const workoutsInWeek = workoutLogs.filter(log => {
        const logDate = new Date(log.completed_date);
        return logDate >= weekStart && logDate <= weekEnd;
      }).length;

      last8Weeks.push({
        week: format(weekStart, 'MMM d'),
        workouts: workoutsInWeek,
      });
    }
    return last8Weeks;
  };

  const getChartData = (metricType) => {
    return metrics
      .filter(m => m.metric_type === metricType)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(m => ({
        date: format(new Date(m.date), 'MMM d'),
        value: m.value
      }));
  };

  const metricTypes = [
    { value: "weight", label: "Weight", icon: TrendingUp },
    { value: "body_fat", label: "Body Fat %", icon: TrendingUp },
    { value: "muscle_mass", label: "Muscle Mass", icon: TrendingUp },
    { value: "chest", label: "Chest", icon: TrendingUp },
    { value: "waist", label: "Waist", icon: TrendingUp },
    { value: "arms", label: "Arms", icon: TrendingUp },
    { value: "max_bench", label: "Max Bench", icon: TrendingUp },
    { value: "max_squat", label: "Max Squat", icon: TrendingUp },
    { value: "max_deadlift", label: "Max Deadlift", icon: TrendingUp },
  ];

  const isLoading = metricsLoading || photosLoading || goalsLoading || logsLoading || calorieLogsLoading;
  const dashboardMetrics = calculateDashboardMetrics();
  const weeklyWorkoutData = getWeeklyWorkoutData();

  return (
    <div className="p-5 space-y-5 relative overscroll-contain touch-pan-y">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#06b6d4] rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Your Progress</h1>
      </div>

      {/* Dashboard Overview */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-lg bg-gray-100" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Card className="bg-gradient-to-br from-[#0ea5e9] to-blue-600 border-none rounded-2xl">
              <CardContent className="p-3">
                <Target className="w-6 h-6 text-white/80 mb-1" />
                <p className="text-[10px] text-white/80 uppercase font-semibold">Workout Adherence</p>
                <p className="text-5xl font-bold text-white mt-1">{dashboardMetrics.workoutAdherence}%</p>
                <p className="text-[10px] text-white/70 mt-1">{dashboardMetrics.completedThisWeek}/{dashboardMetrics.assignedThisWeek} workouts</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-none rounded-2xl">
              <CardContent className="p-3">
                <Dumbbell className="w-6 h-6 text-white/80 mb-1" />
                <p className="text-[10px] text-white/80 uppercase font-semibold">Total Volume</p>
                <p className="text-5xl font-bold text-white mt-1">{(dashboardMetrics.thisWeekVolume / 1000).toFixed(1)}k</p>
                <p className="text-[10px] text-white/70 mt-1">
                  {dashboardMetrics.volumeChange > 0 ? '+' : ''}{dashboardMetrics.volumeChange}% vs last week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-none rounded-2xl col-span-2">
              <CardContent className="p-3">
                <UtensilsCrossed className="w-6 h-6 text-white/80 mb-1" />
                <p className="text-[10px] text-white/80 uppercase font-semibold">Nutrition Consistency</p>
                <p className="text-5xl font-bold text-white mt-1">{dashboardMetrics.nutritionConsistency}%</p>
                <p className="text-[10px] text-white/70 mt-1">{dashboardMetrics.daysOnTarget}/7 days on target</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Workout Chart */}
          {weeklyWorkoutData.some(d => d.workouts > 0) && (
            <Card className="bg-white border-2 border-gray-200">
              <CardContent className="p-5">
                <h3 className="font-black italic text-[#1a1a1a] mb-4">WEEKLY WORKOUT CONSISTENCY</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyWorkoutData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #0ea5e9',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="workouts" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {!isLoading && workoutLogs.length > 0 && (
            <AIInsights
              workoutLogs={workoutLogs}
              calorieLogs={calorieLogs}
              metrics={metrics}
              goals={goals}
              user={user}
            />
          )}
        </>
      )}

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="metrics" className="data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white font-bold italic">Metrics</TabsTrigger>
          <TabsTrigger value="photos" className="data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white font-bold italic">Photos</TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white font-bold italic">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4 mt-4">
          {/* Add New Metric */}
          <Card className="bg-white border-2 border-[#0ea5e9]/30 glow-blue">
            <CardContent className="p-5">
              <h3 className="font-black italic text-[#1a1a1a] mb-4">LOG NEW METRIC</h3>
              <div className="space-y-3">
                <Select value={selectedMetricType} onValueChange={setSelectedMetricType}>
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder="Value"
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(e.target.value)}
                    className="bg-white border-gray-300"
                    min="0"
                    step="0.1"
                  />
                  <Input
                    type="date"
                    value={newMetricDate}
                    onChange={(e) => setNewMetricDate(e.target.value)}
                    className="bg-white border-gray-300"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <Button
                  onClick={handleAddMetric}
                  disabled={addMetricMutation.isPending || !newMetricValue}
                  className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic glow-blue"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {addMetricMutation.isPending ? "ADDING..." : "ADD METRIC"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          {isLoading ? (
            <Skeleton className="h-96 rounded-lg bg-gray-100" />
          ) : metrics.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No Metrics Yet"
              description="Start tracking your progress by logging your first measurement above!"
              variant="info"
            />
          ) : (
            metricTypes.map(type => {
              const chartData = getChartData(type.value);
              if (chartData.length === 0) return null;

              return (
                <Card key={type.value} className="bg-white border border-gray-200 hover:border-[#0ea5e9] transition-colors">
                  <CardContent className="p-5">
                    <h3 className="font-black italic text-[#1a1a1a] mb-4">{type.label}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '2px solid #0ea5e9',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0ea5e9" 
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                          dot={{ fill: '#0ea5e9', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-600">
                        Current: <span className="font-black italic text-[#0ea5e9] text-lg">{chartData[chartData.length - 1]?.value}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="photos" className="space-y-4 mt-4">
          {/* Upload Photo */}
          <Card className="bg-white border-2 border-[#0ea5e9]/30 glow-blue">
            <CardContent className="p-5">
              <h3 className="font-black italic text-[#1a1a1a] mb-4">UPLOAD PROGRESS PHOTO</h3>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                <Button
                  as="span"
                  disabled={uploadingPhoto}
                  className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic glow-blue cursor-pointer"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {uploadingPhoto ? "UPLOADING..." : "CHOOSE PHOTO"}
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2 text-center">Max size: 10MB • Formats: JPG, PNG, HEIC</p>
            </CardContent>
          </Card>

          {/* Photo Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-lg bg-gray-100" />)}
            </div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {photos.map(photo => (
                <Card key={photo.id} className="bg-white border border-gray-200 overflow-hidden hover:border-[#0ea5e9] transition-colors">
                  <div className="aspect-square relative">
                    <img 
                      src={photo.photo_url} 
                      alt="Progress" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3 text-[#0ea5e9]" />
                      <span className="font-semibold">{format(new Date(photo.date), 'MMM d, yyyy')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Camera}
              title="No Progress Photos Yet"
              description="Start tracking your transformation by uploading your first photo!"
              variant="info"
            />
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-4">
          {isLoading ? (
            <Skeleton className="h-64 rounded-lg bg-gray-100" />
          ) : goals.length > 0 ? (
            goals.map(goal => (
              <Card key={goal.id} className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-colors">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black italic text-[#1a1a1a] text-xl">{goal.goal_title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="text-[#0ea5e9] font-bold">{goal.current_value}</span> → <span className="font-bold">{goal.target_value}</span>
                      </p>
                      {goal.target_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="bg-[#0ea5e9] px-3 py-1 rounded-full">
                      <span className="text-white font-black italic">{goal.progress_percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0ea5e9] transition-all duration-300"
                      style={{ width: `${goal.progress_percentage}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No Active Goals"
              description="Your trainer will set personalized goals for you to help track your progress!"
              variant="info"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}