"use client";

import React from "react";

export function RecruitmentPipeline() {
  const stages = [
    { label: "Resumes", count: 36 },
    { label: "Interview", count: 12 },
    { label: "Hold", count: 5 },
    { label: "Selected", count: 4 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-gray-900">Recruitment Pipeline</h3>
        </div>
        <p className="text-xs text-gray-400 mb-6">Candidates by current stage</p>
      </div>

      <div className="space-y-4 my-auto">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-none">
            <span className="text-sm text-gray-600 font-medium">{stage.label}</span>
            <span className="text-sm font-bold text-gray-900">{stage.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}