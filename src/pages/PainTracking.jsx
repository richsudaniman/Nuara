import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PainLoggerSlider from "../components/pain/PainLoggerSlider";
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
    <div className="p-5 space-y-5 bg-gradient-to-b from-orange-50/30 to-white min-h-screen">
      {isLoading ? (
        <>
          <Skeleton className="h-96 rounded-lg bg-gray-100" />
          <Skeleton className="h-96 rounded-lg bg-gray-100" />
        </>
      ) : (
        <>
          <PainLoggerSlider
            onLogPain={(data) => logPainMutation.mutate(data)}
            isLoading={logPainMutation.isPending}
          />
          <PainHistory painLogs={painLogs} />
        </>
      )}
    </div>
  );
}