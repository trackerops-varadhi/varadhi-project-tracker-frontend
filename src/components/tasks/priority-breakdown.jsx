'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { tasksApi } from '@/lib/api/tasks.api';

const TILES = [{
  key: 'high',
  label: 'High',
  includes: ['high', 'critical'],
  wrapper: 'border-red-100 bg-red-50',
  labelText: 'text-red-600',
  dot: 'bg-red-500',
  pctText: 'text-red-500',
  href: '/tasks?priority=high'
}, {
  key: 'medium',
  label: 'Medium',
  includes: ['medium'],
  wrapper: 'border-yellow-100 bg-yellow-50',
  labelText: 'text-yellow-700',
  dot: 'bg-yellow-500',
  pctText: 'text-yellow-600',
  href: '/tasks?priority=medium'
}, {
  key: 'low',
  label: 'Low',
  includes: ['low'],
  wrapper: 'border-green-100 bg-green-50',
  labelText: 'text-green-700',
  dot: 'bg-green-500',
  pctText: 'text-green-600',
  href: '/tasks?priority=low'
}];

function Shell({ children }) {
  return (
    <Card
      className='flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='mb-1.5 flex shrink-0 items-center justify-between gap-2'>
        <h3 className='min-w-0 truncate text-sm font-semibold text-slate-800'>Priority Breakdown</h3>
        <Link href='/tasks' className='shrink-0 whitespace-nowrap text-xs font-medium text-violet-600 hover:underline'>View Details</Link>
      </div>
      <div className='min-h-0 min-w-0 flex-1 overflow-auto custom-scrollbar'>
        {children}
      </div>
    </Card>
  );
}

export function PriorityBreakdown() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await tasksApi.getPriorityBreakdown();

        if (!cancelled) {
          setData(result);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load priority breakdown.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
           LOADING
        ====================================================== */

  if (isLoading) {
    return (
      <Shell>
        <div className='grid h-full min-w-0 grid-cols-3 gap-1.5'>
          {[0, 1, 2].map(i => (<div key={i} className='h-full min-h-[100px] animate-pulse rounded-lg bg-slate-100' />))}
        </div>
      </Shell>
    );
  }

  /* =====================================================
           ERROR
        ====================================================== */

  if (error) {
    return (
      <Shell>
        <div className='flex h-full items-center'>
          <p className='text-xs text-slate-500'>
            {error}
          </p>
        </div>
      </Shell>
    );
  }

  const byPriority = Object.fromEntries((data?.priorities ?? []).map(p => [p.priority, p]));
  const total = data?.total ?? 0;

  /* =====================================================
           EMPTY
        ====================================================== */

  if (total === 0) {
    return (
      <Shell>
        <div className='flex h-full items-center'>
          <p className='text-xs text-slate-500'>No tasks yet.</p>
        </div>
      </Shell>
    );
  }

  /* =====================================================
           DATA
        ====================================================== */

  return (
    <Shell>
      <div className='grid h-full min-h-0 min-w-0 grid-cols-3 gap-1.5'>
        {TILES.map(tile => {
          const count = tile.includes.reduce((sum, level) => sum + (byPriority[level]?.count ?? 0), 0);
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <Link
              key={tile.key}
              href={tile.href}
              className={`flex min-h-[100px] min-w-0 flex-col justify-between overflow-hidden rounded-lg border px-2 py-1.5 transition hover:brightness-95 ${tile.wrapper}`}>
              <div className='flex min-w-0 items-center gap-1'>
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${tile.dot}`} />
                <p
                  className={`min-w-0 truncate text-xs font-medium ${tile.labelText}`}>
                  {tile.label}
                </p>
              </div>
              <div className='flex min-w-0 flex-wrap items-end justify-between gap-1'>
                <h4 className='min-w-0 truncate text-[18px] font-bold leading-none text-slate-800 sm:text-[20px]'>
                  {count}
                </h4>
                <p
                  className={`shrink-0 whitespace-nowrap text-xs font-medium ${tile.pctText}`}>
                  {percent}
                  {'%'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}
