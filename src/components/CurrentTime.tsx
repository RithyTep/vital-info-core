
import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function getTimeInGmtPlus7() {
  const now = new Date();
  // get UTC+7 offset in minutes
  const gmt7 = new Date(now.getTime() + (420 - now.getTimezoneOffset()) * 60000);
  return gmt7;
}

const CurrentTime = () => {
  const [time, setTime] = useState(getTimeInGmtPlus7());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeInGmtPlus7());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 border border-gray-200">
      <Clock className="w-5 h-5 text-blue-600" />
      <span className="text-base font-semibold text-gray-800">
        {time.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })}
      </span>
      <span className="text-xs text-gray-500 ml-2">(GMT+7)</span>
    </div>
  );
};

export default CurrentTime;
