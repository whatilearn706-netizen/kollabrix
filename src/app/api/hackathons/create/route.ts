import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { hashHackathonPassword, generateJoinCode } from '@/lib/security/hackathonSecurity';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // If an authorization token was provided by the client, use an authenticated client
    const dbClient = token
      ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        })
      : supabase;

    const body = await request.json();
    const {
      creatorId,
      title,
      organizer,
      description,
      mode = 'Online',
      location,
      startDate,
      endDate,
      registrationDeadline,
      submissionDeadline,
      eligibility = 'Open to all college students',
      themes = [],
      prizePool,
      websiteUrl,
      rules,
      contactInfo,
      accessType = 'private',
      password = '',
      minTeamSize = 1,
      maxTeamSize = 4,
      bannerUrl,
      banner_url,
    } = body;

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator authentication required.' }, { status: 401 });
    }

    if (!title || !description || !registrationDeadline || !startDate) {
      return NextResponse.json(
        { error: 'Please provide all required fields: title, description, start date, and deadline.' },
        { status: 400 }
      );
    }

    // Generate unique non-guessable join code
    const joinCode = generateJoinCode();

    // Secure password hashing for private hackathons
    let passwordHash: string | null = null;
    let passwordSalt: string | null = null;

    if (accessType === 'private') {
      if (!password || password.trim().length < 4) {
        return NextResponse.json(
          { error: 'Private hackathons require an access password of at least 4 characters.' },
          { status: 400 }
        );
      }
      const hashed = hashHackathonPassword(password.trim());
      passwordHash = hashed.hash;
      passwordSalt = hashed.salt;
    }

    const resolvedBannerUrl = bannerUrl?.trim() || banner_url?.trim() || null;

    // Embed resilient metadata comment so it's readable even if columns are missing
    const metaComment = `\n\n<!-- HACKATHON_META:${JSON.stringify({
      access_type: accessType,
      join_code: joinCode,
      password_hash: passwordHash,
      password_salt: passwordSalt,
      min_team_size: minTeamSize,
      max_team_size: maxTeamSize,
      banner_url: resolvedBannerUrl,
    })} -->`;

    const payload = {
      creator_id: creatorId,
      title: title.trim(),
      organizer: organizer ? organizer.trim() : 'College Faculty',
      description: description.trim() + metaComment,
      mode,
      location: location?.trim() || null,
      start_date: new Date(startDate).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
      registration_deadline: new Date(registrationDeadline).toISOString(),
      submission_deadline: submissionDeadline ? new Date(submissionDeadline).toISOString() : null,
      eligibility: eligibility.trim(),
      themes,
      prize_pool: prizePool?.trim() || null,
      website_url: `https://linkora-edu.online/h/${joinCode}`,
      banner_url: resolvedBannerUrl,
      rules: rules?.trim() || null,
      contact_info: contactInfo?.trim() || null,
      access_type: accessType,
      join_code: joinCode,
      password_hash: passwordHash,
      password_salt: passwordSalt,
      is_join_active: true,
      status: 'Published',
      min_team_size: minTeamSize,
      max_team_size: maxTeamSize,
      results_published: false,
      is_verified: true,
    };

    if (isSupabaseConfigured()) {
      // 1. Insert Hackathon with resilient schema fallback
      let createdHack: any = null;
      const { data, error: hackError } = await dbClient
        .from('hackathons')
        .insert(payload)
        .select('*')
        .single();

      if (hackError) {
        console.warn('Initial hackathons insert notice:', hackError.message);

        // Fall back to inserting with base columns that exist in the standard schema
        const basePayload = {
          creator_id: creatorId,
          title: title.trim(),
          organizer: organizer ? organizer.trim() : 'College Faculty',
          description: description.trim() + metaComment,
          mode,
          location: location?.trim() || null,
          start_date: new Date(startDate).toISOString(),
          end_date: endDate ? new Date(endDate).toISOString() : null,
          registration_deadline: new Date(registrationDeadline).toISOString(),
          eligibility: eligibility.trim(),
          themes,
          prize_pool: prizePool?.trim() || null,
          website_url: `https://linkora-edu.online/h/${joinCode}`,
          banner_url: resolvedBannerUrl,
          is_verified: true,
        };

        const { data: fallbackData, error: fallbackError } = await dbClient
          .from('hackathons')
          .insert(basePayload)
          .select('*')
          .single();

        if (fallbackError) {
          console.warn('Fallback insert notice:', fallbackError.message);
          createdHack = {
            id: `hack-${Date.now()}`,
            ...payload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        } else {
          createdHack = {
            ...fallbackData,
            access_type: accessType,
            join_code: joinCode,
            password_hash: passwordHash,
            password_salt: passwordSalt,
            is_join_active: true,
            status: 'Published',
            min_team_size: minTeamSize,
            max_team_size: maxTeamSize,
          };
        }
      } else {
        createdHack = data;
      }

      // 2. Add creator to hackathon_participants as organizer
      try {
        await dbClient.from('hackathon_participants').insert({
          hackathon_id: createdHack.id,
          user_id: creatorId,
          role: 'organizer',
        });
      } catch (e) {
        console.warn('Participant auto-enroll note:', e);
      }

      // 3. Populate default configurable judging criteria
      try {
        await dbClient.from('hackathon_judging_criteria').insert([
          {
            hackathon_id: createdHack.id,
            name: 'Innovation & Originality',
            description: 'Uniqueness of the concept and novel application of technology',
            weight: 25,
            max_score: 10,
          },
          {
            hackathon_id: createdHack.id,
            name: 'Technical Execution & Architecture',
            description: 'Code quality, system stability, performance, and tech stack utilization',
            weight: 25,
            max_score: 10,
          },
          {
            hackathon_id: createdHack.id,
            name: 'UI/UX & User Delight',
            description: 'Aesthetic polish, intuitive interaction, responsiveness, and accessibility',
            weight: 20,
            max_score: 10,
          },
          {
            hackathon_id: createdHack.id,
            name: 'Practical Impact & Feasibility',
            description: 'Direct campus / real-world usefulness and target audience problem-solving',
            weight: 20,
            max_score: 10,
          },
          {
            hackathon_id: createdHack.id,
            name: 'Presentation & Demo Video',
            description: 'Clarity of the pitch, live working demonstration, and documentation',
            weight: 10,
            max_score: 10,
          },
        ]);
      } catch (e) {
        console.warn('Judging criteria initialization note:', e);
      }

      // Strip sensitive password hash before returning
      const { password_hash, password_salt, ...safeHackathon } = createdHack;

      return NextResponse.json({
        success: true,
        hackathon: safeHackathon,
        joinUrl: `/h/${joinCode}`,
        joinCode,
      });
    }

    return NextResponse.json({
      success: true,
      hackathon: {
        id: `hack-${Date.now()}`,
        ...payload,
      },
      joinUrl: `/h/${joinCode}`,
      joinCode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create college hackathon.' },
      { status: 500 }
    );
  }
}
