import { NextRequest, NextResponse } from 'next/server';
import { AIPlanDraft } from '@/types/database';

export const runtime = 'nodejs';

/**
 * Intelligent Rule-Based Planning Engine
 * Produces structured, realistic college capstone project plans when no external AI key is configured
 */
function generateHeuristicPlan(
  idea: string,
  problemStatement: string,
  desiredOutcome: string,
  teamSize: number,
  durationWeeks: number,
  techPreferences: string[]
): AIPlanDraft {
  const stack =
    techPreferences.length > 0
      ? techPreferences
      : ['Next.js 14 (App Router)', 'TypeScript', 'Tailwind CSS', 'Supabase (PostgreSQL & Auth)', 'Vercel'];

  const m1Duration = Math.max(1, Math.round(durationWeeks * 0.25));
  const m2Duration = Math.max(2, Math.round(durationWeeks * 0.55));
  const m3Duration = Math.max(3, durationWeeks);

  return {
    scope: `Design, engineer, and deploy an end-to-end prototype for: ${idea}. The project focuses on solving: "${problemStatement || idea}" and delivering: "${desiredOutcome || 'A robust functional MVP tested by target collegiate users'}".`,
    objectives: [
      `Architect a modular system leveraging ${stack.slice(0, 3).join(', ')}`,
      `Implement core data schemas, user authentication, and permission gates`,
      `Deploy a live production build with verified responsive UI and zero critical bugs`,
      `Conduct end-user acceptance testing with at least 5 campus peers`,
    ],
    assumptions: [
      'Team members can dedicate 8-12 hours per week throughout the milestone period',
      'Development environment utilizes standard Git workflows with feature branches and pull requests',
      'Initial deployment relies on cloud-native serverless hosting and managed relational database',
    ],
    mvp_features: [
      'User Authentication & Role-Based Access Control',
      'Central Interactive Dashboard & Real-Time Data Visualization',
      'CRUD operations for core domain entities with input validation',
      'Notification or alert feed for active project updates',
      'Comprehensive responsive layout supporting mobile and desktop',
    ],
    recommended_stack: stack,
    suggested_roles: [
      {
        role: 'Project Lead / Full-Stack Engineer',
        responsibility: 'System architecture, API design, database schema, and milestone coordination',
        count: 1,
      },
      {
        role: 'Frontend / UI Engineer',
        responsibility: 'Component design system, responsive views, state management, and UX accessibility',
        count: Math.max(1, Math.round(teamSize * 0.4)),
      },
      {
        role: 'Backend / Data Engineer',
        responsibility: 'Database migrations, Row Level Security policies, API routes, and testing',
        count: Math.max(1, Math.round(teamSize * 0.3)),
      },
      {
        role: 'QA & Documentation Specialist',
        responsibility: 'Test plans, user journey verification, deployment automation, and project README',
        count: 1,
      },
    ],
    milestones: [
      {
        title: 'Phase 1: Architecture, Setup & Foundation',
        description:
          'Establish repo structure, configure database migrations and authentication, and finalize design wireframes.',
        weeks_from_start: m1Duration,
        tasks: [
          {
            title: 'Repository & Environment Initialization',
            description: 'Initialize GitHub repository with linting, TypeScript strict mode, and CI checks.',
            priority: 'High',
            suggested_role: 'Project Lead / Full-Stack Engineer',
            acceptance_criteria: [
              'Git repository created and branch protection rules enabled',
              'Development environment starts cleanly with zero warnings',
            ],
          },
          {
            title: 'Database Schema & Security Policies',
            description: 'Draft relational schema with proper primary keys, foreign constraints, and RLS policies.',
            priority: 'High',
            suggested_role: 'Backend / Data Engineer',
            acceptance_criteria: [
              'SQL migrations committed to codebase',
              'Row Level Security policies prevent unauthorized data read/write',
            ],
          },
          {
            title: 'UI Shell & Component Wireframes',
            description: 'Construct navigation, layout hierarchy, and theme tokens.',
            priority: 'Medium',
            suggested_role: 'Frontend / UI Engineer',
            acceptance_criteria: [
              'Responsive navbar, sidebar, and base containers rendering cleanly',
              'Design tokens align with collegiate accessibility standards',
            ],
          },
        ],
      },
      {
        title: 'Phase 2: Core MVP Implementation & Business Logic',
        description:
          'Build out the primary domain workflows, state persistence, form validation, and responsive interfaces.',
        weeks_from_start: m2Duration,
        tasks: [
          {
            title: 'Primary Entity Workflows & Forms',
            description: 'Build interactive forms with validation, error states, and optimistic updates.',
            priority: 'High',
            suggested_role: 'Frontend / UI Engineer',
            acceptance_criteria: [
              'User inputs validated on client and verified server-side',
              'Clear loading, empty, and success toast states',
            ],
          },
          {
            title: 'API Routes & Server Operations',
            description: 'Implement server-side handlers for core business logic, filtering, and data aggregation.',
            priority: 'High',
            suggested_role: 'Backend / Data Engineer',
            acceptance_criteria: [
              'All endpoints return standard HTTP status codes and error messages',
              'Database queries properly indexed for low latency',
            ],
          },
          {
            title: 'Search, Filter & Sorting Controls',
            description: 'Add real-time client-side and server-side filtering for project records.',
            priority: 'Medium',
            suggested_role: 'Frontend / UI Engineer',
            acceptance_criteria: [
              'Filter by category, status, and keywords works seamlessly',
              'Zero flickering or layout shifts during state transitions',
            ],
          },
        ],
      },
      {
        title: 'Phase 3: Integration, Testing & Production Release',
        description:
          'Conduct end-to-end validation, fix edge-case bugs, complete technical documentation, and deploy to production.',
        weeks_from_start: m3Duration,
        tasks: [
          {
            title: 'End-to-End User Testing & Bug Fixes',
            description: 'Execute usability walkthroughs with test accounts representing each student/team role.',
            priority: 'High',
            suggested_role: 'QA & Documentation Specialist',
            acceptance_criteria: [
              'Test suite passes with 100% success rate',
              'All permission gates verified against unauthorized URL access',
            ],
          },
          {
            title: 'Production Deployment & Performance Audit',
            description: 'Configure custom domain, SSL, environment secrets, and verify Lighthouse performance.',
            priority: 'High',
            suggested_role: 'Project Lead / Full-Stack Engineer',
            acceptance_criteria: [
              'Application deployed live with zero console errors',
              'Lighthouse accessibility score >= 90',
            ],
          },
          {
            title: 'Comprehensive Technical Documentation',
            description: 'Write project README, architecture diagrams, user guide, and demo video script.',
            priority: 'Medium',
            suggested_role: 'QA & Documentation Specialist',
            acceptance_criteria: [
              'Setup instructions tested by a teammate from scratch',
              'Clear architecture overview included in documentation',
            ],
          },
        ],
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      idea = '',
      problemStatement = '',
      desiredOutcome = '',
      teamSize = 3,
      durationWeeks = 8,
      technologies = [],
    } = body;

    if (!idea.trim()) {
      return NextResponse.json({ error: 'Project idea is required.' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let plan: AIPlanDraft | null = null;
    let engineUsed = 'Rule-Based Heuristic Engine';

    // 1. Try Gemini if configured
    if (geminiKey) {
      try {
        const prompt = `You are a Senior Principal Software Architect and College Capstone Mentor.
Create a detailed, actionable, highly structured project plan for a student team.

Project Idea: ${idea}
Problem to Solve: ${problemStatement}
Target Outcome: ${desiredOutcome}
Team Size: ${teamSize} students
Available Time: ${durationWeeks} weeks
Preferred Technologies: ${technologies.join(', ') || 'Modern full-stack web technologies'}

Return ONLY a valid JSON object matching this schema:
{
  "scope": "string",
  "objectives": ["string"],
  "assumptions": ["string"],
  "mvp_features": ["string"],
  "recommended_stack": ["string"],
  "suggested_roles": [{"role": "string", "responsibility": "string", "count": 1}],
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "weeks_from_start": number,
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "priority": "High" | "Medium" | "Low",
          "suggested_role": "string",
          "acceptance_criteria": ["string"]
        }
      ]
    }
  ]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (res.ok) {
          const aiJson = await res.json();
          const text = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            plan = JSON.parse(text) as AIPlanDraft;
            engineUsed = 'Gemini 1.5 Flash';
          }
        }
      } catch (e) {
        console.warn('Gemini API call failed, falling back to heuristic engine:', e);
      }
    }

    // 2. Try OpenAI if configured and Gemini was not used
    if (!plan && openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert college project planner. Output only valid JSON conforming strictly to the requested schema.',
              },
              {
                role: 'user',
                content: `Generate project plan for: Idea: ${idea}. Problem: ${problemStatement}. Team: ${teamSize}. Weeks: ${durationWeeks}. Stack: ${technologies.join(', ')}.`,
              },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (res.ok) {
          const aiJson = await res.json();
          const content = aiJson.choices?.[0]?.message?.content;
          if (content) {
            plan = JSON.parse(content) as AIPlanDraft;
            engineUsed = 'OpenAI GPT-4o-mini';
          }
        }
      } catch (e) {
        console.warn('OpenAI API call failed, falling back to heuristic engine:', e);
      }
    }

    // 3. Fallback to intelligent deterministic heuristic engine if no external API key was configured
    if (!plan) {
      plan = generateHeuristicPlan(
        idea,
        problemStatement,
        desiredOutcome,
        teamSize,
        durationWeeks,
        technologies
      );
    }

    return NextResponse.json({
      plan,
      engine: engineUsed,
      disclaimer:
        'AI-generated plans are draft templates intended for team review. Please adapt milestones, tasks, and role assignments to fit your team’s schedule and technical preferences before approving.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate project plan.' },
      { status: 500 }
    );
  }
}
