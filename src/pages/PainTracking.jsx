import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PainLogger from "../components/pain/PainLogger";
import PainHistory from "../components/pain/PainHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function PainTracking() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: painLogs = [], isLoading } = useQuery({
    queryKey: ['painLogs', user?.id],
    queryFn: () => base44.entities.PainLog.filter({ patient_id: user.id }, '-date'),
    enabled: !!user?.id,
    initialData: [],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const logPainMutation = useMutation({
    mutationFn: (painData) => base44.entities.PainLog.create({
      ...painData,
      patient_id: user.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painLogs'] });
    },
  });

  return (
    <div className="p-5 space-y-5 relative overscroll-contain touch-pan-y">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Pain Tracking</h1>
      </div>

      {isLoading ? (
        <>
          <Skeleton className="h-48 rounded-lg bg-gray-100" />
          <Skeleton className="h-96 rounded-lg bg-gray-100" />
        </>
      ) : (
        <>
          <PainLogger 
            onLogPain={(data) => logPainMutation.mutate(data)}
            isLoading={logPainMutation.isPending}
          />
          <PainHistory painLogs={painLogs} />
        </>
      )}
    </div>
  );
}