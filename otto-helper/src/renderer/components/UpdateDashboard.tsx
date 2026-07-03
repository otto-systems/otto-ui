import { useEffect, useMemo } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateConfig, UpdateHistoryItem, UpdateState } from '../../shared/types';
import {
  approve,
  checkNow,
  defer,
  getConfig,
  getHistory,
  getProgress,
  getState,
  setConfig,
} from '../services/ottoApi';
import { useUiStore } from '../state/uiStore';

const DEFER_OPTIONS: Array<{ label: string; seconds: 3600 | 14400 | 86400 | 604800 }> = [
  { label: '1h', seconds: 3600 },
  { label: '4h', seconds: 14400 },
  { label: '24h', seconds: 86400 },
  { label: '7d', seconds: 604800 },
];

const stateClasses: Record<string, string> = {
  idle: 'bg-slate-700 text-slate-100',
  checking: 'bg-cyan-700 text-cyan-50',
  update_available: 'bg-blue-700 text-blue-50',
  downloading: 'bg-indigo-700 text-indigo-50',
  applying: 'bg-amber-700 text-amber-50',
  error: 'bg-rose-700 text-rose-50',
};

const historyOutcomeClasses: Record<UpdateHistoryItem['outcome'], string> = {
  applied: 'bg-emerald-700 text-emerald-50',
  deferred: 'bg-amber-700 text-amber-50',
  blocked: 'bg-rose-700 text-rose-50',
  failed: 'bg-red-700 text-red-50',
  rolled_back: 'bg-orange-700 text-orange-50',
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleString();
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function normalizePhase(phase: string): UpdateState['phase'] {
  switch (phase.toLowerCase()) {
    case 'downloading':
      return 'downloading';
    case 'applying':
      return 'applying';
    case 'checking':
      return 'checking';
    case 'update_available':
    case 'approved':
    case 'ready_to_apply':
    case 'policy_evaluating':
      return 'update_available';
    case 'failed':
    case 'error':
    case 'blocked':
      return 'error';
    case 'idle':
    default:
      return 'idle';
  }
}

export function UpdateDashboard(): JSX.Element {
  const queryClient = useQueryClient();
  const settingsOpen = useUiStore((state) => state.settingsOpen);
  const setSettingsOpen = useUiStore((state) => state.setSettingsOpen);
  const selectedDeferSeconds = useUiStore((state) => state.selectedDeferSeconds);
  const setSelectedDeferSeconds = useUiStore((state) => state.setSelectedDeferSeconds);
  const configDraft = useUiStore((state) => state.configDraft);
  const setConfigDraft = useUiStore((state) => state.setConfigDraft);
  const patchConfigDraft = useUiStore((state) => state.patchConfigDraft);

  const stateQuery = useQuery({
    queryKey: ['otto', 'state'],
    queryFn: getState,
    refetchInterval: 5000,
  });

  const historyQuery = useQuery({
    queryKey: ['otto', 'history'],
    queryFn: getHistory,
    staleTime: 15000,
  });

  const configQuery = useQuery({
    queryKey: ['otto', 'config'],
    queryFn: getConfig,
    staleTime: 15000,
  });

  const phase = normalizePhase(stateQuery.data?.phase ?? 'idle');

  const progressQuery = useQuery({
    queryKey: ['otto', 'progress'],
    queryFn: getProgress,
    refetchInterval: 3000,
    enabled: phase === 'downloading',
  });

  useEffect(() => {
    if (configQuery.data) {
      setConfigDraft(configQuery.data);
    }
  }, [configQuery.data, setConfigDraft]);

  const checkNowMutation = useMutation({
    mutationFn: checkNow,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['otto', 'state'] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (checkId: string) => approve({ checkId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['otto', 'state'] });
    },
  });

  const deferMutation = useMutation({
    mutationFn: (checkId: string) =>
      defer({
        checkId,
        deferSeconds: selectedDeferSeconds,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['otto', 'state'] });
    },
  });

  const saveConfigMutation = useMutation({
    mutationFn: (patch: Partial<UpdateConfig>) => setConfig(patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['otto', 'config'] });
      setSettingsOpen(false);
    },
  });

  const lastCheck = stateQuery.data?.lastCheckAt ? formatDate(stateQuery.data.lastCheckAt) : 'Unknown';
  const currentVersion = stateQuery.data?.currentVersion ?? 'Unknown';

  const updateAvailable = phase === 'update_available';
  const isDownloading = phase === 'downloading';

  const latestHistory = useMemo(() => {
    return historyQuery.data?.items.slice(0, 10) ?? [];
  }, [historyQuery.data?.items]);

  const currentCheckId = stateQuery.data?.deviceState?.deviceId;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6 md:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">OttoHelper</p>
              <h1 className="mt-1 text-2xl font-semibold">Update Dashboard</h1>
              <p className="mt-2 text-sm text-slate-300">Current version: {currentVersion}</p>
              <p className="text-sm text-slate-400">Last check: {lastCheck}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${stateClasses[phase] ?? stateClasses.idle}`}
              >
                {capitalize(phase.replace('_', ' '))}
              </span>
              <button
                type="button"
                className="rounded-md bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-cyan-400 disabled:opacity-50"
                onClick={() => checkNowMutation.mutate()}
                disabled={checkNowMutation.isPending}
              >
                Check Now
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-600 px-3 py-2 text-xs font-semibold hover:bg-slate-800"
                onClick={() => setSettingsOpen(true)}
              >
                Settings
              </button>
            </div>
          </div>
        </motion.header>

        <AnimatePresence initial={false}>
          {updateAvailable ? (
            <motion.section
              key="available-update"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-blue-700 bg-blue-900/20 p-5"
            >
              <h2 className="text-lg font-semibold text-blue-100">Available Update</h2>
              <p className="mt-2 text-sm text-blue-100/90">
                New version: {stateQuery.data?.availableVersion ?? stateQuery.data?.activeManifest?.version ?? 'Unknown'}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {DEFER_OPTIONS.map((option) => (
                  <button
                    key={option.seconds}
                    type="button"
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      selectedDeferSeconds === option.seconds
                        ? 'bg-blue-300 text-blue-900'
                        : 'bg-blue-950 text-blue-200'
                    }`}
                    onClick={() => setSelectedDeferSeconds(option.seconds)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-50"
                  onClick={() => {
                    if (currentCheckId) {
                      approveMutation.mutate(currentCheckId);
                    }
                  }}
                  disabled={!currentCheckId || approveMutation.isPending}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="rounded-md bg-amber-400 px-3 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-300 disabled:opacity-50"
                  onClick={() => {
                    if (currentCheckId) {
                      deferMutation.mutate(currentCheckId);
                    }
                  }}
                  disabled={!currentCheckId || deferMutation.isPending}
                >
                  Defer
                </button>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {isDownloading ? (
            <motion.section
              key="download-progress"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-indigo-700 bg-indigo-900/20 p-5"
            >
              <h2 className="text-lg font-semibold text-indigo-100">Downloading</h2>
              <p className="mt-1 text-sm text-indigo-200">
                {progressQuery.data?.bytesReceived ?? 0} / {progressQuery.data?.totalBytes ?? 0} bytes
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-indigo-950">
                <div
                  className="h-full bg-indigo-300 transition-all"
                  style={{ width: `${progressQuery.data?.percent ?? 0}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-indigo-200">ETA: {progressQuery.data?.etaSeconds ?? 'Unknown'} sec</p>
              <button
                type="button"
                className="mt-3 rounded-md border border-indigo-500 px-3 py-1 text-xs font-medium text-indigo-100 opacity-60"
                disabled
              >
                Cancel
              </button>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold">Update History</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-slate-300">
                <tr>
                  <th className="pb-2">Version</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {latestHistory.map((item) => (
                  <tr key={item.id} className="border-t border-slate-800">
                    <td className="py-2">{item.version}</td>
                    <td className="py-2 text-slate-300">{formatDate(item.occurredAt)}</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${historyOutcomeClasses[item.outcome]}`}
                      >
                        {capitalize(item.outcome.replace('_', ' '))}
                      </span>
                    </td>
                  </tr>
                ))}
                {latestHistory.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-400" colSpan={3}>
                      No history entries found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {settingsOpen && configDraft ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 bg-slate-950/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed right-0 top-0 h-full w-full max-w-md border-l border-slate-700 bg-slate-900 p-6"
            >
              <h2 className="text-xl font-semibold">Settings</h2>
              <div className="mt-5 space-y-4 text-sm">
                <label className="block">
                  <span className="mb-1 block text-slate-300">Channel</span>
                  <select
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
                    value={configDraft.channel}
                    onChange={(event) => patchConfigDraft({ channel: event.target.value as UpdateConfig['channel'] })}
                  >
                    <option value="stable">stable</option>
                    <option value="beta">beta</option>
                    <option value="canary">canary</option>
                    <option value="lts">lts</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-slate-300">Check Interval (seconds)</span>
                  <input
                    type="number"
                    min={10}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
                    value={configDraft.checkIntervalSeconds}
                    onChange={(event) => patchConfigDraft({ checkIntervalSeconds: Number(event.target.value) })}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-slate-300">Max Deferred Days</span>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
                    value={configDraft.maxDeferredDays}
                    onChange={(event) => patchConfigDraft({ maxDeferredDays: Number(event.target.value) })}
                  />
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={configDraft.autoCheckEnabled}
                    onChange={(event) => patchConfigDraft({ autoCheckEnabled: event.target.checked })}
                  />
                  <span>Enable Automatic Checks</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={configDraft.allowMeteredDownload}
                    onChange={(event) => patchConfigDraft({ allowMeteredDownload: event.target.checked })}
                  />
                  <span>Allow Metered Download</span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-700 px-3 py-2 text-sm"
                  onClick={() => setSettingsOpen(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
                  onClick={() => {
                    if (configDraft) {
                      saveConfigMutation.mutate(configDraft);
                    }
                  }}
                  disabled={saveConfigMutation.isPending}
                >
                  Save
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
