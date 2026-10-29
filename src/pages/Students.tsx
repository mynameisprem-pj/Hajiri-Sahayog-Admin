import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import {
  TopBar, Card, EmptyState, SearchBar, Select,
  Button, PercentageBadge, Badge, StatusBadge,
} from '@/components/ui'
import { useTeacherRecords } from '@/store/useAdminStore'
import {
  getEnrichedStudents, getStudentAttendance, formatDateDisplay,
} from '@/utils/dataHelpers'
import { exportAllStudentsSummaryExcel } from '@/utils/excelExport'
import type { EnrichedStudent, AttendanceStatus } from '@/types'

// ─── Student Detail Panel ─────────────────────────────────────────────────────

function StudentDetail({ enriched, onBack }: { enriched: EnrichedStudent; onBack: () => void }) {
  const records = useTeacherRecords()
  const history = getStudentAttendance(records, enriched.teacherId, enriched.student.id!)
  const [monthFilter, setMonthFilter] = useState('')

  const months = [...new Set(history.map(h => h.date.slice(0, 7)))].sort((a, b) => b.localeCompare(a))
  const filtered = monthFilter ? history.filter(h => h.date.startsWith(monthFilter)) : history

  const pct = enriched.attendancePercentage
  const pctColor = pct >= 85 ? 'text-present-dark' : pct >= 75 ? 'text-leave-dark' : 'text-absent-dark'

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-sm text-primary-600 hover:underline font-medium">
          ← Students
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600 font-medium">{enriched.student.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
          <span className="text-xl font-bold text-primary-600">{enriched.student.rollNo}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{enriched.student.name}</h1>
          <p className="text-sm text-slate-500">{enriched.class.name} · {enriched.teacher.name}</p>
        </div>
        <div className="ml-auto text-right">
          <p className={`text-3xl font-bold ${pctColor}`}>{pct}%</p>
          <p className="text-xs text-slate-400">Attendance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Present', value: enriched.totalPresent, color: 'bg-present-light text-present-dark' },
          { label: 'Absent',  value: enriched.totalAbsent,  color: 'bg-absent-light text-absent-dark'  },
          { label: 'Leave',   value: enriched.totalLeave,   color: 'bg-leave-light text-leave-dark'    },
          { label: 'Holiday', value: enriched.totalHoliday, color: 'bg-holiday-light text-holiday-dark'},
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm">Attendance History</h3>
          <select
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600
                       focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No records</p>
          ) : filtered.map(h => (
            <div key={h.date} className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-slate-700">{formatDateDisplay(h.date)}</p>
              <StatusBadge status={h.status as AttendanceStatus} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Students Page ────────────────────────────────────────────────────────────

export function StudentsPage() {
  const records = useTeacherRecords()
  const [search, setSearch] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [selected, setSelected] = useState<EnrichedStudent | null>(null)

  const allStudents = useMemo(() => getEnrichedStudents(records), [records])

  const filtered = useMemo(() => {
    return allStudents.filter(e => {
      if (teacherFilter && e.teacherId !== teacherFilter) return false
      if (classFilter && String(e.class.id) !== classFilter) return false
      if (search && !e.student.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [allStudents, teacherFilter, classFilter, search])

  const teacherOptions = [
    { value: '', label: 'All Teachers' },
    ...records.map(r => ({ value: r.id, label: r.profile.name })),
  ]

  const classOptions = useMemo(() => {
    const base = [{ value: '', label: 'All Classes' }]
    const filtered = teacherFilter
      ? records.find(r => r.id === teacherFilter)?.classes ?? []
      : records.flatMap(r => r.classes)
    return [...base, ...filtered.map(c => ({ value: String(c.id), label: c.name }))]
  }, [records, teacherFilter])

  if (selected) {
    return <StudentDetail enriched={selected} onBack={() => setSelected(null)} />
  }

  if (records.length === 0) {
    return (
      <div className="flex-1 p-8">
        <TopBar title="Students" />
        <EmptyState icon="👥" title="No data imported" description="Import teacher files to see students." />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <TopBar
        title="Students"
        subtitle={`${filtered.length} of ${allStudents.length} students`}
        actions={
          <Button size="sm" variant="secondary" icon={<Download size={15} />}
            onClick={() => exportAllStudentsSummaryExcel(filtered)}>
            Export Excel
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search student name..." className="flex-1" />
        <Select value={teacherFilter} onChange={e => { setTeacherFilter(e.target.value); setClassFilter('') }}
          options={teacherOptions} className="w-48" />
        <Select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          options={classOptions} className="w-40" />
      </div>

      {/* Table */}
      <Card padding="none">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th rounded-tl-2xl">Roll No</th>
              <th className="table-th">Student Name</th>
              <th className="table-th">Class</th>
              <th className="table-th">Teacher</th>
              <th className="table-th text-center">Present</th>
              <th className="table-th text-center">Absent</th>
              <th className="table-th text-center">Leave</th>
              <th className="table-th text-center rounded-tr-2xl">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-sm text-slate-400">
                  No students found
                </td>
              </tr>
            ) : filtered.map(e => (
              <tr key={`${e.teacherId}-${e.student.id}`}
                onClick={() => setSelected(e)}
                className="hover:bg-surface-secondary cursor-pointer transition-colors">
                <td className="table-td font-medium text-slate-500">{e.student.rollNo}</td>
                <td className="table-td font-semibold text-slate-800">{e.student.name}</td>
                <td className="table-td"><Badge color="blue">{e.class.name}</Badge></td>
                <td className="table-td text-slate-500">{e.teacher.name}</td>
                <td className="table-td text-center text-present-dark font-medium">{e.totalPresent}</td>
                <td className="table-td text-center text-absent-dark font-medium">{e.totalAbsent}</td>
                <td className="table-td text-center text-leave-dark font-medium">{e.totalLeave}</td>
                <td className="table-td text-center">
                  <PercentageBadge value={e.attendancePercentage} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}