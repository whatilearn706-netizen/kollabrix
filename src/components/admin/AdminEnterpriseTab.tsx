'use client';

import React, { useState } from 'react';
import {
  Globe,
  Mail,
  Zap,
  HardDrive,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Server,
  Lock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface AdminEnterpriseTabProps {
  authToken?: string;
}

export function AdminEnterpriseTab({ authToken }: AdminEnterpriseTabProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const storageSql = `-- 1. Create Public Storage Buckets for Avatars and Hackathon Banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true),
       ('hackathon-banners', 'hackathon-banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow Authenticated Users to Upload
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated users to upload banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hackathon-banners');

-- 3. Allow Public Read Access
CREATE POLICY "Public Read Access for Avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Public Read Access for Banners"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hackathon-banners');`;

  const realtimeSql = `-- Enable Realtime Replication for Live Chat & Task Sprints
ALTER PUBLICATION supabase_realtime ADD TABLE project_discussions;
ALTER PUBLICATION supabase_realtime ADD TABLE project_discussion_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE project_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE hackathon_announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE hackathon_teams;`;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-charcoal-750 bg-gradient-to-br from-charcoal-900 via-charcoal-900/90 to-charcoal-950 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span>Enterprise Scale Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Production Deployment &amp; Custom Branding Center
        </h2>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Configure your collegiate collaboration network for institutional scaling: custom educational domain names,
          branded transactional email servers, Supabase Storage buckets, and live WebSocket subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Custom Domain */}
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Custom Domain Name (DNS)</h3>
                <p className="text-xs text-slate-400">Connect your custom university or commercial domain</p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
              Vercel DNS
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              Your official platform domain is <code className="bg-charcoal-950 px-1.5 py-0.5 rounded text-emerald-300 border border-charcoal-800">linkora-link.online</code>. To connect your university domain (e.g. <span className="text-white font-semibold">linkora.edu</span> or <span className="text-white font-semibold">linkora.in</span>), add these two DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
            </p>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-mono">Type: A Record (Root Domain)</div>
                  <div className="font-mono text-sm font-semibold text-emerald-400 mt-0.5">
                    Host: @ &rarr; Value: 76.76.21.21
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('76.76.21.21', 'dns-a')}
                  className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 transition-colors"
                  title="Copy IP"
                >
                  {copiedItem === 'dns-a' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-mono">Type: CNAME Record (Subdomain)</div>
                  <div className="font-mono text-sm font-semibold text-emerald-400 mt-0.5">
                    Host: www &rarr; Value: cname.vercel-dns.com
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('cname.vercel-dns.com', 'dns-cname')}
                  className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 transition-colors"
                  title="Copy CNAME"
                >
                  {copiedItem === 'dns-cname' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">
                SSL Certificate: <strong className="text-emerald-400 font-normal">Automated &amp; Free (Let&apos;s Encrypt)</strong>
              </span>
              <a
                href="https://vercel.com/docs/projects/domains/add-a-domain"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"
              >
                <span>Vercel Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 2: Branded Transactional Emails */}
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Branded Transactional Emails</h3>
                <p className="text-xs text-slate-400">Send OTPs from noreply@yourdomain.edu</p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Custom SMTP
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              By default, Supabase sends OTP codes from <code className="bg-charcoal-950 px-1.5 py-0.5 rounded text-slate-400 border border-charcoal-800">noreply@mail.app.supabase.io</code>. To deliver from your official collegiate identity with custom email headers:
            </p>

            <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>SMTP Host:</span>
                <span className="text-purple-300 font-bold">smtp.resend.com</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Port:</span>
                <span className="text-purple-300">465 (SSL)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sender Email:</span>
                <span className="text-purple-300">noreply@linkora.edu</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sender Name:</span>
                <span className="text-purple-300">Linkora Collegiate Team</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Enter these credentials inside <strong className="text-slate-300">Supabase Dashboard &rarr; Project Settings &rarr; Authentication &rarr; SMTP Settings</strong>.
            </p>
          </div>
        </div>

        {/* Section 3: Supabase Storage Buckets */}
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Media Uploads &amp; Storage Buckets</h3>
                <p className="text-xs text-slate-400">Profile photos &amp; hackathon banner images</p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Active with Fallback
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              The application features a drag-and-drop file uploader with automated Base64 fallback so uploads never fail. For high-volume multi-gigabyte storage, run this SQL in Supabase SQL Editor:
            </p>

            <div className="relative">
              <pre className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-[11px] font-mono text-amber-300/90 overflow-x-auto max-h-36">
                {storageSql}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(storageSql, 'sql-storage')}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-charcoal-800/90 hover:bg-charcoal-700 text-slate-300 transition-colors"
                title="Copy SQL"
              >
                {copiedItem === 'sql-storage' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Live WebSockets & Realtime */}
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Live WebSockets &amp; Realtime Sync</h3>
                <p className="text-xs text-slate-400">Zero-refresh instant team feeds &amp; task boards</p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              Discussions, task changes, and hackathon workspaces subscribe to live channels via Supabase Realtime. To ensure database replication is listening on all tables:
            </p>

            <div className="relative">
              <pre className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-36">
                {realtimeSql}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(realtimeSql, 'sql-realtime')}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-charcoal-800/90 hover:bg-charcoal-700 text-slate-300 transition-colors"
                title="Copy SQL"
              >
                {copiedItem === 'sql-realtime' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Legal & Institutional Compliance */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Collegiate Legal &amp; Compliance Governance</h3>
              <p className="text-xs text-slate-400">
                100% student IP retention, FERPA &amp; GDPR alignment, verified institutional terms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/terms" target="_blank">
              <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                View Terms of Service
              </Button>
            </Link>
            <Link href="/privacy" target="_blank">
              <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                View Privacy Policy
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
            <span className="font-semibold text-white block">Student IP Retention</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Students and student teams retain 100% ownership of copyright, patents, and software repositories created on the platform.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
            <span className="font-semibold text-white block">FERPA &amp; Zero Data Selling</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Academic records, attendance, and project work are never sold, rented, or monetized with third-party advertisers.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
            <span className="font-semibold text-white block">Cryptographic Passcodes</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Private hackathons utilize SHA-256 salted hashes and high-entropy join codes for private college events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
