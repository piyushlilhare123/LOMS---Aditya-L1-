"use client";

import { useEffect, useState } from "react";

import {
  getCriticalSolarEvents,
  SolarEvent,
} from "../utils/solarApi";

function formatProbability(
  value: number
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00%";
  }

  return `${(number * 100).toFixed(2)}%`;
}

function formatTime(value: string) {
  if (!value) {
    return "Time unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return date.toLocaleString();
}

export default function SolarCriticalAlert() {
  const [event, setEvent] =
    useState<SolarEvent | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCritical() {
      try {
        const data =
          await getCriticalSolarEvents();

        if (!mounted) return;

        const critical =
          data
            .filter(
              (item) =>
                item.severity ===
                  "CRITICAL" ||
                item.severity === "HIGH"
            )
            .sort(
              (a, b) =>
                b.priorityScore -
                a.priorityScore
            )[0] || null;

        setEvent(critical);
        setError(null);
      } catch (err) {
        console.error(
          "Solar critical alert error:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load solar alert"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCritical();

    const interval = setInterval(
      loadCritical,
      30000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-[420px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-red-500/30 bg-[#110508]/95 text-white shadow-[0_20px_80px_rgba(80,0,0,0.35)] backdrop-blur-2xl">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-red-500/15 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-300">
            ✹
          </div>

          <div>
            <div className="text-sm font-bold tracking-wider text-orange-200">
              SOLAR FLARE ALERT
            </div>

            <div className="mt-0.5 text-[9px] tracking-wider text-white/30">
              LOMS CRITICAL MONITOR
            </div>
          </div>
        </div>

        <span className="h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
      </div>

      {/* BODY */}
      <div className="p-5">
        {loading && (
          <div className="py-8 text-center text-xs text-white/40">
            Checking critical solar activity...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          !event && (
            <div className="py-8 text-center">
              <div className="text-sm font-semibold text-emerald-300">
                No active critical alert
              </div>

              <div className="mt-1 text-[10px] text-white/30">
                LOMS monitoring is active
              </div>
            </div>
          )}

        {!loading &&
          !error &&
          event && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[10px] font-bold tracking-wider text-white/30">
                  EVENT #{event.eventId}
                </div>

                <div className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[9px] font-bold tracking-wider text-red-300">
                  {event.severity}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-white/5 bg-white/[0.035] p-3">
                  <div className="text-[9px] font-bold tracking-wider text-white/30">
                    FLARE PROBABILITY
                  </div>

                  <div className="mt-2 text-base font-bold text-white">
                    {formatProbability(
                      event.flareProbability
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.035] p-3">
                  <div className="text-[9px] font-bold tracking-wider text-white/30">
                    CONFIDENCE
                  </div>

                  <div className="mt-2 text-xs font-bold text-white">
                    {event.confidence ||
                      "UNKNOWN"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.035] p-3">
                  <div className="text-[9px] font-bold tracking-wider text-white/30">
                    STRENGTH
                  </div>

                  <div className="mt-2 text-xs font-bold text-white">
                    {event.strength ||
                      "UNKNOWN"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.035] p-3">
                  <div className="text-[9px] font-bold tracking-wider text-white/30">
                    MORPHOLOGY
                  </div>

                  <div className="mt-2 truncate text-xs font-bold text-white">
                    {event.morphology ||
                      "UNKNOWN"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.035] p-3">
                  <div className="text-[9px] font-bold tracking-wider text-white/30">
                    PRIORITY
                  </div>

                  <div className="mt-2 text-xs font-bold text-white">
                    {Number.isFinite(
                      Number(
                        event.priorityScore
                      )
                    )
                      ? Number(
                          event.priorityScore
                        ).toFixed(3)
                      : "0.000"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.035] p-3">
                  <div className="text-[9px] font-bold tracking-wider text-white/30">
                    TYPE
                  </div>

                  <div className="mt-2 truncate text-xs font-bold text-white">
                    {event.eventType ||
                      "UNKNOWN"}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-red-500/10 pt-3">
                <div className="text-[9px] font-bold tracking-wider text-white/25">
                  PEAK TIME
                </div>

                <div className="mt-1 text-[10px] text-white/60">
                  {formatTime(event.peak)}
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
}