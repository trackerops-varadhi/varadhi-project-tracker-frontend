"use client";

import React from "react";

export default function LeaveOverview() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-gray-900">Leave Overview</h3>
        </div>
        <p className="text-xs text-gray-400 mb-6">Planned vs unplanned</p>
      </div>

      <div className="space-y-5 my-auto">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 w-24">Planned</span>
          <div className="flex-1 mx-4 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full w-[85%]"></div>
          </div>
          <span className="text-sm font-semibold text-gray-800 w-6 text-right">12</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 w-24">Unplanned</span>
          <div className="flex-1 mx-4 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-[45%]"></div>
          </div>
          <span className="text-sm font-semibold text-gray-800 w-6 text-right">6</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 w-24">Pending</span>
          <div className="flex-1 mx-4 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full w-[25%]"></div>
          </div>
          <span className="text-sm font-semibold text-gray-800 w-6 text-right">3</span>
        </div>
      </div>
    </div>
  );
}