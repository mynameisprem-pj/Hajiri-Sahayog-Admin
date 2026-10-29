import { useMemo, useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { TopBar, Card, EmptyState, Button, Badge, Select } from '@/components/ui'
import { useTeacherRecords } from '@/store/useAdminStore'
import { getEnrichedClasses, getEnrichedStudents } from '@/utils/dataHelpers'
import { exportStudentAttendanceExcel, exportAllStudentsSummaryExcel } from '@/utils/excelExport'

export function ReportsPage() {
  const records = useTeacherRecords()
  const [teacherFilter, setTeacherFilter] = useState('')

  const enrichedClasses = useMemo(() => getEnrichedClasses(records), [records])
  const enrichedStudents = useMemo(() => getEnrichedStudents(records), [records])

  const filteredClasses = teacherFilter
    ? enrichedClasses.filter(e => e.teacherId === teacherFilter)
    : enrichedClasses

  const teacherOptions = [
    { value: '', label: 'All Teachers' },
    ...records.map(r => ({ value: r.id, label: r.profile.name })),
  ]

  if (records.length === 0) {
    return (
      <div className="flex-1 p-8">
        <TopBar title="Reports" />
        <EmptyState
          icon={<FileSpreadsheet size={32} />}
          title="No data to report"
          description="Import teacher files to generate Excel reports."
        />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <TopBar
        title="Reports"
        subtitle="Export attendance data as Excel or CSV"
      />

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Card padding="md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-present-light flex items-center justify-center shrink-0">
              <FileSpreadsheet size={22} className="text-present-dark" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 mb-1">All Students Summary</h3>
              <p className="text-sm text-slate-500 mb-3">
                One row per student with total Present, Absent, Leave, Holiday and attendance % across all teachers.
              </p>
              <Button
                size="sm"
                icon={<Download size={14} />}
                onClick={() => exportAllStudentsSummaryExcel(enrichedStudents)}
              >
                Export Excel
              </Button>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={22} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 mb-1">Class-wise Attendance Grid</h3>
              <p className="text-sm text-slate-500 mb-3">
                Full attendance grid per class — each row is a student, each column is a date (P/A/L/H).
              </p>
              <p className="text-xs text-slate-400">Select a class below to export</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Class Reports */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800">Class Reports</h2>
        <Select
          value={teacherFilter}
          onChange={e => setTeacherFilter(e.target.value)}
          options={teacherOptions}
          className="w-48"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredClasses.map(({ class: cls, teacher, teacherId, studentCount, totalRecords }) => {
          const record = records.find(r => r.id === teacherId)
          if (!record) return null

          return (
            <Card key={`${teacherId}-${cls.id}`} padding="none">
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center
                                justify-center shrink-0">
                  <FileSpreadsheet size={18} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800">{cls.name}</p>
                    <Badge color="gray">{studentCount} students</Badge>
                    <Badge color="gray">{totalRecords} records</Badge>
                  </div>
                  <p className="text-xs text-slate-400">Teacher: {teacher.name}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Download size={14} />}
                    onClick={() => exportStudentAttendanceExcel(record, cls.id)}
                  >
                    This Class
                  </Button>
                  <Button
                    size="sm"
                    icon={<Download size={14} />}
                    onClick={() => exportStudentAttendanceExcel(record)}
                  >
                    All Classes
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}