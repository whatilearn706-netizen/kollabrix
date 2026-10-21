import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

interface SignalState {
  offer?: any;
  answer?: any;
  studentCandidates: any[];
  adminCandidates: any[];
  needsOffer?: boolean;
  updatedAt: number;
}

const signalStore: Record<string, SignalState> = {};

function getSignal(studentId: string): SignalState {
  if (!signalStore[studentId]) {
    signalStore[studentId] = {
      studentCandidates: [],
      adminCandidates: [],
      updatedAt: Date.now(),
    };
  }
  return signalStore[studentId];
}

// Cleanup stale signals older than 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of Object.entries(signalStore)) {
    if (now - v.updatedAt > 15 * 60 * 1000) {
      delete signalStore[k];
    }
  }
}, 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'studentId required' }, { status: 400 });
    }

    const state = getSignal(studentId);
    state.updatedAt = Date.now();

    // 0. Admin requests a fresh offer from student
    if (action === 'request_offer') {
      state.offer = undefined;
      state.answer = undefined;
      state.studentCandidates = [];
      state.adminCandidates = [];
      state.needsOffer = true;
      return NextResponse.json({ success: true, message: 'Offer requested from student broadcaster' });
    }

    // 1. Student publishes SDP Offer
    if (action === 'offer') {
      state.offer = body.sdp;
      state.answer = undefined; // reset previous answer
      state.adminCandidates = [];
      state.needsOffer = false;
      return NextResponse.json({ success: true });
    }

    // 2. Admin retrieves SDP Offer
    if (action === 'get_offer') {
      return NextResponse.json({ success: true, offer: state.offer || null, needsOffer: state.needsOffer || false });
    }

    // 3. Admin publishes SDP Answer
    if (action === 'answer') {
      state.answer = body.sdp;
      return NextResponse.json({ success: true });
    }

    // 4. Student retrieves SDP Answer & check if Admin needs fresh offer
    if (action === 'get_answer') {
      return NextResponse.json({
        success: true,
        answer: state.answer || null,
        needsOffer: Boolean(state.needsOffer),
      });
    }

    // 5. Add ICE Candidate
    if (action === 'candidate') {
      const { candidate, role } = body; // 'student' | 'admin'
      if (role === 'student') {
        state.studentCandidates.push(candidate);
      } else {
        state.adminCandidates.push(candidate);
      }
      return NextResponse.json({ success: true });
    }

    // 6. Retrieve ICE Candidates for recipient
    if (action === 'get_candidates') {
      const { role } = body; // role of requester ('student' wants adminCandidates; 'admin' wants studentCandidates)
      const list = role === 'student' ? state.adminCandidates : state.studentCandidates;
      return NextResponse.json({ success: true, candidates: list });
    }

    // 7. Reset connection
    if (action === 'reset') {
      delete signalStore[studentId];
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signal error' }, { status: 500 });
  }
}
