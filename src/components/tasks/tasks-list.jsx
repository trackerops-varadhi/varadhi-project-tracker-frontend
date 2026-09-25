'use client';
import { Table } from '@/components/ui/table'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Calendar, AlertTriangle, MoreHorizontal, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { TaskTabs } from './task-tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateTaskModal } from './create-task-modal';
import { StatusBadge, PriorityBadge, TypeBadge } from './task-badge';
import { useAuthStore } from '@/store/auth.store';
import { tasksApi } from '@/lib/api/tasks.api';
import { formatDate, isOverdue, getInitials, getAvatarColor, cn } from '@/utils';
import { useHasMounted } from '@/hooks/use-has-mounted';
const TASKS_PER_PAGE = 10;

function TaskFilter({ label, value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        size='sm'
        aria-label={label}
        className='min-w-[120px] shrink-0 border-slate-200 bg-white text-xs font-medium text-slate-700'
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align='start'>
        {options.map(([optionValue, text]) => (
          <SelectItem key={optionValue} value={optionValue} className='text-xs'>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* =========================================================
   LOADING ROW
========================================================= */

function TaskRowSkeleton() {
  return (
    <tr className='animate-pulse'>
      <td className='px-2 py-1'>
        <div className='h-2 w-28 rounded bg-slate-100' />
      </td>
      <td className='px-2 py-1'>
        <div className='h-2 w-16 rounded bg-slate-100' />
      </td>
      <td className='px-2 py-1'>
        <div className='h-3 w-10 rounded bg-slate-100' />
      </td>
      <td className='px-2 py-1'>
        <div className='h-3 w-10 rounded bg-slate-100' />
      </td>
      <td className='px-2 py-1'>
        <div className='h-3 w-12 rounded bg-slate-100' />
      </td>
      <td className='px-2 py-1'>
        <div className='flex min-w-0 items-center gap-1.5'>
          <div className='h-7 w-7 shrink-0 rounded-full bg-slate-100' />
          <div className='h-2 w-14 rounded bg-slate-100' />
        </div>
      </td>
      <td className='px-2 py-1'>
        <div className='h-2 w-10 rounded bg-slate-100' />
      </td>
      <td className='px-2 py-1' />
    </tr>
  );
}

/* =========================================================
   TASK ACTION MENU
========================================================= */

function TaskActionsMenu(
  {
    task,
    onDeleted,
    onEdit,
    openUp = false
  }
) {
  const router = useRouter();

  const {
    user
  } = useAuthStore();

  const canManageTask = user?.role === 'admin' || user?.role === 'manager';
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleView() {
    setOpen(false);
    router.push(`/tasks/${task.id}`);
  }

  function handleEdit() {
    setOpen(false);

    if (onEdit) {
      onEdit(task);
      return;
    }

    router.push(`/tasks/${task.id}?edit=true`);
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${task.title}"? This can't be undone.`);

    if (!confirmed) {
      setOpen(false);
      return;
    }

    setIsDeleting(true);

    try {
      await tasksApi.delete(task.id);
      setOpen(false);
      onDeleted?.();
    } catch (error) {
      console.error('Failed to delete task:', error);
      window.alert('Failed to delete the task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className='relative inline-block'>
      <button
        type='button'
        aria-label='Task actions'
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(value => !value);
        }}
        className='rounded p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600'>
        <MoreHorizontal className='h-3 w-3' />
      </button>
      {open && (<><div
          className='fixed inset-0 z-40'
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
          }} /><div
          className={cn(`absolute right-0 z-50 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg`, openUp ? 'bottom-full mb-1' : 'top-full mt-1')}>
          <button
            type='button'
            onClick={handleView}
            className='flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50'>
            <Eye className='h-3 w-3 text-slate-400' />
            {'View Task'}
          </button>
          <button
            type='button'
            onClick={handleEdit}
            className='flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50'>
            <Pencil className='h-3 w-3 text-slate-400' />
            {'Edit Task'}
          </button>
          {canManageTask && (<><div className='my-1 border-t border-slate-100' /><button
              type='button'
              disabled={isDeleting}
              onClick={handleDelete}
              className={cn(`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-red-500 hover:bg-red-50`, isDeleting && 'cursor-not-allowed opacity-50')}>
              <Trash2 className='h-3 w-3' />
              {isDeleting ? 'Deleting...' : 'Delete Task'}
            </button></>)}
        </div></>)}
    </div>
  );
}

/* =========================================================
   TASK LIST
========================================================= */

export function TasksList() {
  const {
    user
  } = useAuthStore();

  const mounted = useHasMounted();
  const searchParams = useSearchParams();
  const canCreateTask = mounted && ['admin', 'manager'].includes(user?.role);

  /* =======================================================
           STATE
        ======================================================= */

  const [tasks, setTasks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [scope, setScope] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  /* =======================================================
           SEARCH PARAM
        ======================================================= */

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCurrentPage(1);
  }, [searchParams]);

  /* =======================================================
           FETCH TASKS
        ======================================================= */

  async function fetchTasks() {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {};

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      if (priorityFilter !== 'all') {
        filters.priority = priorityFilter;
      }

      if (search) {
        filters.search = search;
      }

      if (scope === 'mine' && user?.id) {
        filters.assigneeId = user.id;
      }

      const response = await tasksApi.getAll(filters, currentPage, TASKS_PER_PAGE);
      let list = [];

      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray(response?.tasks)) {
        list = response.tasks;
      } else if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (Array.isArray(response?.rows)) {
        list = response.rows;
      } else if (Array.isArray(response?.items)) {
        list = response.items;
      }

      setTasks(list);
      const total = response?.total ?? response?.totalCount ?? response?.count ?? response?.pagination?.total ?? response?.pagination?.totalCount ?? response?.meta?.total ?? response?.meta?.totalCount ?? list.length;
      setTotalTasks(total);
      const pagesFromApi = response?.totalPages ?? response?.pagination?.totalPages ?? response?.pagination?.pages ?? response?.meta?.totalPages ?? response?.meta?.pages;
      const calculatedPages = Math.ceil(total / TASKS_PER_PAGE);
      setTotalPages(Math.max(1, Number(pagesFromApi ?? calculatedPages) || 1));
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load tasks.');
      setTasks([]);
      setTotalTasks(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }

  /* =======================================================
           REFRESH
        ======================================================= */

  useEffect(() => {
    const timer = setTimeout(fetchTasks, 300);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, statusFilter, priorityFilter, scope, user?.id]);

  /* =======================================================
           PAGINATION VALUES
        ======================================================= */

  const currentTasks = tasks;

  const showingStart = totalTasks === 0 || currentTasks.length === 0 ? 0 : (currentPage - 1) * TASKS_PER_PAGE + 1;
  const showingEnd = totalTasks === 0 || currentTasks.length === 0 ? 0 : Math.min(showingStart + currentTasks.length - 1, totalTasks);

  /* =======================================================
           RENDER
        ======================================================= */

  return (
    <div className='flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden'>
      <div
        className='task-list-toolbar mb-2 flex flex-wrap min-h-10 w-full min-w-0 shrink-0 items-center gap-2 py-1 rounded-2xl border border-slate-200 bg-white px-2.5 shadow-sm [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300'>
        <TaskTabs
          active={scope}
          onChange={next => {
            setScope(next);
            setCurrentPage(1);
          }} />
        <div className='min-w-2 flex-1' />
        <div className='ml-auto flex flex-wrap min-w-0 items-center gap-2'>
          <TaskFilter
            label='Filter by status'
            value={statusFilter}
            onChange={value => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            options={[
              ['all', 'All Status'], ['todo', 'To Do'],
              ['in_progress', 'In Progress'], ['in_review', 'In Review'],
              ['completed', 'Completed'],
            ]} />
          <TaskFilter
            label='Filter by priority'
            value={priorityFilter}
            onChange={value => {
              setPriorityFilter(value);
              setCurrentPage(1);
            }}
            options={[
              ['all', 'All Priority'], ['low', 'Low'],
              ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical'],
            ]} />
          {canCreateTask && (<Button
            type='button'
            onClick={() => setShowCreateModal(true)}
            className='h-7 shrink-0 gap-1 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white hover:bg-primary-hover'>
            <Plus className='h-3 w-3' />
            {'New Task'}
          </Button>)}
        </div>
      </div>
      {error && (<div className='mb-1 shrink-0 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600'>
        {error}
        {' '}
        <button type='button' onClick={fetchTasks} className='font-semibold underline'>Retry</button>
      </div>)}
      <div
        className='task-table-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div
          className='min-h-0 min-w-0 flex-1 overflow-x-auto'
          tabIndex={0}
          role='region'
          aria-label='Tasks table'>
          <Table scrollable={false} className='w-full table-fixed border-collapse'>
            <colgroup>
              <col
                style={{
                  width: '21%'
                }} />
              <col
                style={{
                  width: '14%'
                }} />
              <col
                style={{
                  width: '10%'
                }} />
              <col
                style={{
                  width: '10%'
                }} />
              <col
                style={{
                  width: '11%'
                }} />
              <col
                style={{
                  width: '20%'
                }} />
              <col
                style={{
                  width: '10%'
                }} />
              <col
                style={{
                  width: '4%'
                }} />
            </colgroup>
            <thead className='sticky top-0 z-10 bg-slate-50'>
              <tr className='h-[24px] border-b border-slate-100 bg-slate-50/70'>
                <th scope='col' className='px-2 py-1 text-left text-xs font-semibold text-slate-500'>Task</th>
                <th scope='col' className='px-2 py-1 text-left text-xs font-semibold text-slate-500'>Project</th>
                <th scope='col' className='px-1.5 py-1 text-left text-xs font-semibold text-slate-500'>Type</th>
                <th scope='col' className='px-1.5 py-1 text-left text-xs font-semibold text-slate-500'>Priority</th>
                <th scope='col' className='px-1.5 py-1 text-left text-xs font-semibold text-slate-500'>Status</th>
                <th scope='col' className='px-2 py-1 text-left text-xs font-semibold text-slate-500'>Assignee</th>
                <th scope='col' className='px-1.5 py-1 text-left text-xs font-semibold text-slate-500'>Due</th>
                <th scope='col'>
                  <span className='sr-only'>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {isLoading ? (Array.from({
                length: TASKS_PER_PAGE
              }).map((_, index) => (<TaskRowSkeleton key={index} />))) : currentTasks.length > 0 ? (currentTasks.map((task, index) => {
                const overdue = task.dueDate && task.status !== 'completed' && isOverdue(task.dueDate);

                return (
                  <tr key={task.id} className='transition-colors hover:bg-slate-50'>
                    <td className='min-w-0 px-2 py-1'>
                      <p
                        title={task.title}
                        className='min-w-0 truncate whitespace-nowrap text-xs font-semibold leading-5 text-slate-800'>
                        {task.title}
                      </p>
                    </td>
                    <td className='min-w-0 px-2 py-1'>
                      <span className='block min-w-0 truncate whitespace-nowrap text-xs leading-5 text-slate-500'>
                        {task.project?.name || '—'}
                      </span>
                    </td>
                    <td className='px-2 py-1'>
                      <div className='flex min-w-0 items-center overflow-hidden whitespace-nowrap'>
                        <TypeBadge type={task.type} />
                      </div>
                    </td>
                    <td className='px-2 py-1'>
                      <div className='flex min-w-0 items-center overflow-hidden whitespace-nowrap'>
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </td>
                    <td className='px-2 py-1'>
                      <div className='flex min-w-0 items-center overflow-hidden whitespace-nowrap'>
                        <StatusBadge status={task.status} />
                      </div>
                    </td>
                    <td className='min-w-0 px-2 py-1'>
                      {task.assignee ? (<div className='flex min-w-0 items-center gap-1.5 overflow-hidden'>
                        <div
                          className={cn(`flex h-5 w-5 min-h-5 min-w-5 shrink-0 aspect-square items-center justify-center overflow-hidden rounded-full text-xs font-semibold leading-none text-white`, getAvatarColor(task.assignee.name))}>
                          {getInitials(task.assignee.name)}
                        </div>
                        <span className='min-w-0 flex-1 whitespace-normal break-words text-xs font-medium leading-5 text-slate-600'>
                          {task.assignee.name}
                        </span>
                      </div>) : (<span className='block min-w-0 truncate whitespace-nowrap text-xs leading-5 text-slate-400'>Unassigned</span>)}
                    </td>
                    <td className='min-w-0 px-2 py-1'>
                      {task.dueDate ? (<div
                        className={cn(`flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-xs leading-5`, overdue ? 'text-red-500' : 'text-slate-500')}>
                        {overdue && (<AlertTriangle className='h-2 w-2 shrink-0' />)}
                        <Calendar className='h-2 w-2 shrink-0' />
                        <span className='min-w-0 truncate'>
                          {formatDate(task.dueDate, 'MMM dd')}
                        </span>
                      </div>) : (<span className='text-xs text-slate-400'>—</span>)}
                    </td>
                    <td className='px-2 py-1 text-right'>
                      <TaskActionsMenu task={task} onDeleted={fetchTasks} openUp={index >= currentTasks.length - 2} />
                    </td>
                  </tr>
                );
              })) : (<tr>
                <td colSpan={8} className='py-8 text-center'>
                  <div className='mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100'>
                    <Search className='h-3 w-3 text-slate-400' />
                  </div>
                  <p className='text-xs font-medium text-slate-600'>No tasks found</p>
                  <p className='mt-0.5 text-xs text-slate-400'>Try changing the filters or create a new task</p>
                </td>
              </tr>)}
            </tbody>
          </Table>
        </div>
        <nav className="task-pagination" aria-label="Task pagination">
          <p className="min-w-0 flex-1 truncate text-[10px] text-slate-500" aria-live="polite">
            {isLoading
              ? 'Loading tasks...'
              : `Showing ${showingStart}-${showingEnd} of ${totalTasks} tasks`}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={isLoading || currentPage === 1}
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-14 text-center text-[11px] font-medium tabular-nums text-slate-600">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={isLoading || currentPage >= totalPages}
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </nav>
      </div>
      {showCreateModal && (<CreateTaskModal
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);

          if (currentPage === 1) {
            fetchTasks();
          } else {
            setCurrentPage(1);
          }
        }} />)}
    </div>
  );
}

// Keep content at its natural size so smaller screens can scroll.
export function TaskViewport({ children, className }) {
  return <div className={className}>{children}</div>
}
