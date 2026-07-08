import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarClock, Bell, Stethoscope, Save, Loader2, Check, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import SettingsSection from "@/components/settings/SettingsSection";
import ToggleRow from "@/components/settings/ToggleRow";
import CategoryChips from "@/components/settings/CategoryChips";

const DEFAULTS = {
  practice_name: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  timezone: "America/Toronto",
  default_session_duration: 30,
  default_sessions_per_week: 2,
  compliance_target: 80,
  waitlist_auto_reminders: true,
  parent_progress_emails: true,
  low_compliance_alerts: true,
  clinical_categories: ["articulation", "language", "fluency", "voice", "listening", "social", "cognitive"],
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState(DEFAULTS);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["practiceSettings"],
    queryFn: async () => {
      const rows = await base44.entities.PracticeSettings.list("-created_date", 1);
      return rows[0] || null;
    },
  });

  useEffect(() => {
    if (settings) setForm({ ...DEFAULTS, ...settings });
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (settings?.id) {
        return base44.entities.PracticeSettings.update(settings.id, payload);
      }
      return base44.entities.PracticeSettings.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practiceSettings"] });
      toast({ title: "Settings saved", description: "Your practice settings have been updated." });
    },
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    const { id, created_date, updated_date, created_by_id, ...payload } = form;
    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[900px] mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px] mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Practice settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure clinic details, session defaults, and notifications</p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-[#A78BFA] hover:bg-[#7c5cd6] text-white rounded-lg font-bold gap-2">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save changes
        </Button>
      </div>

      {/* Clinic profile */}
      <SettingsSection icon={Building2} title="Clinic profile" description="Basic information about your practice" color="#A78BFA">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-gray-600">Practice name</Label>
            <Input value={form.practice_name} onChange={(e) => set("practice_name", e.target.value)} placeholder="e.g. SLP-tec Speech Clinic" className="mt-1.5 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Contact email</Label>
            <Input value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} placeholder="hello@clinic.com" className="mt-1.5 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Contact phone</Label>
            <Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="(555) 123-4567" className="mt-1.5 rounded-lg" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs font-semibold text-gray-600">Address</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St, Toronto, ON" className="mt-1.5 rounded-lg" />
          </div>
        </div>
      </SettingsSection>

      {/* Session defaults */}
      <SettingsSection icon={CalendarClock} title="Session defaults" description="Defaults applied to new clients and scheduling" color="#60A5FA">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-semibold text-gray-600">Session duration (min)</Label>
            <Input type="number" value={form.default_session_duration} onChange={(e) => set("default_session_duration", parseInt(e.target.value) || 0)} className="mt-1.5 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Sessions per week</Label>
            <Input type="number" value={form.default_sessions_per_week} onChange={(e) => set("default_sessions_per_week", parseInt(e.target.value) || 0)} className="mt-1.5 rounded-lg" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Compliance target (%)</Label>
            <Input type="number" value={form.compliance_target} onChange={(e) => set("compliance_target", parseInt(e.target.value) || 0)} className="mt-1.5 rounded-lg" />
          </div>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection icon={Bell} title="Notifications" description="Automated reminders and progress communications" color="#34D399">
        <div>
          <ToggleRow
            label="Waitlist engagement reminders"
            description="Automatically nudge waitlisted families to keep practicing"
            checked={form.waitlist_auto_reminders}
            onCheckedChange={(v) => set("waitlist_auto_reminders", v)}
          />
          <ToggleRow
            label="Parent progress emails"
            description="Send weekly progress summaries to parents and guardians"
            checked={form.parent_progress_emails}
            onCheckedChange={(v) => set("parent_progress_emails", v)}
          />
          <ToggleRow
            label="Low-compliance alerts"
            description="Alert clinicians when a client falls below the compliance target"
            checked={form.low_compliance_alerts}
            onCheckedChange={(v) => set("low_compliance_alerts", v)}
          />
        </div>
      </SettingsSection>

      {/* Clinical categories */}
      <SettingsSection icon={Stethoscope} title="Clinical categories" description="Areas of focus offered by your practice" color="#F472B6">
        <CategoryChips selected={form.clinical_categories} onChange={(v) => set("clinical_categories", v)} />
      </SettingsSection>

      {/* Export */}
      <SettingsSection icon={Download} title="Data Export" description="Export all application data as SQL statements compatible with PostgreSQL" color="#6366F1">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <h3 className="font-semibold text-gray-900">PostgreSQL Export</h3>
            <p className="text-sm text-gray-500">Download a full SQL dump with CREATE and INSERT statements</p>
          </div>
          <Button 
            onClick={async () => {
              try {
                toast({ title: "Starting export", description: "Your SQL export is being generated." });
                const res = await base44.functions.invoke('exportToSql');
                const blob = new Blob([res.data], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'base44_export.sql';
                a.click();
                window.URL.revokeObjectURL(url);
                toast({ title: "Export complete", description: "Your SQL file has been downloaded." });
              } catch (err) {
                toast({ title: "Export failed", description: err.message, variant: "destructive" });
              }
            }}
            variant="outline" 
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export SQL
          </Button>
        </div>
      </SettingsSection>

      {/* Bottom save */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-[#A78BFA] hover:bg-[#7c5cd6] text-white rounded-lg font-bold gap-2">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}