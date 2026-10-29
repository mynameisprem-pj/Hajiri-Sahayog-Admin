import type {
  TeacherRecord, EnrichedStudent, EnrichedClass,
  AttendanceFilters, Attendance,
} from '@/types'

// ─── Get all enriched students across all teachers ────────────────────────────

export function getEnrichedStudents(records: TeacherRecord[]): EnrichedStudent[] {
  const result: EnrichedStudent[] = []

  for (const record of records) {
    for (const student of record.students) {
      const cls = record.classes.find(c => c.id === student.classId)
      if (!cls) continue

      const studentAttendance = record.attendance.filter(
        a => a.studentId === student.id
      )

      const present = studentAttendance.filter(a => a.status === 'present').length
      const absent  = studentAttendance.filter(a => a.status === 'absent').length
      const leave   = studentAttendance.filter(a => a.status === 'leave').length
      const holiday = studentAttendance.filter(a => a.status === 'holiday').length
      const total   = present + absent + leave

      result.push({
        student,
        class: cls,
        teacher: record.profile,
        teacherId: record.id,
        totalPresent: present,
        totalAbsent: absent,
        totalLeave: leave,
        totalHoliday: holiday,
        attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 0,
      })
    }
  }

  return result
}

// ─── Get all enriched classes across all teachers ─────────────────────────────

export function getEnrichedClasses(records: TeacherRecord[]): EnrichedClass[] {
  const result: EnrichedClass[] = []

  for (const record of records) {
    for (const cls of record.classes) {
      const studentCount = record.students.filter(s => s.classId === cls.id).length
      const totalRecords = record.attendance.filter(a => a.classId === cls.id).length

      result.push({
        class: cls,
        teacher: record.profile,
        teacherId: record.id,
        studentCount,
        totalRecords,
      })
    }
  }

  return result
}

// ─── Apply attendance filters ─────────────────────────────────────────────────

export function filterAttendance(
  records: TeacherRecord[],
  filters: AttendanceFilters,
): Array<Attendance & {
  studentName: string
  className: string
  teacherName: string
  rollNo: number
}> {
  const result = []

  for (const record of records) {
    // Filter by teacher
    if (filters.teacherId && record.id !== filters.teacherId) continue

    for (const att of record.attendance) {
      // Filter by class
      if (filters.classId && String(att.classId) !== filters.classId) continue

      // Filter by status
      if (filters.status && att.status !== filters.status) continue

      // Filter by date range
      if (filters.dateFrom && att.date < filters.dateFrom) continue
      if (filters.dateTo && att.date > filters.dateTo) continue

      const student = record.students.find(s => s.id === att.studentId)
      const cls = record.classes.find(c => c.id === att.classId)
      if (!student || !cls) continue

      // Filter by search
      if (
        filters.search &&
        !student.name.toLowerCase().includes(filters.search.toLowerCase())
      ) continue

      result.push({
        ...att,
        studentName: student.name,
        className: cls.name,
        teacherName: record.profile.name,
        rollNo: student.rollNo,
      })
    }
  }

  return result.sort((a, b) => b.date.localeCompare(a.date))
}

// ─── School-wide summary stats ────────────────────────────────────────────────

export interface SchoolStats {
  totalTeachers: number
  totalClasses: number
  totalStudents: number
  totalAttendanceRecords: number
  overallPresentPct: number
  present: number
  absent: number
  leave: number
  holiday: number
}

export function getSchoolStats(records: TeacherRecord[]): SchoolStats {
  const teacherSet = new Set(records.map(r => r.id))
  const allStudents = records.flatMap(r => r.students)
  const allAttendance = records.flatMap(r => r.attendance)

  const present = allAttendance.filter(a => a.status === 'present').length
  const absent  = allAttendance.filter(a => a.status === 'absent').length
  const leave   = allAttendance.filter(a => a.status === 'leave').length
  const holiday = allAttendance.filter(a => a.status === 'holiday').length
  const nonHoliday = present + absent + leave

  return {
    totalTeachers: teacherSet.size,
    totalClasses: records.reduce((sum, r) => sum + r.classes.length, 0),
    totalStudents: allStudents.length,
    totalAttendanceRecords: allAttendance.length,
    overallPresentPct: nonHoliday > 0 ? Math.round((present / nonHoliday) * 100) : 0,
    present,
    absent,
    leave,
    holiday,
  }
}

// ─── Get attendance for a specific student ────────────────────────────────────

export function getStudentAttendance(
  records: TeacherRecord[],
  teacherId: string,
  studentId: number,
) {
  const record = records.find(r => r.id === teacherId)
  if (!record) return []
  return record.attendance
    .filter(a => a.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

// ─── Format date for display ──────────────────────────────────────────────────

export function formatDateDisplay(adDate: string): string {
  const [year, month, day] = adDate.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec']
  return `${day} ${months[month - 1]} ${year}`
}

// ─── Get unique teachers from records ─────────────────────────────────────────

export function getUniqueTeachers(records: TeacherRecord[]) {
  return records.map(r => ({
    id: r.id,
    name: r.profile.name,
    schoolName: r.profile.schoolName,
    fileName: r.fileName,
    importedAt: r.importedAt,
    classCount: r.classes.length,
    studentCount: r.students.length,
  }))
}

// ─── Low attendance students (below threshold) ────────────────────────────────

export function getLowAttendanceStudents(
  enriched: EnrichedStudent[],
  threshold = 75,
): EnrichedStudent[] {
  return enriched
    .filter(e => e.attendancePercentage < threshold && e.totalPresent + e.totalAbsent + e.totalLeave > 0)
    .sort((a, b) => a.attendancePercentage - b.attendancePercentage)
}