import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let practitioner;
    try {
      practitioner = await base44.auth.me();
    } catch (authError) {
      return Response.json({ error: 'Authentication failed' }, { status: 401 });
    }
    if (!practitioner) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only practitioners (trainer user_type) or admins may add clients
    const isPractitioner = practitioner.user_type === 'trainer' || practitioner.role === 'admin';
    if (!isPractitioner) {
      return Response.json({ error: 'Only practitioners can add clients' }, { status: 403 });
    }

    const body = await req.json();
    const {
      email,
      full_name,
      date_of_birth,
      age,
      diagnosis,
      therapy_focus,
      session_schedule,
      parent_guardian_name,
      phone,
      bio,
    } = body;

    if (!email || !full_name) {
      return Response.json({ error: 'Email and full name are required' }, { status: 400 });
    }

    const trainerId = body.trainer_id || practitioner.id;

    // Avoid duplicate accounts
    const existing = await base44.asServiceRole.entities.User.filter({ email: email.trim().toLowerCase() });
    let clientUser = existing && existing.length > 0 ? existing[0] : null;

    const profileData = {
      full_name: full_name.trim(),
      user_type: 'client',
      assigned_trainer_id: trainerId,
    };
    if (date_of_birth) profileData.date_of_birth = date_of_birth;
    if (age !== undefined && age !== null && age !== '') profileData.age = Number(age);
    if (diagnosis) profileData.diagnosis = diagnosis;
    if (therapy_focus) profileData.therapy_focus = therapy_focus;
    if (session_schedule) profileData.session_schedule = session_schedule;
    if (parent_guardian_name) profileData.parent_guardian_name = parent_guardian_name;
    if (phone) profileData.phone = phone;
    if (bio) profileData.bio = bio;

    if (clientUser) {
      // Patient already exists — update their profile and re-point to this practitioner
      clientUser = await base44.asServiceRole.entities.User.update(clientUser.id, profileData);
    } else {
      clientUser = await base44.asServiceRole.entities.User.create({
        email: email.trim().toLowerCase(),
        role: 'user',
        ...profileData,
      });
    }

    // Create or reactivate the practitioner-patient assignment
    const existingAssignments = await base44.asServiceRole.entities.PractitionerPatientAssignment.filter({
      trainer_id: trainerId,
      client_id: clientUser.id,
    });
    if (existingAssignments && existingAssignments.length > 0) {
      await base44.asServiceRole.entities.PractitionerPatientAssignment.update(existingAssignments[0].id, {
        is_active: true,
      });
    } else {
      await base44.asServiceRole.entities.PractitionerPatientAssignment.create({
        trainer_id: trainerId,
        client_id: clientUser.id,
        assigned_date: new Date().toISOString().split('T')[0],
        is_active: true,
      });
    }

    return Response.json({ success: true, client: clientUser }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});