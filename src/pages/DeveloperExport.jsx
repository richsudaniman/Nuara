import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Database, Download, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

export default function DeveloperExport() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await base44.functions.invoke("exportToPostgres", {});
      const blob = new Blob([response.data], { type: "application/sql" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "base44_postgres_export.sql";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Export successful", description: "Your SQL export has been downloaded." });
    } catch (error) {
      toast({ title: "Export failed", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[760px] mx-auto px-6 py-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="w-full max-w-[760px] mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
        <h1 className="text-lg font-bold text-gray-900">Restricted area</h1>
        <p className="text-sm text-gray-500 mt-1">This developer tool is not available for your account.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[760px] mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Database className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer tools</h1>
          <p className="text-sm text-gray-500">Internal data export utilities</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900">PostgreSQL export</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-lg">
          Download all application data as SQL statements compatible with Supabase and PostgreSQL,
          including table definitions and foreign key constraints.
        </p>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="mt-5 gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export SQL
        </Button>
      </div>
    </div>
  );
}