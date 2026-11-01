'use client';

import { useEffect, useState } from "react";
import { Cpu, PowerOff, Navigation, AlertCircle } from "lucide-react";

export default function RoverReplanningDashboard() {
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/rover-plan")
      .then((res) => res.json())
      .then((json) => setPlan(json))
      .catch((err) => console.error("Error loading rover plan:", err));
  }, []);

  if (!plan) return null;

  const currentAction = plan.schedule?.[0];

  const getActionIcon = (action: string) => {
    switch (action) {
      case "SAFE_MODE_SHUTDOWN": return <PowerOff className="w-6 h-6 text-red-400" />;
      case "RESTRICTED_MOVEMENT": return <AlertCircle className="w-6 h-6 text-yellow-400" />;
      case "NOMINAL_OPERATIONS": return <Navigation className="w-6 h-6 text-green-400" />;
      default: return <Cpu className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white shadow-2xl">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
        <Cpu className="w-5 h-5 text-indigo-400" />
        AI Rover Auto-Pilot
      </h2>
      <p className="text-xs text-gray-400 mb-4">Dynamically adapting to Space Weather</p>

      {currentAction && (
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-4 flex items-start gap-3">
          <div className="mt-1 bg-black/50 p-2 rounded-full">
            {getActionIcon(currentAction.rover_action)}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Current Command</p>
            <p className="font-bold text-md text-white">{currentAction.rover_action.replace(/_/g, ' ')}</p>
            <p className="text-xs text-gray-300 mt-1">{currentAction.system_reason}</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upcoming Schedule</p>
        <div className="space-y-2">
          {plan.schedule?.slice(1, 4).map((entry: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center text-sm bg-white/5 p-2 rounded">
              <span className="text-gray-300">T+{idx + 1}0 mins</span>
              <span className={`font-bold text-[11px] px-2 py-1 rounded bg-black/50 ${
                entry.rover_action === 'SAFE_MODE_SHUTDOWN' ? 'text-red-400' :
                entry.rover_action === 'NOMINAL_OPERATIONS' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {entry.rover_action.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}