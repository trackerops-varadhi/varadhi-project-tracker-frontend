"use client";

import React from "react";
import { Card } from '@/components/ui/card'

export default function LeaveOverview() {
  return (
    <Card asChild layout="custom">
      <section
        aria-labelledby="leave-overview-title"
        className="flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <h2
              id="leave-overview-title"
              className="text-xs font-semibold text-slate-900"
            >
              Leave Overview
            </h2>

            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
              Today / leave breakdown
            </p>
          </div>

          <p className="text-xs text-gray-400">
            Planned vs unplanned
          </p>
        </div>

        <div className="my-auto space-y-5">
          <div className="flex items-center justify-between">
            <span className="w-24 text-sm text-gray-600">
              Planned
            </span>

            <div className="mx-4 h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-[85%] rounded-full bg-primary" />
            </div>

            <span className="w-6 text-right text-sm font-semibold text-gray-800">
              12
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="w-24 text-sm text-gray-600">
              Unplanned
            </span>

            <div className="mx-4 h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-[45%] rounded-full bg-amber-500" />
            </div>

            <span className="w-6 text-right text-sm font-semibold text-gray-800">
              6
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="w-24 text-sm text-gray-600">
              Pending
            </span>

            <div className="mx-4 h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-[25%] rounded-full bg-cyan-400" />
            </div>

            <span className="w-6 text-right text-sm font-semibold text-gray-800">
              3
            </span>
          </div>
        </div>

        <p className="text-[10px] leading-4 text-slate-500">
          Pending requests await admin or manager approval.
        </p>
      </section>
    </Card>
  )
}