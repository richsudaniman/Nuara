import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PainLoggerSlider from "../components/pain/PainLoggerSlider";
import PainHistory from "../components/pain/PainHistory";
import PostureComparison from "../components/progress/PostureComparison";
import AIPostureScanner from "../components/progress/AIPostureScanner";

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

  const uploadPostureMutation = useMutation({
    mutationFn: async ({ file, photoType }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.ProgressPhoto.create({
        client_id: user.id,
        photo_url: file_url,
        date: new Date().toISOString().split('T')[0],
        view_type: photoType
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

  const handlePostureUpload = async (file, photoType) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image is too large. Maximum size is 10MB');
      return;
    }
    
    try {
      await uploadPostureMutation.mutateAsync({ file, photoType });
    } catch (error) {
      alert('Error uploading photo: ' + error.message);
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

  // Mock therapy goals for demo
  const mockTherapyGoals = [
    {
      id: 1,
      goal_title: "/r/ Sound Production Accuracy",
      current_value: "78% accuracy",
      target_value: "90% accuracy",
      progress_percentage: 78,
      target_date: "2026-03-15",
      linked_metric_type: "articulation_accuracy"
    },
    {
      id: 2,
      goal_title: "Sentence Length & Complexity",
      current_value: "5.2 words average",
      target_value: "7 words average",
      progress_percentage: 65,
      target_date: "2026-04-01",
      linked_metric_type: "sentence_length"
    },
    {
      id: 3,
      goal_title: "Speech Fluency Rate",
      current_value: "82% fluent",
      target_value: "95% fluent",
      progress_percentage: 82,
      target_date: "2026-05-01",
      linked_metric_type: "fluency_rate"
    }
  ];

  // Mock progress data for charts
  const mockArticulationData = [
    { date: 'Dec 5', value: 65 },
    { date: 'Dec 12', value: 68 },
    { date: 'Dec 19', value: 72 },
    { date: 'Dec 26', value: 75 },
    { date: 'Jan 2', value: 78 }
  ];

  const mockSentenceLengthData = [
    { date: 'Dec 5', value: 4.2 },
    { date: 'Dec 12', value: 4.5 },
    { date: 'Dec 19', value: 4.8 },
    { date: 'Dec 26', value: 5.0 },
    { date: 'Jan 2', value: 5.2 }
  ];

  const mockWeeklyPracticeData = [
    { week: 'Nov 11', sessions: 3 },
    { week: 'Nov 18', sessions: 4 },
    { week: 'Nov 25', sessions: 5 },
    { week: 'Dec 2', sessions: 5 },
    { week: 'Dec 9', sessions: 6 },
    { week: 'Dec 16', sessions: 5 },
    { week: 'Dec 23', sessions: 4 },
    { week: 'Dec 30', sessions: 5 }
  ];

  return (
    <div className="p-5 space-y-5 bg-gradient-to-b from-purple-50/30 via-blue-50/20 to-white min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">MY PROGRESS</h1>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-purple-500 to-blue-500 border-none rounded-2xl">
          <CardContent className="p-5">
            <Target className="w-7 h-7 text-white/80 mb-2" />
            <p className="text-xs text-white/80 uppercase font-semibold">This Week</p>
            <p className="text-5xl font-bold text-white mt-2">92%</p>
            <p className="text-xs text-white/70 mt-2">Practice Completion</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-emerald-500 border-none rounded-2xl">
          <CardContent className="p-5">
            <Activity className="w-7 h-7 text-white/80 mb-2" />
            <p className="text-xs text-white/80 uppercase font-semibold">Current Streak</p>
            <p className="text-5xl font-bold text-white mt-2">7</p>
            <p className="text-xs text-white/70 mt-2">Days in a row! 🔥</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Practice Chart */}
      <Card className="bg-white border-purple-100 shadow-sm">
        <CardContent className="p-5">
          <h3 className="font-bold text-gray-900 mb-4">WEEKLY PRACTICE SESSIONS</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockWeeklyPracticeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '11px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '2px solid #8b5cf6',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="sessions" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="goals" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white font-bold text-xs">Goals</TabsTrigger>
          <TabsTrigger value="articulation" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white font-bold text-xs">Sounds</TabsTrigger>
          <TabsTrigger value="language" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white font-bold text-xs">Language</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4 mt-4">
          {mockTherapyGoals.map(goal => {
              const goalLogs = goal.linked_metric_type 
                ? metrics
                    .filter(m => m.metric_type === goal.linked_metric_type)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                : [];

              return (
                <Card key={goal.id} className="bg-white border-2 border-purple-200 hover:border-purple-400 transition-colors rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{goal.goal_title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="text-purple-600 font-bold">{goal.current_value}</span> → <span className="font-bold">{goal.target_value}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 rounded-full shadow-md">
                        <span className="text-white font-black text-lg">{goal.progress_percentage}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${goal.progress_percentage}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        <TabsContent value="articulation" className="space-y-4 mt-4">
          <Card className="bg-white border-purple-100 shadow-sm">
            <CardContent className="p-5">
              <h3 className="font-bold text-gray-900 mb-4">/r/ SOUND ACCURACY PROGRESS</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockArticulationData}>
                  <defs>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #8b5cf6',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAccuracy)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-4 text-center">🎉 Great progress! You've improved <span className="font-bold text-purple-600">13%</span> in the last month!</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-4 mt-4">
          <Card className="bg-white border-blue-100 shadow-sm">
            <CardContent className="p-5">
              <h3 className="font-bold text-gray-900 mb-4">AVERAGE SENTENCE LENGTH</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={mockSentenceLengthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #3b82f6',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-4 text-center">📈 Your sentences are getting longer and more complex! Keep practicing!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}