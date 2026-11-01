"use client";

import { useEffect, useState } from "react";
import {
  getSolarSummary,
  SolarSummary,
} from "../utils/solarApi";

export default function SolarActivityPanel() {
  const [summary, setSummary] =
    useState<SolarSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const data =
          await getSolarSummary();

        if (!mounted) return;

        setSummary(data);
        setError(null);
      } catch (err) {
        console.error(
          "Solar summary error:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load solar activity"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    const interval = setInterval(
      loadSummary,
      30000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-[390px] max-w-[calc(100vw-32px)] rounded-2xl border border-white/10 bg-black/80 p-5 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">☀</span>

          <span className="text-sm font-bold tracking-widest">
            SOLAR ACTIVITY
          </span>

          <span className="ml-auto rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400">
            LIVE
          </span>
        </div>

        <div className="mt-8 text-center text-xs text-white/40">
          Loading SOLEXS intelligence...
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="w-[390px] max-w-[calc(100vw-32px)] rounded-2xl border border-red-500/20 bg-black/80 p-5 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">☀</span>

          <span className="text-sm font-bold tracking-widest">
            SOLAR ACTIVITY
          </span>
        </div>

        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300">
          {error || "Solar data unavailable"}
        </div>
      </div>
    );
  }

  const severityEntries =
    Object.entries(
      summary.severityDistribution || {}
    ).sort(
      ([, a], [, b]) => b - a
    );

  return (
    <div className="w-[390px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-white/10 bg-[#07070c]/95 text-white shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-300">
            ☀
          </div>

          <div>
            <div className="text-sm font-bold tracking-widest">
              SOLAR ACTIVITY
            </div>

            <div className="mt-0.5 text-[10px] text-white/35">
              SOLEXS INTELLIGENCE
            </div>
          </div>
        </div>

        <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-400">
          LIVE
        </div>
      </div>

      {/* MAIN STATS */}
      <div className="grid grid-cols-3 gap-2.5 p-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.035] p-3">
          <div className="text-xl font-bold tracking-tight">
            {summary.totalEvents.toLocaleString()}
          </div>

          <div className="mt-1 text-[9px] font-semibold tracking-wider text-white/35">
            TOTAL EVENTS
          </div>
        </div>

        <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.06] p-3">
          <div className="text-xl font-bold tracking-tight">
            {summary.scientificallyValidatedEvents.toLocaleString()}
          </div>

          <div className="mt-1 text-[9px] font-semibold tracking-wider text-white/35">
            VALIDATED
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.035] p-3">
          <div className="text-xl font-bold tracking-tight">
            {summary.mlOnlyCandidates.toLocaleString()}
          </div>

          <div className="mt-1 text-[9px] font-semibold tracking-wider text-white/35">
            ML CANDIDATES
          </div>
        </div>
      </div>

      {/* SEVERITY */}
      <div className="px-4 pb-4">
        <div className="mb-3 text-[10px] font-bold tracking-[0.18em] text-white/35">
          SEVERITY DISTRIBUTION
        </div>

        <div className="space-y-1.5">
          {severityEntries.map(
            ([severity, count]) => {
              const max =
                severityEntries[0]?.[1] || 1;

              const width =
                Math.max(
                  4,
                  (count / max) * 100
                );

              return (
                <div
                  key={severity}
                  className="relative overflow-hidden rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-white/[0.035]"
                    style={{
                      width: `${width}%`,
                    }}
                  />

                  <div className="relative flex items-center justify-between">
                    <span className="text-[10px] font-semibold">
                      {severity}
                    </span>

                    <span className="text-[10px] font-bold text-white/80">
                      {count.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* MODEL */}
      <div className="border-t border-white/10 px-5 py-4">
        <div className="text-[9px] font-bold tracking-[0.18em] text-white/30">
          MODEL
        </div>

        <div className="mt-1 truncate text-xs font-semibold text-white/80">
          {summary.model.type}
        </div>

        <div className="mt-1 text-[10px] text-white/35">
          {summary.model.trees} trees · threshold{" "}
          {summary.model.threshold}
        </div>
      </div>
    </div>
  );
}