
import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const MiniCalendar = () => {
  const today = new Date();

  return (
    <div className="flex items-center bg-blue-50 rounded-lg p-3 mt-4">
      <CalendarIcon className="w-6 h-6 text-blue-500 mr-2" />
      <div>
        <div className="text-xs text-gray-500">Today</div>
        <div className="text-lg font-bold text-blue-700">
          {format(today, "EEEE")}
        </div>
        <div className="text-md text-gray-700">
          {format(today, "dd MMM yyyy")}
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
