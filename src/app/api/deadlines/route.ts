import { NextRequest, NextResponse } from 'next/server';
import { CampusDeadlineItem, DEFAULT_CAMPUS_DEADLINES } from '@/types/communityFeatures';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// GET: Public fetch of collegiate deadlines
export async function GET() {
  try {
    const rawDeadlines = await getMasterControlSubkey<CampusDeadlineItem[]>('deadlines', DEFAULT_CAMPUS_DEADLINES);
    let deadlines: CampusDeadlineItem[] = Array.isArray(rawDeadlines) && rawDeadlines.length > 0
      ? rawDeadlines
      : [...DEFAULT_CAMPUS_DEADLINES];

    // Sort by deadline date ascending (earliest expiring first)
    deadlines.sort(
      (a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
    );

    return NextResponse.json({
      success: true,
      deadlines,
      totalDeadlines: deadlines.length,
      urgentCount: deadlines.filter(
        (d) => new Date(d.deadlineDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
      ).length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { deadlines: DEFAULT_CAMPUS_DEADLINES, error: err.message },
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

    const rawDeadlines = await getMasterControlSubkey<CampusDeadlineItem[]>('deadlines', DEFAULT_CAMPUS_DEADLINES);
    let currentList: CampusDeadlineItem[] = Array.isArray(rawDeadlines) && rawDeadlines.length > 0
      ? [...rawDeadlines]
      : [...DEFAULT_CAMPUS_DEADLINES];

    const newDeadline: CampusDeadlineItem = {
      id: `dl-${Date.now()}`,
      title: title.trim(),
      organizer: (organizer || 'Linkora Campus').trim(),
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

    const rawDeadlines = await getMasterControlSubkey<CampusDeadlineItem[]>('deadlines', DEFAULT_CAMPUS_DEADLINES);
    let currentList: CampusDeadlineItem[] = Array.isArray(rawDeadlines) && rawDeadlines.length > 0
      ? [...rawDeadlines]
      : [...DEFAULT_CAMPUS_DEADLINES];

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

    const rawDeadlines = await getMasterControlSubkey<CampusDeadlineItem[]>('deadlines', DEFAULT_CAMPUS_DEADLINES);
    let currentList: CampusDeadlineItem[] = Array.isArray(rawDeadlines) && rawDeadlines.length > 0
      ? [...rawDeadlines]
      : [...DEFAULT_CAMPUS_DEADLINES];

    currentList = currentList.filter((d) => d.id !== id);

    const result = await updateMasterControlSubkey('deadlines', currentList);
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
