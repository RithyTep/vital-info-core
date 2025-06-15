import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// Get current time in Cambodia Timezone (Asia/Phnom_Penh)
function getTimeInCambodia() {
  return new Date();
}

const CurrentTime = () => {
  const [time, setTime] = useState(getTimeInCambodia());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeInCambodia());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 border border-gray-200">
      <Clock className="w-5 h-5 text-blue-600" />
      <span className="text-base font-semibold text-gray-800">
        {time.toLocaleTimeString("en-US", {
          hour12: true, // Use 12-hour format
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Phnom_Penh",
        })}
      </span>
      <span className="text-xs text-gray-500 ml-2">(Cambodia GMT+7)</span>
    </div>
  );
};

export default CurrentTime;
