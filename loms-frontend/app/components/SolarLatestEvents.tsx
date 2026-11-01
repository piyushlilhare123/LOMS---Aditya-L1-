'use client';

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export default function SolarLatestEvents() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_LOMS_API_URL || "http://localhost:5000"}/api/solar/events`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          const sorted = [...data.data].sort(
            (a, b) => new Date(b.timing?.peak).getTime() - new Date(a.timing?.peak).getTime()
          );
          setEvents(sorted.slice(0, 5));
        }
      })
      .catch((err) => console.error("Error loading past solar events:", err));
  }, []);

  return (
    <div className="bg-black/85 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-2xl mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-2 text-orange-400">
          <Flame className="w-4 h-4" />
          Validated Past Flares (Stage 26-27)
        </h3>
        <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30">
          Historical Records
        </span>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {events.length > 0 ? (
          events.map((ev: any, idx: number) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-2 rounded text-xs flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-200">Event #{ev.eventId || idx + 1}</p>
                <p className="text-[10px] text-gray-400">
                  {ev.timing?.peak ? new Date(ev.timing.peak).toISOString().substring(0, 16).replace('T', ' ') : "—"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-orange-400 font-bold uppercase">
                  {ev.loms?.severity || "MODERATE"}
                </span>
                <p className="text-[10px] text-green-400">
                  {ev.scientific?.scientificallyValidated ? "Scientifically Validated" : "AI Detected"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-400 text-center py-3 bg-white/5 rounded">
            Loading past solar records...
          </div>
        )}
      </div>
    </div>
  );
}