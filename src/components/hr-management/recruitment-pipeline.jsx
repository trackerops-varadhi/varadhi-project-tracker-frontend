"use client";

import React from "react";
import { Card } from '@/components/ui/card'

export function RecruitmentPipeline() {
  const stages = [
    { label: "Resumes", count: 36 },
    { label: "Interview", count: 12 },
    { label: "Hold", count: 5 },
    { label: "Selected", count: 4 },
  ];

  return (
    <Card asChild layout="custom">
      <section
        aria-labelledby="recruitment-pipeline-title"
        className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <h2
              id="recruitment-pipeline-title"
              className="text-xs font-semibold text-slate-900"
            >
              Recruitment Pipeline
            </h2>

            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
              Candidates by current status
            </p>
          </div>

          <p className="text-xs text-gray-400">
            Candidates by current stage
          </p>
        </div>

        <div className="my-auto space-y-4">
          {stages.map((stage, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-gray-50 py-1.5 last:border-none"
            >
              <span className="text-sm font-medium text-gray-600">
                {stage.label}
              </span>

              <span className="text-sm font-bold text-gray-900">
                {stage.count}
              </span>
            </div>
          ))}
        </div>
      </section>
    </Card>
  )
}