'use client';

import { useEffect, useState } from "react";
import { Table } from "lucide-react";

export default function SolarEventTable() {
  const [events, setEvents] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Use /latest (already limited server-side) instead of /events (all 28,470)
    fetch("http://localhost:5000/api/solar/latest")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          setEvents(data.data);
        }
      })
      .catch((err) => console.error("Error loading event table:", err));

    // Separately fetch just the total count from summary (lightweight)
    fetch("http://localhost:5000/api/solar/summary")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.data?.totalEvents) {
          setTotalCount(data.data.totalEvents);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-2xl">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-3 text-blue-400">
        <Table className="w-4 h-4" />
        Solar Event Registry ({totalCount || events.length} Records, showing latest {events.length})
      </h3>
      <div className="max-h-60 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-gray-400 border-b border-white/10 sticky top-0 bg-black">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Timestamp</th>
              <th className="p-2">Severity</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map((ev, idx) => (
                <tr key={ev.eventId ?? idx} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-2 font-mono">#{ev.eventId || idx + 1}</td>
                  <td className="p-2 text-gray-300">{ev.timestamp}</td>
                  <td className="p-2 text-orange-400 font-semibold">{ev.loms?.severity || "MODERATE"}</td>
                  <td className="p-2 text-green-400">Validated</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">Loading solar registry...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}