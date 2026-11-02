import { NextRequest, NextResponse } from 'next/server';
import { CampusDeadlineItem, DEFAULT_CAMPUS_DEADLINES } from '@/types/communityFeatures';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// GET: Public fetch of collegiate deadlines with auto-aggregation across hackathons, ICPC contests, and faculty challenges
export async function GET() {
  try {
    const rawDeadlines = await getMasterControlSubkey<CampusDeadlineItem[] | null>('deadlines', null);
    const rawDeletedIds = await getMasterControlSubkey<string[]>('deleted_deadline_ids', []);
    const deletedSet = new Set<string>(Array.isArray(rawDeletedIds) ? rawDeletedIds : []);

    let customDeadlines: CampusDeadlineItem[] = Array.isArray(rawDeadlines)
      ? rawDeadlines.filter((d) => !deletedSet.has(d.id))
      : [];

    const aggregated: CampusDeadlineItem[] = [...customDeadlines];
    const existingTitles = new Set(aggregated.map((d) => d.title.toLowerCase().trim()));

    // 1. Auto-aggregate active Hackathons
    try {
      const rawHackathons = await getMasterControlSubkey<any[]>('hackathons', []);
      if (Array.isArray(rawHackathons)) {
        for (const h of rawHackathons) {
          if (!h || !h.title || deletedSet.has(`hack-${h.id}`)) continue;
          const targetDate = h.registration_deadline || h.end_date || h.start_date;
          if (targetDate && !existingTitles.has(h.title.toLowerCase().trim())) {
            existingTitles.add(h.title.toLowerCase().trim());
            const diff = new Date(targetDate).getTime() - Date.now();

            let isSponsored = Boolean(h.is_sponsored || h.is_enterprise);
            let companyName = h.company_name;
            let glowColor = h.glow_color;

            if (h.description && h.description.includes('<!-- HACKATHON_META:')) {
              try {
                const rawMeta = h.description.split('<!-- HACKATHON_META:')[1]?.split('-->')[0];
                if (rawMeta) {
                  const parsed = JSON.parse(rawMeta);
                  if (parsed.is_sponsored || parsed.is_enterprise) isSponsored = true;
                  if (parsed.company_name) companyName = parsed.company_name;
                  if (parsed.glow_color) glowColor = parsed.glow_color;
                }
              } catch {}
            }

            aggregated.push({
              id: `hack-${h.id}`,
              title: h.title,
              organizer: h.organizer || (companyName ? `${companyName} Recruitment` : 'Kollabrix Campus Hackathons'),
              type: 'hackathon',
              deadlineDate: new Date(targetDate).toISOString(),
              category: (Array.isArray(h.themes) && h.themes[0]) || 'Collegiate Hackathon',
              description: h.description ? h.description.split('<!-- HACKATHON_META:')[0].trim() : 'Rapid collegiate hackathon sprint.',
              link: `/hackathons/${h.id}`,
              prize: h.prize_pool || undefined,
              urgency: diff > 0 && diff < 3 * 86400000 ? 'urgent' : 'upcoming',
              tags: isSponsored
                ? ['Sponsored', companyName || 'Enterprise', ...(Array.isArray(h.themes) ? h.themes : ['Sprint'])]
                : ['Hackathon', ...(Array.isArray(h.themes) ? h.themes : ['Sprint'])],
              is_sponsored: isSponsored,
              company_name: companyName,
              glow_color: glowColor,
            });
          }
        }
      }
    } catch (e) {
      console.warn('Error aggregating hackathon deadlines:', e);
    }

    // 2. Auto-aggregate live ICPC & Competitive Contests
    try {
      const rawContests = await getMasterControlSubkey<any[]>('icpc_contests', []);
      if (Array.isArray(rawContests)) {
        for (const c of rawContests) {
          if (!c || !c.title || deletedSet.has(`icpc-${c.id}`)) continue;
          const targetDate = c.liveUntil || c.liveFrom;
          if (targetDate && !existingTitles.has(c.title.toLowerCase().trim())) {
            existingTitles.add(c.title.toLowerCase().trim());
            const diff = new Date(targetDate).getTime() - Date.now();
            aggregated.push({
              id: `icpc-${c.id}`,
              title: c.title,
              organizer: c.author || 'Indian Collegiate Programming Consortium',
              type: 'icpc',
              deadlineDate: new Date(targetDate).toISOString(),
              category: 'Competitive Programming',
              description: c.subtitle || 'Competitive algorithmic contest with live scoring.',
              link: '/icpc',
              prize: '+400 Arena Rating',
              urgency: diff > 0 && diff < 2 * 86400000 ? 'urgent' : 'upcoming',
              tags: ['ICPC', 'DSA', 'Speedrun'],
            });
          }
        }
      }
    } catch (e) {
      console.warn('Error aggregating ICPC contest deadlines:', e);
    }

    // 3. If zero or very few deadlines found, populate with live upcoming campus opportunities
    if (aggregated.length === 0) {
      const defaultsWithFreshDates = DEFAULT_CAMPUS_DEADLINES.filter((d) => !deletedSet.has(d.id)).map((d, index) => {
        const daysFromNow = (index + 2) * 2;
        return {
          ...d,
          deadlineDate: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString(),
        };
      });
      aggregated.push(...defaultsWithFreshDates);
    }

    // Sort by deadline date ascending (earliest expiring first)
    aggregated.sort(
      (a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        deadlines: aggregated,
        totalDeadlines: aggregated.length,
        urgentCount: aggregated.filter(
          (d) => new Date(d.deadlineDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
        ).length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { deadlines: [], error: err.message },
      { status: 200 }
    );
  }
}

// POST: Admin adds a new deadline
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const { title, organizer, type, deadlineDate, category, description, link, prize, urgency, tags } = body;

    if (!title || !deadlineDate) {
      return NextResponse.json({ error: 'Title and deadline date are required' }, { status: 400 });
    }

    const rawDeadlines = await getMasterControlSubkey<CampusDeadlineItem[] | null>('deadlines', null);
    const rawDeletedIds = await getMasterControlSubkey<string[]>('deleted_deadline_ids', []);
    const deletedSet = new Set<string>(Array.isArray(rawDeletedIds) ? rawDeletedIds : []);

    let currentList: CampusDeadlineItem[] = Array.isArray(rawDeadlines)
      ? [...rawDeadlines].filter((d) => !deletedSet.has(d.id))
      : [...DEFAULT_CAMPUS_DEADLINES].filter((d) => !deletedSet.has(d.id));

    const newId = `dl-${Date.now()}`;
    deletedSet.delete(newId);

    const newDeadline: CampusDeadlineItem = {
      id: newId,
      title: title.trim(),
      organizer: (organizer || 'Kollabrix Campus').trim(),
      type: type || 'hackathon',
      deadlineDate: new Date(deadlineDate).toISOString(),
      category: category || 'Campus Opportunity',
      description: (description || '').trim(),
      link: link || '/hackathons',
      prize: prize || undefined,
      urgency: urgency || 'upcoming',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
    };

    currentList.push(newDeadline);
    currentList.sort(
      (a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
    );

    const result = await updateMasterControlSubkey('deadlines', currentList);
    await updateMasterControlSubkey('deleted_deadline_ids', Array.from(deletedSet));

    if (!result.success) {
      throw new Error(result.error || 'Failed to save to master database');
    }

    return NextResponse.json({
      success: true,
      message: 'Deadline added successfully',
      deadline: newDeadline,
      deadlines: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add deadline' }, { status: 500 });
  }
}

// PATCH: Admin updates a deadline
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Deadline ID required' }, { status: 400 });
    }

    const rawDeadlines = await getMasterControlSubkey<CampusDeadlineItem[] | null>('deadlines', null);
    const rawDeletedIds = await getMasterControlSubkey<string[]>('deleted_deadline_ids', []);
    const deletedSet = new Set<string>(Array.isArray(rawDeletedIds) ? rawDeletedIds : []);

    let currentList: CampusDeadlineItem[] = Array.isArray(rawDeadlines)
      ? [...rawDeadlines].filter((d) => !deletedSet.has(d.id))
      : [...DEFAULT_CAMPUS_DEADLINES].filter((d) => !deletedSet.has(d.id));

    const idx = currentList.findIndex((d) => d.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 });
    }

    currentList[idx] = { ...currentList[idx], ...updates };
    currentList.sort(
      (a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
    );

    const result = await updateMasterControlSubkey('deadlines', currentList);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save to master database');
    }

    return NextResponse.json({
      success: true,
      message: 'Deadline updated successfully',
      deadlines: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update deadline' }, { status: 500 });
  }
}

// DELETE: Admin removes a deadline
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Deadline ID required' }, { status: 400 });
    }

    const rawDeadlines = await getMasterControlSubkey<CampusDeadlineItem[] | null>('deadlines', null);
    const rawDeletedIds = await getMasterControlSubkey<string[]>('deleted_deadline_ids', []);
    const deletedSet = new Set<string>(Array.isArray(rawDeletedIds) ? rawDeletedIds : []);

    let currentList: CampusDeadlineItem[] = Array.isArray(rawDeadlines)
      ? [...rawDeadlines]
      : [...DEFAULT_CAMPUS_DEADLINES];

    // Add to deleted blacklist permanently
    deletedSet.add(id);

    // Remove from active list
    currentList = currentList.filter((d) => d.id !== id && !deletedSet.has(d.id));

    const result = await updateMasterControlSubkey('deadlines', currentList);
    await updateMasterControlSubkey('deleted_deadline_ids', Array.from(deletedSet));

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete from master database');
    }

    return NextResponse.json({
      success: true,
      message: 'Deadline removed successfully',
      deadlines: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete deadline' }, { status: 500 });
  }
}
