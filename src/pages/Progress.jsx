import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PainLoggerSlider from "../components/pain/PainLoggerSlider";
import PainHistory from "../components/pain/PainHistory";

function PainTrackingSection({ userId }) {
  const queryClient = useQueryClient();
  
  const { data: painLogs, isLoading } = useQuery({
    queryKey: ['painLogs', userId],
    queryFn: () => base44.entities.PainLog.filter({ patient_id: userId }, '-date'),
    initialData: [],
    enabled: !!userId,
  });

  const logPainMutation = useMutation({
    mutationFn: (data) => base44.entities.PainLog.create({ ...data, patient_id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painLogs'] });
    },
  });

  if (isLoading) return <div>Loading pain data...</div>;

  return (
    <>
      <PainLoggerSlider
        onLogPain={(data) => logPainMutation.mutate(data)}
        isLoading={logPainMutation.isPending}
      />
      <PainHistory painLogs={painLogs} />
    </>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Camera, Plus, Calendar, AlertCircle, Target, Activity, TrendingDown } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, startOfWeek, endOfWeek, differenceInCalendarDays } from "date-fns";
import EmptyState from "../components/EmptyState";


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
    queryFn: async () => {
      // Try new RecoveryGoal first
      try {
        const recoveryGoals = await base44.entities.RecoveryGoal.filter({ assigned_to_patient_id: user.id, is_active: true });
        if (recoveryGoals.length > 0) return recoveryGoals;
      } catch (e) {
        console.log('RecoveryGoal not available, falling back to FitnessGoal');
      }
      // Fallback to old FitnessGoal
      return await base44.entities.FitnessGoal.filter({ assigned_to_client_id: user.id, is_active: true });
    },
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
      range_of_motion: "degrees",
      flexibility_score: "score",
      strength_test: "score",
      balance_score: "score",
      pain_score: "score",
      functional_capacity: "score"
    };

    // Add the metric
    await addMetricMutation.mutateAsync({
      client_id: user.id,
      metric_type: selectedMetricType,
      value: value,
      unit: units[selectedMetricType],
      date: newMetricDate
    });

    // Check if there's a linked goal and update it
    try {
      const linkedGoal = goals.find(g => g.linked_metric_type === selectedMetricType && g.is_active);
      if (linkedGoal) {
        let updates = { current_value: `${value} ${units[selectedMetricType]}` };
        await base44.entities.RecoveryGoal.update(linkedGoal.id, updates);
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      }
    } catch (err) {
      // Fallback to FitnessGoal if RecoveryGoal doesn't exist yet
      try {
        const linkedGoal = goals.find(g => g.linked_metric_type === selectedMetricType && g.is_active);
        if (linkedGoal) {
          let updates = { current_value: `${value} ${units[selectedMetricType]}` };
          await base44.entities.FitnessGoal.update(linkedGoal.id, updates);
          queryClient.invalidateQueries({ queryKey: ['goals'] });
        }
      } catch (err2) {
        console.error("Failed to update linked goal", err2);
      }
    }
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
    queryFn: async () => {
      // Try new RehabilitationProgram first
      try {
        const programs = await base44.entities.RehabilitationProgram.filter({ assigned_to_patient_id: user.id });
        if (programs.length > 0) return programs;
      } catch (e) {}
      // Fallback to old WorkoutPlan
      return await base44.entities.WorkoutPlan.filter({ assigned_to_client_id: user.id });
    },
    initialData: [],
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Calculate dashboard metrics
  const calculateDashboardMetrics = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

    // 1. Weekly Workout Adherence
    const assignedThisWeek = workoutPlans.filter(plan => {
      const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(plan.day_of_week);
      const planDate = new Date(weekStart);
      planDate.setDate(planDate.getDate() + dayIndex);
      return planDate <= today;
    }).length;

    const completedThisWeek = new Set(
      workoutLogs
        .filter(log => new Date(log.completed_date) >= weekStart && new Date(log.completed_date) <= today)
        .map(log => log.completed_date)
    ).size;

    const workoutAdherence = assignedThisWeek > 0 
      ? Math.min(Math.round((completedThisWeek / assignedThisWeek) * 100), 100)
      : 100;

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

    // 3. Pain Management (This Week)
    const daysElapsed = differenceInCalendarDays(today, weekStart) + 1;
    const daysToCheck = Math.max(1, Math.min(daysElapsed, 7));

    return {
      workoutAdherence,
      assignedThisWeek,
      completedThisWeek,
      thisWeekVolume: Math.round(thisWeekVolume),
      volumeChange
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
    { value: "range_of_motion", label: "Range of Motion", icon: TrendingUp },
    { value: "flexibility_score", label: "Flexibility Score", icon: TrendingUp },
    { value: "strength_test", label: "Strength Test", icon: TrendingUp },
    { value: "balance_score", label: "Balance Score", icon: TrendingDown },
    { value: "pain_score", label: "Pain Score", icon: TrendingDown },
    { value: "functional_capacity", label: "Functional Capacity", icon: TrendingUp },
  ];

  const isLoading = metricsLoading || photosLoading || goalsLoading || logsLoading;
  const dashboardMetrics = calculateDashboardMetrics();
  const weeklyWorkoutData = getWeeklyWorkoutData();

  return (
    <div className="p-5 space-y-5 bg-gradient-to-b from-teal-50/30 to-white min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">YOUR PROGRESS</h1>

      {/* Dashboard Overview */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-lg bg-gray-100" />)}
        </div>
      ) : (
        <>
          <Card className="bg-gradient-to-br from-teal-500 to-emerald-500 border-none rounded-2xl">
            <CardContent className="p-4">
              <Target className="w-7 h-7 text-white/80 mb-2" />
              <p className="text-xs text-white/80 uppercase font-semibold">Exercise Completion</p>
              <p className="text-5xl font-bold text-white mt-2">{dashboardMetrics.workoutAdherence}%</p>
              <p className="text-xs text-white/70 mt-2">{dashboardMetrics.completedThisWeek}/{dashboardMetrics.assignedThisWeek} exercises this week</p>
            </CardContent>
          </Card>

          {/* Weekly Exercise Chart */}
          {weeklyWorkoutData.some(d => d.workouts > 0) && (
            <Card className="bg-white border-teal-100">
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 mb-4">WEEKLY EXERCISE ACTIVITY</h3>
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
                    <Bar dataKey="workouts" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}


        </>
      )}

      <Tabs defaultValue="pain" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100">
          <TabsTrigger value="pain" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white font-bold">Pain</TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white font-bold">Metrics</TabsTrigger>
          <TabsTrigger value="photos" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white font-bold">Photos</TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white font-bold">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="pain" className="space-y-4 mt-4">
          {/* Pain Logs Section */}
          <PainTrackingSection userId={user?.id} />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4 mt-4">
          {/* Add New Metric */}
          <Card id="metric-form" className="bg-white border-teal-100">
            <CardContent className="p-5">
              <h3 className="font-bold text-gray-900 mb-4">LOG NEW METRIC</h3>
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
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {addMetricMutation.isPending ? "Adding..." : "Add Metric"}
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
              <div className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                  ref={fileInputRef}
                />
                <Button
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-black italic glow-blue cursor-pointer"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {uploadingPhoto ? "UPLOADING..." : "CHOOSE PHOTO"}
                </Button>
              </div>
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
            goals.map(goal => {
              const goalLogs = goal.linked_metric_type 
                ? metrics
                    .filter(m => m.metric_type === goal.linked_metric_type)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                : [];

              return (
                <Card key={goal.id} className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-colors">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black italic text-[#1a1a1a] text-xl">{goal.goal_title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="text-[#0ea5e9] font-bold">{goal.current_value || 'Start'}</span> → <span className="font-bold">{goal.target_value}</span>
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
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                      <div 
                        className="h-full bg-[#0ea5e9] transition-all duration-300"
                        style={{ width: `${goal.progress_percentage}%` }}
                      ></div>
                    </div>

                    {/* Goal History & Actions */}
                    {goal.linked_metric_type && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Logs</h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs font-bold text-[#0ea5e9] hover:bg-blue-50 px-2"
                            onClick={() => {
                              setSelectedMetricType(goal.linked_metric_type);
                              document.querySelector('[value="metrics"]').click(); // Switch to metrics tab
                              setTimeout(() => {
                                document.getElementById('metric-form')?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Log Progress
                          </Button>
                        </div>
                        
                        {goalLogs.length > 0 ? (
                          <div className="space-y-2">
                            {goalLogs.map((log, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                <span className="text-gray-500 font-medium">{format(new Date(log.date), 'MMM d')}</span>
                                <span className="font-bold text-gray-900">{log.value} <span className="text-xs font-normal text-gray-500">{log.unit}</span></span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <p className="text-xs text-gray-400 italic">No logs recorded yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
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