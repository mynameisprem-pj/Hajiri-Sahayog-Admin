import * as XLSX from 'xlsx'
import type { TeacherRecord, EnrichedStudent, AttendanceStatus } from '@/types'
import { formatDateDisplay } from './dataHelpers'

// ─── Export student attendance as Excel ───────────────────────────────────────

export function exportStudentAttendanceExcel(
  record: TeacherRecord,
  classId?: number,
) {
  const wb = XLSX.utils.book_new()

  const classes = classId
    ? record.classes.filter(c => c.id === classId)
    : record.classes

  for (const cls of classes) {
    const students = record.students
      .filter(s => s.classId === cls.id)
      .sort((a, b) => a.rollNo - b.rollNo)

    const dates = [...new Set(
      record.attendance
        .filter(a => a.classId === cls.id)
        .map(a => a.date)
    )].sort()

    // Header row: Roll No, Name, then each date
    const header = ['Roll No', 'Name', ...dates.map(formatDateDisplay), 'Present', 'Absent', 'Leave', 'Holiday', '%']

    const rows = students.map(student => {
      const statusMap = new Map(
        record.attendance
          .filter(a => a.studentId === student.id)
          .map(a => [a.date, a.status])
      )

      const present = [...statusMap.values()].filter(s => s === 'present').length
      const absent  = [...statusMap.values()].filter(s => s === 'absent').length
      const leave   = [...statusMap.values()].filter(s => s === 'leave').length
      const holiday = [...statusMap.values()].filter(s => s === 'holiday').length
      const total   = present + absent + leave
      const pct     = total > 0 ? Math.round((present / total) * 100) : 0

      return [
        student.rollNo,
        student.name,
        ...dates.map(d => {
          const s = statusMap.get(d)
          if (!s) return '-'
          return { present: 'P', absent: 'A', leave: 'L', holiday: 'H' }[s] ?? '-'
        }),
        present,
        absent,
        leave,
        holiday,
        `${pct}%`,
      ]
    })

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows])

    // Column widths
    ws['!cols'] = [
      { wch: 8 },  // Roll No
      { wch: 24 }, // Name
      ...dates.map(() => ({ wch: 12 })),
      { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 6 },
    ]

    const sheetName = cls.name.slice(0, 31) // Excel sheet name limit
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  const fileName = `${record.profile.name}-attendance-${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

// ─── Export all students summary as Excel ─────────────────────────────────────

export function exportAllStudentsSummaryExcel(students: EnrichedStudent[]) {
  const header = ['Teacher', 'Class', 'Roll No', 'Student Name', 'Present', 'Absent', 'Leave', 'Holiday', 'Attendance %']

  const rows = students.map(e => [
    e.teacher.name,
    e.class.name,
    e.student.rollNo,
    e.student.name,
    e.totalPresent,
    e.totalAbsent,
    e.totalLeave,
    e.totalHoliday,
    `${e.attendancePercentage}%`,
  ])

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
  ws['!cols'] = [
    { wch: 20 }, { wch: 16 }, { wch: 8 }, { wch: 24 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'All Students')

  const fileName = `hajiri-all-students-${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

// ─── Export filtered attendance as CSV ───────────────────────────────────────

export function exportAttendanceCSV(
  rows: Array<{
    date: string
    teacherName: string
    className: string
    rollNo: number
    studentName: string
    status: AttendanceStatus
  }>
) {
  const header = ['Date', 'Teacher', 'Class', 'Roll No', 'Student', 'Status']
  const data = rows.map(r => [
    r.date,
    r.teacherName,
    r.className,
    r.rollNo,
    r.studentName,
    r.status,
  ])

  const ws = XLSX.utils.aoa_to_sheet([header, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance')

  const fileName = `attendance-export-${new Date().toISOString().split('T')[0]}.csv`
  XLSX.writeFile(wb, fileName, { bookType: 'csv' })
}