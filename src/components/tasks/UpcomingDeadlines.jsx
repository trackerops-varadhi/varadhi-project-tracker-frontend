'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useUpcomingDeadlines, formatDueLabel, priorityBadgeClass } from '@/lib/deadline-format';

function Shell({ children }) {
  return (
    <Card
      className='flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='mb-1.5 flex shrink-0 items-center justify-between gap-2'>
        <h3 className='min-w-0 truncate text-sm font-semibold text-slate-800'>Upcoming Deadlines</h3>
        <Link href='/tasks' className='shrink-0 whitespace-nowrap text-xs font-medium text-violet-600 hover:underline'>View All</Link>
      </div>
      <div className='deadline-content min-h-0 min-w-0 flex-1'>
        {children}
      </div>
    </Card>
  );
}

export function UpcomingDeadlines() {
  const { tasks, isLoading, error } = useUpcomingDeadlines({ limit: 4, days: 30 })

  /* =====================================================
           LOADING
        ====================================================== */

  if (isLoading) {
    return (
      <Shell>
        <div className='space-y-1.5'>
          {[0, 1, 2].map(i => (<div key={i} className='animate-pulse rounded-lg border border-slate-100 px-2 py-1.5'>
            <div className='mb-1 h-2 w-3/4 rounded bg-slate-100' />
            <div className='h-2 w-1/2 rounded bg-slate-100' />
          </div>))}
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

  /* =====================================================
           EMPTY
        ====================================================== */

  if (tasks.length === 0) {
    return (
      <Shell>
        <div className='flex h-full items-center'>
          <p className='text-xs text-slate-500'>No upcoming deadlines.</p>
        </div>
      </Shell>
    );
  }

  /* =====================================================
           DATA
        ====================================================== */

  return (
    <Shell>
      <div className='deadline-items'>
        {tasks.map(task => (<Link
          key={task.id}
          href={`/tasks/${task.id}`}
          className='deadline-item min-w-0 rounded-lg transition-colors'>
          <div className='flex min-w-0 items-center justify-between gap-1.5'>
            <p title={task.title} className='min-w-0 flex-1 truncate text-xs font-semibold leading-tight text-slate-800'>
              {task.title}
            </p>
            <span
              className={`shrink-0 whitespace-nowrap rounded-full px-1.5 py-[1px] text-xs font-medium leading-tight ${priorityBadgeClass(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          <div className='mt-1 flex min-w-0 items-center justify-between gap-1.5'>
            <span className='min-w-0 flex-1 truncate text-xs leading-tight text-slate-400'>
              {task.projectName ?? 'No project'}
            </span>
            <span
              className={`shrink-0 whitespace-nowrap text-xs leading-tight ${task.isOverdue ? 'font-medium text-red-600' : 'text-slate-500'}`}>
              {formatDueLabel(task.daysLeft, task.dueDate)}
            </span>
          </div>
        </Link>))}
      </div>
    </Shell>
  );
}
