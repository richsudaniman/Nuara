import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns aggregated Phase 1 admin metrics:
// practice-wide overview, clinician utilization, and caseload distribution.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user;
    try {
      user = await base44.auth.me();
    } catch {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;

    const [allUsers, assignments, logs, plans] = await Promise.all([
      svc.entities.User.list('-created_date', 2000),
      svc.entities.PractitionerPatientAssignment.filter({ is_active: true }),
      svc.entities.TherapyLog.list('-completed_date', 5000),
      svc.entities.TherapyPlan.list('-created_date', 5000),
    ]);

    const trainers = allUsers.filter((u) => u.role === 'trainer' || u.user_type === 'trainer');
    const clients = allUsers.filter(
      (u) => (u.role === 'user' || !u.role) && u.user_type !== 'trainer'
    );

    const activeClients = clients.filter((c) => (c.client_status || 'active') === 'active');
    const waitlistClients = clients.filter((c) => c.client_status === 'waitlist');
    const onHoldClients = clients.filter((c) => c.client_status === 'on_hold');
    const dischargedClients = clients.filter((c) => c.client_status === 'discharged');

    // Date helpers (UTC-based date strings, matching how logs store completed_date)
    const today = new Date();
    const dateStr = (d) => d.toISOString().split('T')[0];
    const daysAgo = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d;
    };

    const last7 = Array.from({ length: 7 }, (_, i) => dateStr(daysAgo(6 - i)));
    const last30Start = dateStr(daysAgo(29));
    const prev7 = Array.from({ length: 7 }, (_, i) => dateStr(daysAgo(13 - i)));

    const activeClientIds = new Set(activeClients.map((c) => c.id));
    const logsThisWeek = logs.filter((l) => last7.includes(l.completed_date));
    const logsPrevWeek = logs.filter((l) => prev7.includes(l.completed_date));
    const logsThisMonth = logs.filter((l) => l.completed_date >= last30Start);

    // Compliance = % of active clients who logged at least one activity in the window
    const compliance = (logSet) => {
      if (activeClients.length === 0) return 0;
      const engaged = new Set(
        logSet.filter((l) => activeClientIds.has(l.logged_by_client_id)).map((l) => l.logged_by_client_id)
      ).size;
      return Math.round((engaged / activeClients.length) * 100);
    };

    const weeklyCompliance = compliance(logsThisWeek);
    const prevWeeklyCompliance = compliance(logsPrevWeek);
    const monthlyCompliance = compliance(logsThisMonth);

    // Weekly compliance trend (engaged active clients per day)
    const weeklyTrend = last7.map((ds) => {
      const dayLogs = logs.filter((l) => l.completed_date === ds);
      const engaged = new Set(
        dayLogs.filter((l) => activeClientIds.has(l.logged_by_client_id)).map((l) => l.logged_by_client_id)
      ).size;
      const d = new Date(ds + 'T00:00:00');
      return {
        date: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
        engaged,
        completions: dayLogs.length,
      };
    });

    // Per-clinician utilization
    const assignmentsByTrainer = {};
    assignments.forEach((a) => {
      if (!assignmentsByTrainer[a.trainer_id]) assignmentsByTrainer[a.trainer_id] = [];
      assignmentsByTrainer[a.trainer_id].push(a.client_id);
    });

    const plansByTrainer = {};
    plans.forEach((p) => {
      const t = p.created_by_trainer_id;
      if (!t) return;
      plansByTrainer[t] = (plansByTrainer[t] || 0) + 1;
    });

    const clinicianUtilization = trainers.map((t) => {
      const caseload = assignmentsByTrainer[t.id] || [];
      const caseloadSet = new Set(caseload);
      const caseActive = caseload.filter((cid) => activeClientIds.has(cid));
      // Compliance avg for this clinician's active clients (logged this week)
      const engagedThisWeek = new Set(
        logsThisWeek
          .filter((l) => caseloadSet.has(l.logged_by_client_id) && activeClientIds.has(l.logged_by_client_id))
          .map((l) => l.logged_by_client_id)
      ).size;
      const complianceAvg =
        caseActive.length > 0 ? Math.round((engagedThisWeek / caseActive.length) * 100) : 0;
      return {
        id: t.id,
        name: t.full_name || t.email,
        caseloadSize: caseload.length,
        activeCaseload: caseActive.length,
        homeworkPlans: plansByTrainer[t.id] || 0,
        complianceAvg,
      };
    }).sort((a, b) => b.caseloadSize - a.caseloadSize);

    // Caseload distribution by clinician (name -> count)
    const caseloadByClinician = clinicianUtilization
      .filter((c) => c.caseloadSize > 0)
      .map((c) => ({ name: c.name, value: c.caseloadSize }));

    // By clinical category
    const categoryCounts = {};
    activeClients.forEach((c) => {
      const cat = c.clinical_category || c.therapy_focus?.toLowerCase() || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const caseloadByCategory = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    // By age band
    const ageBands = { '0–5': 0, '6–9': 0, '10–13': 0, '14–17': 0, '18+': 0, Unknown: 0 };
    activeClients.forEach((c) => {
      const age = Number(c.age);
      if (!age || Number.isNaN(age)) ageBands['Unknown']++;
      else if (age <= 5) ageBands['0–5']++;
      else if (age <= 9) ageBands['6–9']++;
      else if (age <= 13) ageBands['10–13']++;
      else if (age <= 17) ageBands['14–17']++;
      else ageBands['18+']++;
    });
    const caseloadByAge = Object.entries(ageBands).map(([name, value]) => ({ name, value }));

    // Average tenure (days) for active clients with an activated_date or created_date
    const tenures = activeClients
      .map((c) => {
        const start = c.activated_date || c.created_date;
        if (!start) return null;
        return Math.max(0, Math.round((today - new Date(start)) / (1000 * 60 * 60 * 24)));
      })
      .filter((v) => v !== null);
    const avgTenureDays =
      tenures.length > 0 ? Math.round(tenures.reduce((a, b) => a + b, 0) / tenures.length) : 0;

    // Engagement rate = completions this week vs assigned activities (active plans * approx)
    const assignedActivityCount = plans.reduce(
      (sum, p) => sum + (Array.isArray(p.exercises) ? p.exercises.length : 0),
      0
    );
    const engagementRate =
      assignedActivityCount > 0
        ? Math.min(100, Math.round((logsThisWeek.length / assignedActivityCount) * 100))
        : 0;

    return Response.json({
      overview: {
        activeClients: activeClients.length,
        totalClients: clients.length,
        activeClinicians: trainers.length,
        weeklyCompliance,
        prevWeeklyCompliance,
        monthlyCompliance,
        engagementRate,
        completionsThisWeek: logsThisWeek.length,
        completionsPrevWeek: logsPrevWeek.length,
      },
      weeklyTrend,
      clinicianUtilization,
      caseload: {
        active: activeClients.length,
        onHold: onHoldClients.length,
        discharged: dischargedClients.length,
        waitlist: waitlistClients.length,
        avgTenureDays,
        byClinician: caseloadByClinician,
        byCategory: caseloadByCategory,
        byAge: caseloadByAge,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});