"use client";

import React from "react";

export function AttendanceSnapshot() {
  const days = [
    { day: "Mon", height: "h-24" },
    { day: "Tue", height: "h-28" },
    { day: "Wed", height: "h-32" },
    { day: "Thu", height: "h-36" },
    { day: "Fri", height: "h-32" },
    { day: "Sat", height: "h-40" },
    { day: "Sun", height: "h-36" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-gray-900">Attendance Snapshot</h3>
        </div>
        <p className="text-xs text-gray-400 mb-6">Today</p>
      </div>

      <div className="flex items-end justify-between gap-3 h-48 px-2 pt-4 pb-2">
        {days.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full bg-gray-50 rounded-t-lg flex items-end justify-center h-full">
              <div
                className={`w-full max-w-[36px] bg-indigo-500 rounded-t-md transition-all duration-300 hover:bg-indigo-600 ${item.height}`}
              ></div>
            </div>
            <span className="text-xs text-gray-500 font-medium">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}