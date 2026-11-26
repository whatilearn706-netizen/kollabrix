'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Crown,
  Zap,
  Users,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  ShieldCheck,
  TrendingUp,
  X,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminSubscriptionsTabProps {
  authToken?: string;
}

interface SubscriberItem {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  college?: string;
  planId: string;
  planName: string;
  priceInr: number;
  activatedAt: string;
  expiresAt: string | null;
  daysRemaining: number | null;
  isActive: boolean;
  source: string;
  utrNumber?: string;
  paymentId?: string;
  orderId?: string;
}

interface StatsSummary {
  totalActivePaid: number;
  hackathonPassCount: number;
  proMonthlyCount: number;
  proSemesterCount: number;
  totalRevenueInr: number;
  totalRegisteredUsers: number;
}

interface RazorpayConfig {
  enabled: boolean;
  keyId: string;
  hasKeySecret: boolean;
  isTestMode?: boolean;
  lastUpdated?: string;
}

export function AdminSubscriptionsTab({ authToken }: AdminSubscriptionsTabProps) {
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [razorpay, setRazorpay] = useState<RazorpayConfig>({
    enabled: false,
    keyId: '',
    hasKeySecret: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');

  // Razorpay edit state
  const [editKeyId, setEditKeyId] = useState('');
  const [editKeySecret, setEditKeySecret] = useState('');
  const [editEnabled, setEditEnabled] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isSavingRazorpay, setIsSavingRazorpay] = useState(false);

  // Grant Subscription Modal state
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('hackathon_pass');
  const [customDays, setCustomDays] = useState('');
  const [grantNotes, setGrantNotes] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/subscriptions', { headers });
      const data = await res.json();

      if (res.ok) {
        setSubscribers(data.subscribers || []);
        setStats(data.stats || null);
        setRegisteredUsers(data.registeredUsers || []);
        if (data.razorpay) {
          setRazorpay(data.razorpay);
          setEditKeyId(data.razorpay.keyId || '');
          setEditEnabled(data.razorpay.enabled || false);
        }
      } else {
        setActionMessage({ type: 'err', text: data.error || 'Failed to load subscribers' });
      }
    } catch {
      setActionMessage({ type: 'err', text: 'Network error loading subscriptions' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [authToken]);

  const handleSaveRazorpay = async () => {
    setIsSavingRazorpay(true);
    setActionMessage(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'save_razorpay',
          razorpayConfig: {
            enabled: editEnabled,
            keyId: editKeyId,
            ...(editKeySecret ? { keySecret: editKeySecret } : {}),
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRazorpay(data.settings);
        setEditKeySecret('');
        setActionMessage({ type: 'ok', text: 'Razorpay payment gateway configured successfully!' });
      } else {
        setActionMessage({ type: 'err', text: data.error || 'Failed to save Razorpay settings' });
      }
    } catch {
      setActionMessage({ type: 'err', text: 'Network error saving Razorpay config' });
    } finally {
      setIsSavingRazorpay(false);
    }
  };

  const handleGrantPlan = async () => {
    if (!selectedUserId) {
      setActionMessage({ type: 'err', text: 'Please select a student user.' });
      return;
    }

    setIsGranting(true);
    setActionMessage(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'grant_plan',
          targetUserId: selectedUserId,
          planId: selectedPlanId,
          customDays: customDays ? parseInt(customDays, 10) : undefined,
          notes: grantNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'ok', text: data.message || 'Subscription granted successfully!' });
        setIsGrantModalOpen(false);
        setSelectedUserId('');
        setCustomDays('');
        setGrantNotes('');
        await fetchSubscriptions();
      } else {
        setActionMessage({ type: 'err', text: data.error || 'Failed to grant plan' });
      }
    } catch {
      setActionMessage({ type: 'err', text: 'Network error granting subscription' });
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokePlan = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to revoke the subscription for ${userName}? They will be downgraded to the Free tier immediately.`)) {
      return;
    }

    setActionMessage(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'revoke_plan',
          targetUserId: userId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'ok', text: `Subscription revoked for ${userName}.` });
        await fetchSubscriptions();
      } else {
        setActionMessage({ type: 'err', text: data.error || 'Failed to revoke plan' });
      }
    } catch {
      setActionMessage({ type: 'err', text: 'Network error revoking plan' });
    }
  };

  const handleExtendPlan = async (userId: string, days: number, userName: string) => {
    setActionMessage(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'extend_plan',
          targetUserId: userId,
          customDays: days,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'ok', text: `Extended ${userName}'s plan by +${days} days!` });
        await fetchSubscriptions();
      } else {
        setActionMessage({ type: 'err', text: data.error || 'Failed to extend plan' });
      }
    } catch {
      setActionMessage({ type: 'err', text: 'Network error extending plan' });
    }
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.utrNumber && s.utrNumber.toLowerCase().includes(q)) ||
      (s.paymentId && s.paymentId.toLowerCase().includes(q));

    const matchesPlan = filterPlan === 'all' || s.planId === filterPlan;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && s.isActive) ||
      (filterStatus === 'expired' && !s.isActive);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Action feedback alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            actionMessage.type === 'ok'
              ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-400/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-white/60 hover:text-white cursor-pointer ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner / Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-charcoal-900 to-cyan-500/10 border border-charcoal-750">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>KΛ Monetization Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Subscription Management &amp; Direct Razorpay
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
            Monitor paying students, add or revoke passes manually, and wire your Razorpay account so payments flow directly to your bank.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchSubscriptions}
            disabled={isLoading}
            className="text-xs font-bold border-charcoal-700 hover:border-slate-500"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsGrantModalOpen(true)}
            className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-charcoal-950 shadow-glow"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Grant Subscription
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Paid Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats ? stats.totalActivePaid : '...'}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            of {stats?.totalRegisteredUsers || 0} registered accounts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Hackathon Passes</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300">
            {stats ? stats.hackathonPassCount : '...'}
          </div>
          <div className="text-[11px] text-slate-400">
            ₹49 / 7 days active sprint passes
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pro Builders</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {stats ? (stats.proMonthlyCount + stats.proSemesterCount) : '...'}
          </div>
          <div className="text-[11px] text-slate-400">
            ₹149/mo &amp; ₹399/sem sitewide Pro
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Est. Platform Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">
            ₹{stats ? stats.totalRevenueInr.toLocaleString('en-IN') : '...'}
          </div>
          <div className="text-[11px] text-emerald-400/80">
            UPI + Razorpay subscriber total
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Configuration Box */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Razorpay Payment Gateway Setup</h3>
                {razorpay.enabled ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                    🟢 LIVE / READY
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-zinc-700/60 border border-zinc-600 text-[10px] font-bold text-zinc-300">
                    ⚪ DISABLED
                  </span>
                )}
                {razorpay.isTestMode && razorpay.enabled && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-[10px] font-bold text-amber-300">
                    TEST MODE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste your Razorpay Key ID &amp; Secret from your Razorpay Dashboard (Settings → API Keys).
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-charcoal-800/80 hover:bg-charcoal-800 px-3.5 py-2 rounded-xl border border-charcoal-700">
            <input
              type="checkbox"
              checked={editEnabled}
              onChange={(e) => setEditEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-charcoal-900 border-charcoal-600 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-200">
              Enable Razorpay in Pricing Modal
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-charcoal-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Razorpay Key ID (<span className="text-slate-400 font-mono">rzp_live_...</span> or <span className="text-slate-400 font-mono">rzp_test_...</span>)
            </label>
            <input
              type="text"
              value={editKeyId}
              onChange={(e) => setEditKeyId(e.target.value)}
              placeholder="rzp_live_abcdef123456"
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Razorpay Key Secret</span>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showSecret ? 'Hide' : 'Show'}
              </button>
            </label>
            <input
              type={showSecret ? 'text' : 'password'}
              value={editKeySecret}
              onChange={(e) => setEditKeySecret(e.target.value)}
              placeholder={razorpay.hasKeySecret ? '•••••••••••••••••••• (Leave blank to keep existing)' : 'Enter Razorpay Key Secret'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Keys are encrypted &amp; stored securely in Supabase. Never exposed to public clients.
          </p>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSaveRazorpay}
            disabled={isSavingRazorpay}
            className="text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-charcoal-950"
          >
            {isSavingRazorpay ? 'Saving...' : 'Save Razorpay Settings'}
          </Button>
        </div>
      </div>

      {/* Subscribers Table Section */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Student Subscribers</h3>
            <span className="px-2 py-0.5 rounded-full bg-charcoal-800 text-[11px] text-slate-300 font-mono">
              {filteredSubscribers.length} total
            </span>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student or ref ID..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-52"
              />
            </div>

            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Plans</option>
              <option value="hackathon_pass">Hackathon Pass (₹49)</option>
              <option value="pro_monthly">Pro Monthly (₹149)</option>
              <option value="pro_semester">Pro Semester (₹399)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-charcoal-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-950 text-slate-400 font-semibold border-b border-charcoal-800">
              <tr>
                <th className="py-3 px-4">Student User</th>
                <th className="py-3 px-4">Plan &amp; Price</th>
                <th className="py-3 px-4">Status &amp; Expiry</th>
                <th className="py-3 px-4">Source &amp; Reference</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60 bg-charcoal-900/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-amber-400" />
                    Loading subscriber records...
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No matching subscribers found. Click &quot;Grant Subscription&quot; above to add one manually.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.userId} className="hover:bg-charcoal-800/30 transition-colors">
                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-charcoal-800 border border-charcoal-700 flex items-center justify-center font-bold text-amber-400 overflow-hidden shrink-0">
                          {sub.avatarUrl ? (
                            <img src={sub.avatarUrl} alt={sub.name} className="w-full h-full object-cover" />
                          ) : (
                            sub.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">{sub.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{sub.email}</div>
                          {sub.college && (
                            <div className="text-[10px] text-slate-500 truncate max-w-xs">{sub.college}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            sub.planId === 'hackathon_pass'
                              ? 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-300'
                              : 'bg-amber-500/15 border border-amber-400/30 text-amber-300'
                          }`}
                        >
                          {sub.planId === 'hackathon_pass' ? <Zap className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                          {sub.planName}
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono">₹{sub.priceInr}</div>
                      </div>
                    </td>

                    {/* Status & Expiry */}
                    <td className="py-3.5 px-4">
                      {sub.isActive ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active ({sub.daysRemaining !== null ? `${sub.daysRemaining}d left` : 'Perpetual'})
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Expires: {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 text-[10px] font-bold border border-zinc-600">
                            Expired
                          </span>
                          <div className="text-[10px] text-slate-500">
                            Ended {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Source & Reference */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded bg-charcoal-800 text-[10px] font-mono text-slate-300 uppercase">
                          {sub.source}
                        </span>
                        {(sub.paymentId || sub.utrNumber) && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={sub.paymentId || sub.utrNumber}>
                            Ref: {sub.paymentId || sub.utrNumber}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleExtendPlan(sub.userId, 7, sub.name)}
                          className="text-[11px] font-semibold border-charcoal-700 hover:border-cyan-400 text-cyan-300 h-7 px-2.5"
                          title="Add 7 extra days to subscription"
                        >
                          +7 Days
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokePlan(sub.userId, sub.name)}
                          className="text-[11px] font-semibold border-charcoal-700 hover:border-rose-400 text-rose-300 h-7 px-2.5"
                          title="Revoke subscription & revert to Free"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Subscription Modal */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1017] border border-charcoal-700 p-6 sm:p-7 text-white space-y-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsGrantModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Grant / Add Subscription</h3>
                <p className="text-xs text-slate-400">
                  Assign any KΛ tier directly to a registered student.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Select Student User */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Registered Student User *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Choose student user ({registeredUsers.length} available) --</option>
                  {registeredUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) — Current: {u.currentPlan}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Plan */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Plan to Grant *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanId('hackathon_pass')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedPlanId === 'hackathon_pass'
                        ? 'bg-cyan-500/15 border-cyan-400 text-white'
                        : 'bg-charcoal-950 border-charcoal-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">Hackathon Pass</div>
                    <div className="text-[11px] font-mono text-cyan-300">₹49 (7 days)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlanId('pro_monthly')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedPlanId === 'pro_monthly'
                        ? 'bg-amber-500/15 border-amber-400 text-white'
                        : 'bg-charcoal-950 border-charcoal-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">Pro Builder</div>
                    <div className="text-[11px] font-mono text-amber-300">₹149 (30 days)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlanId('pro_semester')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedPlanId === 'pro_semester'
                        ? 'bg-purple-500/15 border-purple-400 text-white'
                        : 'bg-charcoal-950 border-charcoal-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">Pro Semester</div>
                    <div className="text-[11px] font-mono text-purple-300">₹399 (180 days)</div>
                  </button>
                </div>
              </div>

              {/* Custom Duration Override */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Custom Duration in Days (Optional override)
                </label>
                <input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="e.g. 14 (leave blank for standard plan duration)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Reference / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                  placeholder="e.g. SIH hackathon team sponsor or manual cash/UPI payment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsGrantModalOpen(false)}
                className="text-xs font-bold border-charcoal-700"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleGrantPlan}
                disabled={isGranting || !selectedUserId}
                className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-charcoal-950 shadow-glow"
              >
                {isGranting ? 'Granting...' : 'Confirm & Grant Plan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
