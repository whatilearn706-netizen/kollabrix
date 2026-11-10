'use client';

import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Plus,
  Trash2,
  Edit3,
  Save,
  Play,
  CheckCircle2,
  Sliders,
  Sparkles,
  RefreshCw,
  Layers,
  Zap,
  Info,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  WarpPortalConfig,
  WarpShipCandidate,
  DEFAULT_WARP_PORTAL_CONFIG,
  CraftModelType,
  GlowColorType,
} from '@/types/warpPortal';

interface AdminWarpPortalTabProps {
  authToken?: string;
}

export function AdminWarpPortalTab({ authToken }: AdminWarpPortalTabProps) {
  const [config, setConfig] = useState<WarpPortalConfig>(DEFAULT_WARP_PORTAL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<WarpShipCandidate | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formSquad, setFormSquad] = useState('');
  const [formCraftModel, setFormCraftModel] = useState<CraftModelType>('battleship');
  const [formGlowColor, setFormGlowColor] = useState<GlowColorType>('amber');
  const [formActive, setFormActive] = useState(true);

  // Test Warp Jump trigger
  const [isTestTriggered, setIsTestTriggered] = useState(false);

  // Load config on mount
  useEffect(() => {
    async function loadConfig() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const headers: Record<string, string> = {};
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const res = await fetch('/api/admin/portal-warp', { headers });
        const data = await res.json();
        if (res.ok && data.config) {
          setConfig(data.config);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load warp portal configuration.');
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, [authToken]);

  const handleOpenAddModal = () => {
    setEditingCandidate(null);
    setFormName('');
    setFormRole('');
    setFormSquad('');
    setFormCraftModel('battleship');
    setFormGlowColor('amber');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: WarpShipCandidate) => {
    setEditingCandidate(c);
    setFormName(c.name);
    setFormRole(c.role);
    setFormSquad(c.squad);
    setFormCraftModel(c.craftModel);
    setFormGlowColor(c.glowColor);
    setFormActive(c.active);
    setIsModalOpen(true);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCandidate) {
      // Update existing
      setConfig((prev) => ({
        ...prev,
        candidates: prev.candidates.map((c) =>
          c.id === editingCandidate.id
            ? {
                ...c,
                name: formName.trim(),
                role: formRole.trim() || 'Crew Member',
                squad: formSquad.trim() || 'Collegiate Network',
                craftModel: formCraftModel,
                glowColor: formGlowColor,
                active: formActive,
              }
            : c
        ),
      }));
    } else {
      // Add new
      const newCandidate: WarpShipCandidate = {
        id: `ship-${Date.now()}`,
        name: formName.trim(),
        role: formRole.trim() || 'Crew Member',
        squad: formSquad.trim() || 'Collegiate Network',
        craftModel: formCraftModel,
        glowColor: formGlowColor,
        active: formActive,
      };
      setConfig((prev) => ({
        ...prev,
        candidates: [newCandidate, ...prev.candidates],
      }));
    }

    setIsModalOpen(false);
  };

  const handleDeleteCandidate = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      candidates: prev.candidates.filter((c) => c.id !== id),
    }));
  };

  const handleToggleActive = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      ),
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/portal-warp', {
        method: 'POST',
        headers,
        body: JSON.stringify({ config }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save configuration.');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Broadcast storage event for real-time landing page synchronization
      if (typeof window !== 'undefined') {
        localStorage.setItem('kollabrix_portal_warp_config', JSON.stringify(config));
        window.dispatchEvent(new CustomEvent('kollabrix:portal-warp-update', { detail: config }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWarpJump = () => {
    setIsTestTriggered(true);
    setTimeout(() => setIsTestTriggered(false), 2500);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kollabrix:test-warp-jump', {
          detail: {
            candidate: config.candidates.find((c) => c.active) || config.candidates[0],
          },
        })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 animate-pulse max-w-6xl mx-auto">
        <div className="h-10 bg-charcoal-900 rounded-xl w-64" />
        <div className="h-44 bg-charcoal-900 rounded-2xl" />
        <div className="h-96 bg-charcoal-900/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-charcoal-900 via-charcoal-900/90 to-charcoal-950 border border-charcoal-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>3D Dimensional Gate &amp; Spacecraft Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Admin Warp Gate &amp; Teammate Controls</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Full authoritative control over the 3D concentric spark rings (Image 3 reference), craft models, and collegiate names/objects that fly through the portal on the homepage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestWarpJump}
              className={`border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-bold gap-2 ${
                isTestTriggered ? 'ring-2 ring-amber-400 bg-amber-500/20' : ''
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-amber-400" />
              <span>{isTestTriggered ? 'Warp Fired!' : 'Test 3D Warp Jump'}</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-black text-xs gap-1.5 shadow-lg shadow-amber-500/20"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved Live!' : 'Save All Changes'}</span>
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Global Portal Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Enable / Disable */}
        <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Gate Status</label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {config.enabled ? 'Active on Homepage' : 'Paused / Hidden'}
            </span>
            <button
              type="button"
              onClick={() => setConfig((p) => ({ ...p, enabled: !p.enabled }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                config.enabled ? 'bg-amber-500' : 'bg-charcoal-800'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Warp Interval */}
        <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Warp Frequency</label>
            <span className="text-xs font-mono font-bold text-amber-400">
              Every {config.intervalSeconds}s
            </span>
          </div>
          <input
            type="range"
            min={6}
            max={35}
            step={1}
            value={config.intervalSeconds}
            onChange={(e) =>
              setConfig((p) => ({ ...p, intervalSeconds: parseInt(e.target.value) || 12 }))
            }
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Multi-Ring Gate (Image 3) */}
        <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">3D Concentric Rings</label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Triple Depth Rings</span>
            <button
              type="button"
              onClick={() => setConfig((p) => ({ ...p, multiRingGate: !p.multiRingGate }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                config.multiRingGate ? 'bg-cyan-500' : 'bg-charcoal-800'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  config.multiRingGate ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Lightning Arcs (Image 3) */}
        <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">Electric Plasma Arcs</label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Lightning Across Rings</span>
            <button
              type="button"
              onClick={() => setConfig((p) => ({ ...p, lightningArcs: !p.lightningArcs }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                config.lightningArcs ? 'bg-cyan-500' : 'bg-charcoal-800'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  config.lightningArcs ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Roster of Names & Objects passing through the gate */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-amber-400" />
              <span>Configured Warp Voyagers &amp; Spacecraft ({config.candidates.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These are the names, squads, and ship classes that will emerge in 3D through the portal on the homepage.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenAddModal}
            className="border-charcoal-700 hover:border-amber-500/50 text-white text-xs font-bold gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add New Teammate / Object</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {config.candidates.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                c.active
                  ? 'bg-charcoal-950 border-charcoal-800 hover:border-charcoal-700'
                  : 'bg-charcoal-950/40 border-charcoal-800/40 opacity-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        c.active ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                    <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                      c.craftModel === 'battleship'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : c.craftModel === 'cruiser'
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                        : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                    }`}
                  >
                    {c.craftModel}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                  {c.role}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                  {c.squad}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-charcoal-800/60">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3 h-3 rounded-full border ${
                      c.glowColor === 'amber'
                        ? 'bg-amber-500 border-amber-300'
                        : c.glowColor === 'cyan'
                        ? 'bg-cyan-400 border-cyan-200'
                        : c.glowColor === 'purple'
                        ? 'bg-purple-500 border-purple-300'
                        : 'bg-emerald-400 border-emerald-200'
                    }`}
                    title={`Glow: ${c.glowColor}`}
                  />
                  <span className="text-[10px] text-slate-400 font-mono capitalize">
                    {c.glowColor}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(c.id)}
                    className="p-1.5 rounded-lg hover:bg-charcoal-800 text-slate-400 hover:text-white transition-colors"
                    title={c.active ? 'Disable' : 'Enable'}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(c)}
                    className="p-1.5 rounded-lg hover:bg-charcoal-800 text-slate-400 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCandidate(c.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Voyager Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCandidate ? 'Edit Warp Voyager / Object' : 'Add New Voyager to 3D Gate'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCandidate} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Voyager / Object Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. Mayank Goyal, Team Titans, Dreadnought-IX"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Role / Tagline
              </label>
              <Input
                type="text"
                placeholder="e.g. AI/ML Architect"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Squad / Campus
              </label>
              <Input
                type="text"
                placeholder="e.g. Campus Turing"
                value={formSquad}
                onChange={(e) => setFormSquad(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                3D Craft Model
              </label>
              <select
                value={formCraftModel}
                onChange={(e) => setFormCraftModel(e.target.value as CraftModelType)}
                className="w-full h-10 px-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-xs text-white"
              >
                <option value="battleship">Heavy Battleship (Image 3)</option>
                <option value="cruiser">Stellar Cruiser</option>
                <option value="interceptor">Kinetic Interceptor</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Engine Plasma Glow
              </label>
              <select
                value={formGlowColor}
                onChange={(e) => setFormGlowColor(e.target.value as GlowColorType)}
                className="w-full h-10 px-3 rounded-xl bg-charcoal-900 border border-charcoal-700 text-xs text-white"
              >
                <option value="amber">Amber / Gold Fire</option>
                <option value="cyan">Electric Cyan / Blue (Image 3)</option>
                <option value="purple">Cosmic Purple</option>
                <option value="emerald">Aurora Emerald</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="craftActive"
              checked={formActive}
              onChange={(e) => setFormActive(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <label htmlFor="craftActive" className="text-xs text-slate-300 cursor-pointer">
              Active (Included in random warp jump rotation)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-charcoal-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold"
            >
              {editingCandidate ? 'Update Voyager' : 'Add to Gate Rotation'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
