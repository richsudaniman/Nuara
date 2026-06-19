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

    const [allUsers, assignments, logs, plans, goals, messages] = await Promise.all([
      svc.entities.User.list('-created_date', 2000),
      svc.entities.PractitionerPatientAssignment.filter({ is_active: true }),
      svc.entities.TherapyLog.list('-completed_date', 5000),
      svc.entities.TherapyPlan.list('-created_date', 5000),
      svc.entities.TherapyGoal.list('-created_date', 5000),
      svc.entities.ChatMessage.list('-created_date', 5000),
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

    // ===== Phase 2: Waitlist =====
    const waitlistActiveIds = new Set(
      logs.filter((l) => waitlistClients.some((w) => w.id === l.logged_by_client_id)).map((l) => l.logged_by_client_id)
    );
    const waitlistActive = waitlistClients.filter((w) => waitlistActiveIds.has(w.id)).length;

    // Conversion: clients who joined a waitlist and later activated
    const everWaitlisted = clients.filter((c) => c.waitlist_joined_date);
    const converted = clients.filter((c) => c.waitlist_joined_date && c.activated_date);
    const conversionRate =
      everWaitlisted.length > 0 ? Math.round((converted.length / everWaitlisted.length) * 100) : 0;

    const convTimes = converted
      .map((c) => Math.round((new Date(c.activated_date) - new Date(c.waitlist_joined_date)) / (1000 * 60 * 60 * 24)))
      .filter((v) => !Number.isNaN(v) && v >= 0);
    const avgWaitlistDays =
      convTimes.length > 0 ? Math.round(convTimes.reduce((a, b) => a + b, 0) / convTimes.length) : 0;

    const waitlistEngagementRate =
      waitlistClients.length > 0 ? Math.round((waitlistActive / waitlistClients.length) * 100) : 0;

    // ===== Phase 2: Outcomes & clinical reporting =====
    const activeGoals = goals.filter((g) => g.is_active !== false);
    const onTrackGoals = activeGoals.filter((g) => Number(g.progress_percentage) >= 50).length;
    const flaggedGoals = activeGoals.filter((g) => Number(g.progress_percentage) < 50).length;
    const metGoals = goals.filter((g) => Number(g.progress_percentage) >= 100).length;
    const goalAttainmentRate =
      goals.length > 0 ? Math.round((metGoals / goals.length) * 100) : 0;

    // Avg treatment duration for discharged clients
    const treatmentDurations = dischargedClients
      .map((c) => {
        const start = c.activated_date || c.created_date;
        const end = c.discharged_date;
        if (!start || !end) return null;
        return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
      })
      .filter((v) => v !== null && v >= 0);
    const avgTreatmentDays =
      treatmentDurations.length > 0
        ? Math.round(treatmentDurations.reduce((a, b) => a + b, 0) / treatmentDurations.length)
        : 0;

    const dischargeReasonCounts = {};
    dischargedClients.forEach((c) => {
      const reason = c.discharge_reason || 'Unspecified';
      dischargeReasonCounts[reason] = (dischargeReasonCounts[reason] || 0) + 1;
    });
    const dischargeReasons = Object.entries(dischargeReasonCounts).map(([name, value]) => ({ name, value }));

    // Most common clinical targets (from goal metric types / categories)
    const targetCounts = {};
    activeClients.forEach((c) => {
      const t = c.clinical_category || c.therapy_focus?.toLowerCase() || 'other';
      targetCounts[t] = (targetCounts[t] || 0) + 1;
    });
    const commonTargets = Object.entries(targetCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // ===== Phase 2: Family engagement =====
    const activeFamilyIds = new Set(logsThisWeek.map((l) => l.logged_by_client_id));
    const activeFamilies = activeClients.filter((c) => activeFamilyIds.has(c.id)).length;
    const inactiveFamilies = activeClients.length - activeFamilies;

    // Parent message response rate: inbound parent messages that got a reply
    const parentMsgs = messages.filter((m) => clients.some((c) => c.id === m.sender_id));
    const repliedThreads = new Set();
    parentMsgs.forEach((pm) => {
      const replied = messages.some(
        (m) => m.receiver_id === pm.sender_id && new Date(m.created_date) > new Date(pm.created_date)
      );
      if (replied) repliedThreads.add(pm.sender_id);
    });
    const parentSenders = new Set(parentMsgs.map((m) => m.sender_id));
    const parentResponseRate =
      parentSenders.size > 0 ? Math.round((repliedThreads.size / parentSenders.size) * 100) : 0;

    // Net engagement score: blend of active families + weekly compliance + parent response
    const netEngagementScore = Math.round(
      ((activeClients.length > 0 ? (activeFamilies / activeClients.length) * 100 : 0) * 0.5) +
        weeklyCompliance * 0.3 +
        parentResponseRate * 0.2
    );

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
      waitlist: {
        total: waitlistClients.length,
        active: waitlistActive,
        inactive: waitlistClients.length - waitlistActive,
        conversionRate,
        avgWaitlistDays,
        engagementRate: waitlistEngagementRate,
        convertedCount: converted.length,
      },
      outcomes: {
        goalAttainmentRate,
        onTrackGoals,
        flaggedGoals,
        metGoals,
        totalGoals: goals.length,
        avgTreatmentDays,
        dischargeCount: dischargedClients.length,
        dischargeReasons,
        commonTargets,
      },
      family: {
        activeFamilies,
        inactiveFamilies,
        totalFamilies: activeClients.length,
        parentResponseRate,
        netEngagementScore,
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