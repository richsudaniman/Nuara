import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { patientId } = await req.json();
    if (!patientId) return Response.json({ error: 'patientId is required' }, { status: 400 });

    // Resolve patient
    const allUsers = await base44.entities.User.list();
    const patient = allUsers.find((u) => u.id === patientId);
    const patientName = patient?.full_name || 'Patient';

    // Gather clinical data
    const goals = await base44.entities.TherapyGoal.filter({ assigned_to_client_id: patientId });
    const logs = await base44.entities.TherapyLog.filter({ logged_by_client_id: patientId }, '-completed_date', 200);
    const notes = await base44.entities.ClinicalNote.filter({ client_id: patientId }, '-created_date', 10);

    // Compliance over last 7 days (unique active days out of 5 expected)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = logs.filter((l) => l.completed_date && new Date(l.completed_date) >= sevenDaysAgo);
    const uniqueDays = new Set(recentLogs.map((l) => l.completed_date)).size;
    const compliance = Math.min(Math.round((uniqueDays / 5) * 100), 100);

    // Build PDF
    const doc = new jsPDF();
    let y = 20;
    const line = (text, size = 11, bold = false, gap = 7) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      const wrapped = doc.splitTextToSize(String(text), 175);
      doc.text(wrapped, 18, y);
      y += gap * wrapped.length;
      if (y > 275) { doc.addPage(); y = 20; }
    };

    doc.setFillColor(167, 139, 250);
    doc.rect(0, 0, 210, 10, 'F');
    line('Speech Therapy Progress Report', 18, true, 9);
    line(`Patient: ${patientName}`, 12, true, 6);
    line(`Prepared by: ${user.full_name || 'Practitioner'}`, 10, false, 5);
    line(`Date: ${new Date().toLocaleDateString()}`, 10, false, 10);

    line('Weekly Compliance', 13, true, 7);
    line(`${compliance}% — active on ${uniqueDays} of 5 expected practice days this week.`, 11, false, 10);

    line('Therapy Goals', 13, true, 7);
    if (goals.length === 0) {
      line('No active goals on record.', 11, false, 8);
    } else {
      goals.forEach((g) => {
        line(`• ${g.goal_title}`, 11, true, 6);
        line(`   Target: ${g.target_value || '—'}   Current: ${g.current_value || '—'}   Progress: ${g.progress_percentage ?? 0}%`, 10, false, 7);
      });
    }
    y += 3;

    line('Recent Clinical Notes', 13, true, 7);
    if (notes.length === 0) {
      line('No clinical notes recorded.', 11, false, 8);
    } else {
      notes.slice(0, 5).forEach((n) => {
        const d = n.created_date ? new Date(n.created_date).toLocaleDateString() : '';
        line(`${d} — ${n.title}`, 11, true, 6);
        line(n.content || '', 10, false, 7);
      });
    }

    const pdfBytes = doc.output('arraybuffer');
    const safeName = patientName.replace(/[^a-z0-9]+/gi, '_');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=progress_report_${safeName}.pdf`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});