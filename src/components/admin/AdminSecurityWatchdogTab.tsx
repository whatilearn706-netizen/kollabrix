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
  const [phone, setPhone] = useState('+918209681378');
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [isTestingWhatsAppAuto, setIsTestingWhatsAppAuto] = useState(false);
  const [whatsappAutoSuccess, setWhatsappAutoSuccess] = useState(false);
  const [whatsappAutoError, setWhatsappAutoError] = useState('');

  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramAlertsEnabled, setTelegramAlertsEnabled] = useState(true);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestSuccess, setTelegramTestSuccess] = useState(false);
  const [telegramTestError, setTelegramTestError] = useState('');
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [telegramSaveSuccess, setTelegramSaveSuccess] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [emergencyLink, setEmergencyLink] = useState('');

  useEffect(() => {
    // 1. Initial instant load from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedToken = localStorage.getItem('teamforge_telegram_token');
        const savedChatId = localStorage.getItem('teamforge_telegram_chat_id');
        const savedPhone = localStorage.getItem('teamforge_whatsapp_phone');
        if (savedToken) setTelegramBotToken(savedToken);
        if (savedChatId) setTelegramChatId(savedChatId);
        if (savedPhone) setPhone(savedPhone);
      } catch {}
    }

    async function loadSecurity() {
      try {
        const res = await fetch('/api/admin/security', {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.success) {
          if (data.config?.whatsappPhone) {
            setPhone(data.config.whatsappPhone);
            try { localStorage.setItem('teamforge_whatsapp_phone', data.config.whatsappPhone); } catch {}
          }
          if (data.config?.whatsappApiKey) setWhatsappApiKey(data.config.whatsappApiKey);
          if (typeof data.config?.alertsEnabled === 'boolean') setAlertsEnabled(data.config.alertsEnabled);
          if (data.config?.telegramBotToken) {
            setTelegramBotToken(data.config.telegramBotToken);
            try { localStorage.setItem('teamforge_telegram_token', data.config.telegramBotToken); } catch {}
          }
          if (data.config?.telegramChatId) {
            setTelegramChatId(data.config.telegramChatId);
            try { localStorage.setItem('teamforge_telegram_chat_id', data.config.telegramChatId); } catch {}
          }
          if (typeof data.config?.telegramAlertsEnabled === 'boolean') setTelegramAlertsEnabled(data.config.telegramAlertsEnabled);
          if (Array.isArray(data.events)) setEvents(data.events);
        }
      } catch (e) {
        console.warn('Could not load security watchdog:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSecurity();

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://linkora.in';
    setEmergencyLink(`${origin}/control-center-7x9`);
  }, [authToken]);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      try {
        localStorage.setItem('teamforge_telegram_token', telegramBotToken.trim());
        localStorage.setItem('teamforge_telegram_chat_id', telegramChatId.trim());
        localStorage.setItem('teamforge_whatsapp_phone', phone.trim());
      } catch {}

      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'save_config',
          config: {
            whatsappPhone: phone.trim(),
            whatsappApiKey: whatsappApiKey.trim(),
            telegramBotToken: telegramBotToken.trim(),
            telegramChatId: telegramChatId.trim(),
            telegramAlertsEnabled,
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

  const handleSaveTelegramConfig = async () => {
    setIsSavingTelegram(true);
    setTelegramSaveSuccess(false);
    try {
      try {
        localStorage.setItem('teamforge_telegram_token', telegramBotToken.trim());
        localStorage.setItem('teamforge_telegram_chat_id', telegramChatId.trim());
      } catch {}

      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'save_config',
          config: {
            whatsappPhone: phone.trim(),
            whatsappApiKey: whatsappApiKey.trim(),
            telegramBotToken: telegramBotToken.trim(),
            telegramChatId: telegramChatId.trim(),
            telegramAlertsEnabled,
            alertsEnabled,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramSaveSuccess(true);
        setTimeout(() => setTelegramSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.warn('Failed to save Telegram config:', e);
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleTestAutomatedWhatsAppAlert = async () => {
    setIsTestingWhatsAppAuto(true);
    setWhatsappAutoSuccess(false);
    setWhatsappAutoError('');
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://linkora.in';
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'send_whatsapp_automated_test',
          phone: phone.trim(),
          apiKey: whatsappApiKey.trim(),
          origin,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWhatsappAutoSuccess(true);
        setTimeout(() => setWhatsappAutoSuccess(false), 5000);
      } else {
        setWhatsappAutoError(data.error || 'Failed to dispatch automated WhatsApp message. Check your phone number and CallMeBot API key.');
      }
    } catch (e: any) {
      setWhatsappAutoError(e.message || 'Network error triggering automated WhatsApp alert');
    } finally {
      setIsTestingWhatsAppAuto(false);
    }
  };

  const handleTestTelegramAlert = async () => {
    setIsTestingTelegram(true);
    setTelegramTestSuccess(false);
    setTelegramTestError('');
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://linkora.in';
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          action: 'send_telegram_test',
          botToken: telegramBotToken.trim(),
          chatId: telegramChatId.trim(),
          origin,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramTestSuccess(true);
        setTimeout(() => setTelegramTestSuccess(false), 5000);
      } else {
        setTelegramTestError(data.error || 'Failed to dispatch Telegram message. Check bot token and chat ID.');
      }
    } catch (e: any) {
      setTelegramTestError(e.message || 'Network error triggering Telegram alert');
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleTestWhatsAppAlert = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kollabrix.in';
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
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
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">WhatsApp Emergency Alerts</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              100% Automated • Background Push
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Kollabrix delivers real-time emergency alerts directly to your personal WhatsApp with 1-tap maintenance buttons whenever threats or brute-force attempts are detected.
          </p>

          {/* Quick CallMeBot Free Activation Helper */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Activate Free WhatsApp Background Push (10 Seconds):
              </span>
              <a
                href="https://wa.me/34644444762?text=I%20allow%20callmebot%20to%20send%20me%20messages"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline underline-offset-2"
              >
                <span>Tap to Send on WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              1. Tap above (or message <code className="text-emerald-300">+34 644 44 47 62</code>) with: <code className="text-emerald-300 font-bold">I allow callmebot to send me messages</code><br />
              2. CallMeBot will reply with your free <strong>API Key</strong>. Paste it below and hit <strong>Save WhatsApp Setup</strong>!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Your WhatsApp Phone Number
              </label>
              <Input
                placeholder="e.g. +91 8209681378"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                Include country code (+91 for India)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                CallMeBot API Key
              </label>
              <Input
                type="password"
                placeholder="Paste API key from CallMeBot"
                value={whatsappApiKey}
                onChange={(e) => setWhatsappApiKey(e.target.value)}
              />
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                Free key received on WhatsApp
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800">
            <div>
              <span className="text-xs font-bold text-white block">Auto-Dispatch on Suspicious Activity</span>
              <span className="text-[11px] text-slate-400">Silently buzz WhatsApp whenever threats are detected</span>
            </div>
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
          </div>

          {whatsappAutoSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Success! A test security alert was sent directly to your WhatsApp! Check your phone.</span>
            </div>
          )}

          {whatsappAutoError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{whatsappAutoError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between pt-2 gap-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestAutomatedWhatsAppAlert}
                isLoading={isTestingWhatsAppAuto}
                leftIcon={<Send className="w-3.5 h-3.5 text-emerald-400" />}
                className="text-xs font-mono text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                ⚡ Test Automated Push
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleTestWhatsAppAlert}
                className="text-xs text-slate-400 hover:text-slate-200"
                title="Preview pre-filled alert link in WhatsApp Web/App"
              >
                Preview Link
              </Button>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveConfig}
              isLoading={isSaving}
              leftIcon={saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : undefined}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              {saveSuccess ? 'Saved!' : 'Save WhatsApp Setup'}
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

      {/* Telegram 24/7 Automated Alert Dispatcher */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-sky-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Telegram 24/7 Automated Security Bot</span>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/30">
                  100% Automated • Background Push
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Instantly buzzes your phone with threat details and 1-tap maintenance buttons without manual intervention.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Step Setup Instructions Box */}
        <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/20 text-xs text-slate-300 space-y-2">
          <span className="font-bold text-sky-300 flex items-center gap-1.5 text-xs">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            How to set up your Telegram Bot in 60 seconds (Free & Unlimited):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
            <div className="p-2.5 rounded-xl bg-charcoal-950/80 border border-charcoal-800">
              <span className="font-bold text-sky-400 block mb-0.5">1. Create Bot</span>
              <span>Search for <strong>@BotFather</strong> on Telegram, send <code>/newbot</code>, give it a name, and copy the HTTP API token.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-charcoal-950/80 border border-charcoal-800">
              <span className="font-bold text-sky-400 block mb-0.5">2. Get Your Chat ID</span>
              <span>Search for <strong>@userinfobot</strong> on Telegram, click Start, and copy your numeric <code>Id</code>.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-charcoal-950/80 border border-charcoal-800">
              <span className="font-bold text-sky-400 block mb-0.5">3. Paste & Test</span>
              <span>Paste both below, click <strong>Save Telegram Setup</strong>, and tap <strong>Test Alert</strong> to verify!</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Telegram Bot Token (from @BotFather)
            </label>
            <Input
              type="password"
              placeholder="e.g. 7123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              value={telegramBotToken}
              onChange={(e) => setTelegramBotToken(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Your Telegram Chat ID (from @userinfobot)
            </label>
            <Input
              placeholder="e.g. 987654321"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800">
          <div>
            <span className="text-xs font-bold text-white block">Auto-Dispatch on Suspicious Activity</span>
            <span className="text-[11px] text-slate-400">Silently call Telegram Bot API to notify your phone whenever threats are detected</span>
          </div>
          <input
            type="checkbox"
            checked={telegramAlertsEnabled}
            onChange={(e) => setTelegramAlertsEnabled(e.target.checked)}
            className="w-4 h-4 accent-sky-500 rounded"
          />
        </div>

        {telegramTestSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Success! A test security alert with 1-tap maintenance controls was dispatched to your Telegram! Check your phone.</span>
          </div>
        )}

        {telegramTestError && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{telegramTestError}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestTelegramAlert}
            isLoading={isTestingTelegram}
            leftIcon={<Send className="w-3.5 h-3.5 text-sky-400" />}
            className="text-xs font-mono text-sky-300 border-sky-500/30 hover:bg-sky-500/10"
          >
            Send Test Alert to My Telegram
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSaveTelegramConfig}
            isLoading={isSavingTelegram}
            leftIcon={telegramSaveSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : undefined}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
          >
            {telegramSaveSuccess ? 'Saved!' : 'Save Telegram Setup'}
          </Button>
        </div>
      </div>

      {/* Security Architecture Protection Checklist */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Why Kollabrix Is Architecturally Protected</h3>
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
