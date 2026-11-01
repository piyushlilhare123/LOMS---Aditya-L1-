'use client';

import { Activity, ShieldCheck } from "lucide-react";

export default function SolarEventDetails({ event }: { event?: any }) {
  if (!event) {
    return (
      <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-2xl text-xs text-gray-400">
        Select a solar event to view deep telemetry analysis.
      </div>
    );
  }

  return (
    <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-2xl space-y-3 text-xs">
      <div className="flex justify-between items-center border-b border-white/10 pb-2">
        <h3 className="font-bold text-blue-400 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Event #{event.eventId} Telemetry Details
        </h3>
        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
          {event.loms?.severity || "CRITICAL"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 p-2 rounded">
          <p className="text-gray-400 text-[10px]">Timestamp</p>
          <p className="font-semibold">{event.timestamp}</p>
        </div>
        <div className="bg-white/5 p-2 rounded">
          <p className="text-gray-400 text-[10px]">Priority Score</p>
          <p className="font-semibold text-orange-400">{event.loms?.priorityScore || "N/A"}</p>
        </div>
      </div>

      <div className="bg-white/5 p-2 rounded">
        <p className="text-gray-400 text-[10px] mb-1">Scientific Validation Status</p>
        <p className="flex items-center gap-1 text-green-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          {event.scientific?.scientificallyValidated ? "Verified by AI & Physics Model" : "Pending Verification"}
        </p>
      </div>
    </div>
  );
}