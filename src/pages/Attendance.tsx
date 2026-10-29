import { useMemo, useState } from 'react'
import { Download, Filter, X } from 'lucide-react'
import {
  TopBar, Card, EmptyState, SearchBar, Select,
  Button, StatusBadge, Badge,
} from '@/components/ui'
import { useTeacherRecords, useAdminStore } from '@/store/useAdminStore'
import { filterAttendance, formatDateDisplay } from '@/utils/dataHelpers'
import { exportAttendanceCSV } from '@/utils/excelExport'
import type { AttendanceStatus } from '@/types'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'present', label: 'Present' },
  { value: 'absent',  label: 'Absent'  },
  { value: 'leave',   label: 'Leave'   },
  { value: 'holiday', label: 'Holiday' },
]

export function AttendancePage() {
  const records = useTeacherRecords()
  const filters = useAdminStore(s => s.filters)
  const setFilters = useAdminStore(s => s.setFilters)
  const resetFilters = useAdminStore(s => s.resetFilters)
  const [showFilters, setShowFilters] = useState(false)

  const teacherOptions = [
    { value: '', label: 'All Teachers' },
    ...records.map(r => ({ value: r.id, label: r.profile.name })),
  ]

  const classOptions = useMemo(() => {
    const base = [{ value: '', label: 'All Classes' }]
    const classes = filters.teacherId
      ? records.find(r => r.id === filters.teacherId)?.classes ?? []
      : records.flatMap(r => r.classes)
    return [...base, ...classes.map(c => ({ value: String(c.id), label: c.name }))]
  }, [records, filters.teacherId])

  const rows = useMemo(() => filterAttendance(records, filters), [records, filters])

  const hasActiveFilters = filters.teacherId || filters.classId || filters.status
    || filters.dateFrom || filters.dateTo || filters.search

  if (records.length === 0) {
    return (
      <div className="flex-1 p-8">
        <TopBar title="Attendance" />
        <EmptyState icon="📅" title="No data imported" description="Import teacher files to view attendance records." />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <TopBar
        title="Attendance"
        subtitle={`${rows.length.toLocaleString()} records`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary"
              icon={<Filter size={15} />}
              onClick={() => setShowFilters(p => !p)}>
              Filters {hasActiveFilters && '•'}
            </Button>
            <Button size="sm" variant="secondary"
              icon={<Download size={15} />}
              onClick={() => exportAttendanceCSV(rows)}>
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Search */}
      <SearchBar
        value={filters.search}
        onChange={v => setFilters({ search: v })}
        placeholder="Search student name..."
        className="mb-4"
      />

      {/* Filter Panel */}
      {showFilters && (
        <Card padding="md" className="mb-4 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Select
              value={filters.teacherId}
              onChange={e => setFilters({ teacherId: e.target.value, classId: '' })}
              options={teacherOptions}
              label="Teacher"
            />
            <Select
              value={filters.classId}
              onChange={e => setFilters({ classId: e.target.value })}
              options={classOptions}
              label="Class"
            />
            <Select
              value={filters.status}
              onChange={e => setFilters({ status: e.target.value as AttendanceStatus | '' })}
              options={STATUS_OPTIONS}
              label="Status"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters({ dateFrom: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800
                           focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters({ dateTo: e.target.value })}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800
                           focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-3 flex items-center gap-1.5 text-xs text-absent font-medium hover:underline"
            >
              <X size={12} /> Clear all filters
            </button>
          )}
        </Card>
      )}

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="table-th rounded-tl-2xl">Date</th>
                <th className="table-th">Teacher</th>
                <th className="table-th">Class</th>
                <th className="table-th">Roll No</th>
                <th className="table-th">Student</th>
                <th className="table-th rounded-tr-2xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-slate-400">
                    No records match the current filters
                  </td>
                </tr>
              ) : rows.slice(0, 500).map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-secondary transition-colors">
                  <td className="table-td text-slate-500 whitespace-nowrap">
                    {formatDateDisplay(row.date)}
                  </td>
                  <td className="table-td text-slate-600">{row.teacherName}</td>
                  <td className="table-td"><Badge color="blue">{row.className}</Badge></td>
                  <td className="table-td text-slate-500 text-center">{row.rollNo}</td>
                  <td className="table-td font-medium text-slate-800">{row.studentName}</td>
                  <td className="table-td">
                    <StatusBadge status={row.status as AttendanceStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 500 && (
          <div className="px-5 py-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Showing 500 of {rows.length.toLocaleString()} records. Use filters to narrow down or export for full data.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}