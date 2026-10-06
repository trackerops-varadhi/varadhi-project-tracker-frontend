'use client'

import { StatCard } from '@/components/shared/stat-card'

import { Table } from '@/components/ui/table'
import { useState, useEffect, useCallback } from 'react'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { useSearchParams } from 'next/navigation'

import {
  Search,
  UserPlus,
  MoreHorizontal,
  ShieldCheck,
  Shield,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Contact,
} from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { InviteUserModal } from './invite-user-modal'

import { useAuthStore } from '@/store/auth.store'
import { usersApi } from '@/lib/api/users.api'

import {
  USER_ROLE_COLORS,
  USER_ROLE_LABELS,
} from '@/constants'

import {
  getInitials,
  getAvatarColor,
  formatDate,
  cn,
} from '@/utils'

/* =========================================================
   ROLE ICONS
========================================================= */

const ROLE_ICONS = {
  admin: ShieldCheck,
  manager: Shield,
  employee: User,
  hr: Contact,
}

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
  },

  inactive: {
    label: 'Inactive',
    color: 'bg-slate-100 text-muted-foreground',
    icon: XCircle,
  },

  invited: {
    label: 'Invited',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
}

/* =========================================================
   USERS LIST
========================================================= */

export function UsersList({ leftColumn, rightColumn }) {
  const { user: currentUser } = useAuthStore()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState('')

  const queryRole = searchParams.get('role') || 'all'
  const [roleSelection, setRoleSelection] = useState(null)
  const roleFilter = roleSelection?.queryRole === queryRole ? roleSelection.value : queryRole
  const setRoleFilter = (value) => setRoleSelection({ queryRole, value })

  const statusFilter =
    searchParams.get('status') || ''

  const [showInviteModal, setShowInviteModal] =
    useState(false)

  const mounted = useHasMounted()
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [sidebarVersion, setSidebarVersion] = useState(0)

  const [users, setUsers] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [openMenuId, setOpenMenuId] =
    useState(null)

  const [actioningId, setActioningId] =
    useState(null)

  /* =======================================================
     MOUNT
  ======================================================= */

  /* =======================================================
     FETCH USERS
  ======================================================= */

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data =
        await usersApi.getAll()

      setUsers(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Unable to load team members. Please retry.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(fetchUsers, 0)
      return () => clearTimeout(timer)
    }
  }, [mounted, fetchUsers])

  /* =======================================================
     ADMIN CHECK
  ======================================================= */

  const isAdmin =
    currentUser?.role === 'admin'

  /* =======================================================
     FILTER USERS
  ======================================================= */

  const filtered =
    users.filter((u) => {
      const name =
        u.name ?? ''

      const email =
        u.email ?? ''

      const matchesSearch =
        name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        email
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )

      const matchesRole =
        roleFilter === 'all' ||
        u.role === roleFilter

      const matchesStatus =
        !statusFilter ||
        u.status === statusFilter

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      )
    })

  /* =======================================================
     ROLE CHANGE
  ======================================================= */

  async function handleRoleChange(
    userId,
    newRole
  ) {
    setActioningId(userId)

    try {
      await usersApi.updateRole(
        userId,
        newRole
      )

      await fetchUsers()
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          'Failed to update role. Please try again.'
      )
    } finally {
      setActioningId(null)
      setOpenMenuId(null)
    }
  }

  /* =======================================================
     ACTIVATE / DEACTIVATE
  ======================================================= */

  async function handleDeactivate(
    userId
  ) {
    setActioningId(userId)

    try {
      await usersApi.deactivate(
        userId
      )

      await fetchUsers()
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          'Failed to update status. Please try again.'
      )
    } finally {
      setActioningId(null)
      setOpenMenuId(null)
    }
  }

  async function handleDeleteEmployee(member) {
    if (!isAdmin || member.role !== 'employee' || member.id === currentUser?.id) return
    setOpenMenuId(null)
    if (!window.confirm(`Permanently delete ${member.name || member.email}? Their account, comments and account-related records will be removed. Tasks and projects will remain. This cannot be undone.`)) return
    setActioningId(member.id)
    setActionError(null)
    try {
      await usersApi.deleteEmployee(member.id)
      setUsers(previous => previous.filter(user => user.id !== member.id))
      await fetchUsers()
      setSidebarVersion(value => value + 1)
    } catch (error) {
      setActionError(error.response?.data?.message || 'Unable to delete the employee. Please retry.')
    } finally {
      setActioningId(null)
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        w-full
        min-w-0
        flex-col
        overflow-hidden
      "
    >
      {/* ===================================================
          COMPACT STATS ROW
      ==================================================== */}

      <div
        className="
          mb-3
          grid
          grid-cols-2
          gap-2.5
          shrink-0
          lg:grid-cols-4
        "
      >
        {[
          {
            label: 'Total Members',
            icon: User,
            value: users.length,
            color: 'text-foreground',
          },
          {
            label: 'Active',
            icon: CheckCircle2,
            value:
              users.filter(
                (u) =>
                  u.status === 'active'
              ).length,
            color: 'text-green-600',
          },
          {
            label: 'Managers',
            icon: Shield,
            value:
              users.filter(
                (u) =>
                  u.role === 'manager'
              ).length,
            color: 'text-blue-600',
          },
          {
            label: 'Pending Invites',
            icon: UserPlus,
            value:
              users.filter(
                (u) =>
                  u.status === 'invited'
              ).length,
            color: 'text-amber-600',
          },
        ].map((stat) => (
          <StatCard key={stat.label} title={stat.label} value={isLoading || loadError ? '?' : stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="users-columns">
        <aside key={`left-${sidebarVersion}`} className="users-left">{leftColumn}</aside>
        <div className="users-directory flex min-h-0 min-w-0 flex-col rounded-xl border border-border bg-card p-3">
          {actionError && <p role="alert" className="mb-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">{actionError}</p>}
      {loadError && <div role="alert" className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">
        <span>{loadError}</span>
        <button type="button" onClick={fetchUsers} disabled={isLoading} className="shrink-0 font-semibold underline">Retry</button>
      </div>}
      {/* ===================================================
          COMPACT TOOLBAR
      ==================================================== */}

      <div
        className="
          mb-3
          flex
          h-[36px]
          shrink-0
          items-center
          gap-2
        "
      >
        {/* SEARCH */}

        <div
          className="
            relative
            h-full
            min-w-0
            flex-1
          "
        >
          <Search
            className="
              absolute
              left-3
              top-1/2
              h-3.5
              w-3.5
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
              h-full
              w-full
              rounded-lg
              border
              border-border
              bg-card
              pl-9
              pr-3
              text-[11px]
              outline-none
              placeholder:text-slate-400
              focus:ring-2
              focus:ring-violet-500
            "
          />
        </div>

        {/* =================================================
            ROLE FILTER
        ================================================== */}

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger aria-label="Filter by role" size="sm" className="h-8 w-[112px] shrink-0 border-slate-200 bg-white text-[11px] font-medium">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent align="end">
            {['all', 'admin', 'manager', 'hr', 'employee'].map(role => <SelectItem key={role} value={role} className="text-xs">{role === 'all' ? 'All Roles' : USER_ROLE_LABELS[role]}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* INVITE */}

        {isAdmin && (
          <Button
            onClick={() =>
              setShowInviteModal(true)
            }
            className="
              h-[32px]
              shrink-0
              gap-1.5
              rounded-lg
              bg-primary
              px-3
              text-[10px]
              font-semibold
              text-white
              hover:bg-primary-hover
            "
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite Member
          </Button>
        )}
      </div>

      {/* ===================================================
          USERS TABLE
      ==================================================== */}

      <div
        className="
          min-h-0
          w-full
          min-w-0
          flex-1
          overflow-hidden
          rounded-xl
          border
          border-border
          bg-card
        "
      >
        <div
          className="
            h-full
            w-full
            min-w-0
            overflow-auto
          "
        >
          <Table scrollable={false} className="w-full table-fixed">

            {/* HEADER */}

            <thead>
              <tr
                className="
                  h-[34px]
                  border-b
                  border-slate-100
                  bg-background
                "
              >
                <th className="w-[39%] px-3 text-left text-[10px] font-medium text-muted-foreground">
                  Member
                </th>

                <th className="w-[18%] px-3 text-left text-[10px] font-medium text-muted-foreground">
                  Role
                </th>

                <th className="w-[16%] px-3 text-left text-[10px] font-medium text-muted-foreground">
                  Status
                </th>

                <th className="w-[8%] px-3 text-left text-[10px] font-medium text-muted-foreground">
                  Tasks
                </th>

                <th className="w-[10%] px-3 text-left text-[10px] font-medium text-muted-foreground">
                  Joined
                </th>

                {isAdmin && (
                  <th className="w-[9%] px-3 text-center text-[10px] font-medium text-muted-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* BODY */}

            <tbody className="divide-y divide-slate-100">
              {isLoading && <tr><td colSpan={8} className="p-6 text-center text-sm text-slate-500" role="status">Loading users...</td></tr>}
              {filtered.map((member) => {
                const RoleIcon =
                  ROLE_ICONS[
                    member.role
                  ] ?? User

                const statusConfig =
                  STATUS_CONFIG[
                    member.status
                  ] ??
                  STATUS_CONFIG.inactive

                const StatusIcon =
                  statusConfig.icon

                const isCurrentUser =
                  member.id ===
                  currentUser?.id

                const isActioning =
                  actioningId ===
                  member.id

                return (
                  <tr
                    key={member.id}
                    className="
                      h-[48px]
                      transition-colors
                      hover:bg-background
                    "
                  >
                    {/* MEMBER */}

                    <td className="px-3 py-1">
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-2
                        "
                      >
                        <div
                          className={cn(
                            `
                              flex
                              h-7
                              w-7
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              text-[9px]
                              font-semibold
                              text-white
                            `,
                            getAvatarColor(
                              member.name
                            )
                          )}
                        >
                          {getInitials(
                            member.name
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-1">
                            <p
                              className="
                                truncate
                                text-[11px]
                                font-semibold
                                leading-[14px]
                                text-foreground
                              "
                            >
                              {member.name}
                            </p>

                            {isCurrentUser && (
                              <span
                                className="
                                  shrink-0
                                  rounded
                                  bg-violet-100
                                  px-1
                                  py-0.5
                                  text-[8px]
                                  font-medium
                                  text-primary
                                "
                              >
                                You
                              </span>
                            )}
                          </div>

                          <p
                            className="
                              mt-0.5
                              truncate
                              text-[9px]
                              leading-[11px]
                              text-slate-400
                            "
                          >
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}

                    <td className="px-3 py-1">
                      <div className="flex items-center gap-1">
                        <RoleIcon className="h-3 w-3 shrink-0 text-slate-400" />

                        <span
                          className={cn(
                            `
                              inline-flex
                              whitespace-nowrap
                              rounded-md
                              px-1.5
                              py-0.5
                              text-[9px]
                              font-medium
                            `,
                            USER_ROLE_COLORS[
                              member.role
                            ]
                          )}
                        >
                          {USER_ROLE_LABELS[
                            member.role
                          ] ??
                            member.role}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td className="px-3 py-1">
                      <div className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3 shrink-0 text-slate-400" />

                        <span
                          className={cn(
                            `
                              inline-flex
                              whitespace-nowrap
                              rounded-md
                              px-1.5
                              py-0.5
                              text-[9px]
                              font-medium
                            `,
                            statusConfig.color
                          )}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </td>

                    {/* TASKS */}

                    <td className="px-3 py-1">
                      <span className="text-[10px] text-muted-foreground">
                        {member.tasksCount ??
                          '—'}
                      </span>
                    </td>

                    {/* JOINED */}

                    <td className="px-3 py-1">
                      <span
                        className="
                          whitespace-nowrap
                          text-[9px]
                          text-muted-foreground
                        "
                      >
                        {formatDate(
                          member.createdAt
                        )}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    {isAdmin && (
                      <td className="px-3 py-1 text-center">
                        <DropdownMenu open={openMenuId === member.id} onOpenChange={open => setOpenMenuId(open ? member.id : null)}>
                          <DropdownMenuTrigger asChild>
                            <button type="button" aria-label={`Actions for ${member.name || member.email}`} disabled={isCurrentUser || isActioning} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-[11px] text-slate-500">Change Role</DropdownMenuLabel>
                            {['employee', 'hr', 'manager', 'admin'].map(role => <DropdownMenuItem key={role} disabled={isActioning || member.role === role} onSelect={() => handleRoleChange(member.id, role)} className="text-xs">{USER_ROLE_LABELS[role]}{member.role === role && <CheckCircle2 className="ml-auto h-3 w-3 text-primary" />}</DropdownMenuItem>)}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled={isActioning} onSelect={() => handleDeactivate(member.id)} className={`text-xs ${member.status === 'active' ? 'text-red-600' : 'text-green-600'}`}>{member.status === 'active' ? 'Deactivate User' : 'Activate User'}</DropdownMenuItem>
                            {member.role === 'employee' && <><DropdownMenuSeparator /><DropdownMenuItem disabled={isActioning} onSelect={() => handleDeleteEmployee(member)} className="text-xs text-red-600"><Trash2 className="h-3.5 w-3.5" />Delete Employee</DropdownMenuItem></>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </Table>

          {/* =================================================
              EMPTY STATE
          ================================================== */}

          {!isLoading && !loadError &&
            filtered.length === 0 && (
              <div className="py-8 text-center">
                <div
                  className="
                    mx-auto
                    mb-2
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-slate-100
                  "
                >
                  <Search className="h-4 w-4 text-slate-400" />
                </div>

                <p className="text-xs font-medium text-muted-foreground">
                  No members found
                </p>

                <p className="mt-1 text-[9px] text-slate-400">
                  Try a different search or filter
                </p>
              </div>
            )}
        </div>
      </div>

        </div>
        <aside key={`right-${sidebarVersion}`} className="users-right">{rightColumn}</aside>
      </div>

      {/* ===================================================
          INVITE MODAL
      ==================================================== */}

      {showInviteModal && (
        <InviteUserModal
          onClose={() =>
            setShowInviteModal(false)
          }
          onSuccess={() => {
            setShowInviteModal(false)
            fetchUsers()
          }}
        />
      )}

    </div>
  )
}
