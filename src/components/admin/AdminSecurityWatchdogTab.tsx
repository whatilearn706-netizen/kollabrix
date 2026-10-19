'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Phone,
  Send,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Zap,
  Globe,
  Database,
  Terminal,
  Activity,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AdminSecurityWatchdogTabProps {
  authToken?: string;
}

export function AdminSecurityWatchdogTab({ authToken }: AdminSecurityWatchdogTabProps) {
  const [phone, setPhone] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [emergencyLink, setEmergencyLink] = useState('');

  useEffect(() => {
    async function loadSecurity() {
      try {
        const res = await fetch('/api/admin/security');
        const data = await res.json();
        if (data.success) {
          if (data.config?.whatsappPhone) setPhone(data.config.whatsappPhone);
          if (typeof data.config?.alertsEnabled === 'boolean') setAlertsEnabled(data.config.alertsEnabled);
          if (Array.isArray(data.events)) setEvents(data.events);
        }
      } catch (e) {
        console.warn('Could not load security watchdog:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSecurity();

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://linkora-link.online';
    setEmergencyLink(`${origin}/api/admin/emergency-maintenance?key=linkora-sec-emergency-2026&action=activate`);
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_config',
          config: {
            whatsappPhone: phone.trim(),
            alertsEnabled,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.warn('Failed to save security config:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWhatsAppAlert = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://linkora-link.online';
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_whatsapp_alert',
          phone,
          origin,
          eventDetails: {
            title: 'Test Security Watchdog Alert (Verification)',
            ip: '103.14.24.89 (Simulated Probe)',
            timestamp: new Date().toLocaleTimeString(),
          },
        }),
      });
      const data = await res.json();
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }
    } catch (e) {
      console.warn('Failed to trigger test alert:', e);
    }
  };

  const handleCopyEmergencyLink = () => {
    navigator.clipboard.writeText(emergencyLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-emerald-500/10 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Security Watchdog & WhatsApp Alert Desk</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active 24/7
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Real-time threat detection with direct WhatsApp notifications, step-by-step solutions, and an emergency 1-tap maintenance kill-switch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <a
            href={emergencyLink}
            target="_blank"
            rel="noreferrer"
            className="w-full md:w-auto"
          >
            <Button
              size="sm"
              variant="outline"
              className="w-full md:w-auto text-xs font-mono font-bold text-red-400 border-red-500/40 hover:bg-red-500/15"
            >
              🚨 Test Emergency Maintenance Page
            </Button>
          </a>
        </div>
      </div>

      {/* Grid: WhatsApp Notification Setup & Emergency 1-Tap Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Phone Card */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">WhatsApp Emergency Alerts</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Instant Dispatch
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Whenever suspicious behavior occurs (unauthorized admin logins, brute force, or tampering), Linkora formats a real-time WhatsApp alert sent directly to your phone with the remedy and 1-tap kill-switch.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Your WhatsApp Phone Number (with Country Code)
              </label>
              <Input
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                Format: +[Country Code][10-digit number] (e.g. +919876543210 for India)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800">
              <div>
                <span className="text-xs font-bold text-white block">Automatic Watchdog Alerts</span>
                <span className="text-[11px] text-slate-400">Generate alerts on high-severity security events</span>
              </div>
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestWhatsAppAlert}
              leftIcon={<Send className="w-3.5 h-3.5 text-emerald-400" />}
              className="text-xs font-mono text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              Test Alert to My WhatsApp
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveConfig}
              isLoading={isSaving}
              leftIcon={saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : undefined}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              {saveSuccess ? 'Saved!' : 'Save Phone'}
            </Button>
          </div>
        </div>

        {/* 1-Tap Emergency Kill-Switch Link */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white">1-Tap Emergency Maintenance Link</h3>
            </div>
            <span className="text-[10px] font-mono text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/30">
              Mobile Kill-Switch
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Keep this secret emergency link bookmarked on your phone or WhatsApp. Tapping it instantly flips your entire website into a clean maintenance screen so no visitor or hacker can view or interact with it.
          </p>

          <div className="p-3.5 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Secret 1-Tap Emergency URL
            </span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-red-300 truncate">
                {emergencyLink}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyEmergencyLink}
                leftIcon={copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-red-400" />}
                className="h-7 text-xs border-red-500/30 text-red-300 hover:bg-red-500/10 shrink-0"
              >
                {copiedLink ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              What happens when activated?
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every public visitor immediately sees: <em>"Campus Platform Upgrade in Progress"</em>. Your database and code remain 100% safe, while you alone can log into the Admin Control Center to review and fix things.
            </p>
          </div>
        </div>
      </div>

      {/* Security Architecture Protection Checklist */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Why Linkora Is Architecturally Protected</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Globe className="w-4 h-4" />
              <span>Vercel Serverless</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No persistent Linux server or open SSH ports. Each request runs in an isolated ephemeral micro-container that is destroyed immediately.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Database className="w-4 h-4" />
              <span>PostgreSQL RLS</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Row-Level Security isolates every student’s data at the database engine level. Users can never edit or delete other students' records.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Terminal className="w-4 h-4" />
              <span>Git Source Lock</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Frontend code is immutable and compiled directly from your private GitHub repository. Nobody can deface or edit files on the server.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Zap className="w-4 h-4" />
              <span>Edge DDoS Shield</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Global Anycast CDN absorbs traffic spikes and blocks bot floods before they ever touch your application logic.
            </p>
          </div>
        </div>
      </div>

      {/* Security Event Feed */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live Security Event Feed</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {events.length} Events Monitored
          </span>
        </div>

        <div className="space-y-2">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${
                      evt.severity === 'high'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : evt.severity === 'medium'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {evt.status || 'Active'}
                  </span>
                  <span className="font-bold text-white">{evt.title}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{evt.description}</p>
              </div>

              <div className="text-right text-[11px] font-mono text-slate-500 shrink-0">
                <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="block text-[10px] text-slate-600">{evt.ip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
