'use client';

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle, ShieldCheck, Activity } from "lucide-react";

export default function UnifiedSolarDashboard() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentRisk, setCurrentRisk] = useState("SAFE");
  const [forecastRange, setForecastRange] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    const fetchForecast = () => {
      fetch(`${process.env.NEXT_PUBLIC_LOMS_API_URL || "http://localhost:5000"}/api/solar-forecast`)
        .then((res) => res.json())
        .then((json) => {
          if (json && json.timeline && json.timeline.length > 0) {
            // Use the REAL timestamps from the data — no fabrication
            const formatted = json.timeline.map((item: any) => ({
              ...item,
              TIME_LABEL: item.FORECAST_TIME.substring(5, 16), // "MM-DD HH:MM"
            }));

            setChartData(formatted);
            setForecastRange({
              start: json.timeline[0].FORECAST_TIME,
              end: json.timeline[json.timeline.length - 1].FORECAST_TIME,
            });

            // Overall risk = highest severity seen anywhere in the run
            const severityOrder = ['SAFE', 'MODERATE', 'HIGH', 'CRITICAL'];
            const worst = json.timeline.reduce((acc: string, item: any) => {
              const cur = item.UNIFIED_RISK || 'SAFE';
              return severityOrder.indexOf(cur) > severityOrder.indexOf(acc) ? cur : acc;
            }, 'SAFE');
            setCurrentRisk(worst);
          }
        })
        .catch((err) => console.error("Error loading forecast:", err));
    };

    fetchForecast();
    const interval = setInterval(fetchForecast, 60000);
    return () => clearInterval(interval);
  }, []);

  const isCritical = currentRisk === "CRITICAL" || currentRisk === "HIGH";

  return (
    <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-2xl space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            LOMS AI Forecast
          </h2>
          <p className="text-[10px] text-gray-400">
            HEL1OS + SOLEXS · Model run for {forecastRange ? forecastRange.start.substring(0, 10) : '...'}
          </p>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
          {isCritical ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {currentRisk} RISK (peak)
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="TIME_LABEL" stroke="#666" fontSize={8} tick={{ fill: '#aaa' }} interval={13} />
            <YAxis stroke="#666" fontSize={10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
              labelStyle={{ color: '#aaa', fontSize: '11px' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Line type="monotone" name="HEL1OS (Hard X-Ray)" dataKey="HEL1OS_FLUX" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" name="SOLEXS (Soft X-Ray)" dataKey="SOLEXS_PREDICTED_FLUX" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {forecastRange && (
        <p className="text-[10px] text-gray-500 text-center">
          Forecast window: {forecastRange.start} → {forecastRange.end} UTC
        </p>
      )}
    </div>
  );
}