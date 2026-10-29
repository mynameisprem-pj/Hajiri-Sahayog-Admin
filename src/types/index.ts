// ─── Re-used from Teacher App (same shape) ────────────────────────────────────

export type DateSystem = 'BS' | 'AD'
export type DateString = string // YYYY-MM-DD in AD always
export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday'

export interface TeacherProfile {
  id: 1
  name: string
  schoolName: string
  dateSystem: DateSystem
  disclaimerAccepted: boolean
  createdAt: DateString
  weeklyOffDays: number[]
}

export interface Class {
  id?: number
  name: string
  createdAt: DateString
}

export interface Student {
  id?: number
  classId: number
  rollNo: number
  name: string
  createdAt: DateString
}

export interface Attendance {
  id?: number
  studentId: number
  classId: number
  date: DateString
  status: AttendanceStatus
  note?: string
}

export interface Holiday {
  id?: number
  date: DateString
  name: string
  createdAt: DateString
}

// ─── Teacher Backup File Shape ────────────────────────────────────────────────
// Exact shape of the .json exported from the teacher app

export interface TeacherBackup {
  version: string
  exportedAt: string
  profile: TeacherProfile
  classes: Class[]
  students: Student[]
  attendance: Attendance[]
  holidays: Holiday[]
}

// ─── Admin Profile ────────────────────────────────────────────────────────────

export interface AdminProfile {
  name: string
  schoolName: string
  avatarBase64?: string   // optional profile picture
  logoBase64?: string     // optional institution logo
  createdAt: string
}

// ─── Merged/Enriched Types (computed after import) ───────────────────────────

// A teacher record with all their imported data
export interface TeacherRecord {
  id: string                  // generated from profile name + import time
  profile: TeacherProfile
  classes: Class[]
  students: Student[]
  attendance: Attendance[]
  holidays: Holiday[]
  importedAt: string
  fileName: string
}

// Enriched student with their teacher and class info
export interface EnrichedStudent {
  student: Student
  class: Class
  teacher: TeacherProfile
  teacherId: string
  totalPresent: number
  totalAbsent: number
  totalLeave: number
  totalHoliday: number
  attendancePercentage: number
}

// Enriched class with teacher info and stats
export interface EnrichedClass {
  class: Class
  teacher: TeacherProfile
  teacherId: string
  studentCount: number
  totalRecords: number
}

// Daily summary for a class on a specific date
export interface DailyClassSummary {
  date: DateString
  classId: number
  className: string
  teacherName: string
  totalStudents: number
  present: number
  absent: number
  leave: number
  holiday: number
  unmarked: number
}

// ─── Filter State ─────────────────────────────────────────────────────────────

export interface AttendanceFilters {
  teacherId: string        // '' = all teachers
  classId: string          // '' = all classes
  status: AttendanceStatus | '' // '' = all statuses
  dateFrom: string
  dateTo: string
  search: string           // student name search
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

export interface ExcelRow {
  [key: string]: string | number
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

export type AdminTab = 'dashboard' | 'teachers' | 'students' | 'attendance' | 'reports' | 'settings'

// ─── Constants ────────────────────────────────────────────────────────────────

export const APP_NAME = 'Hajiri Sahayog'
export const APP_VERSION = '1.0.0'
export const DEVELOPER_NAME = 'Prem Jha'
export const DEVELOPER_EMAIL = 'premjha1714@gmail.com'

export const ATTENDANCE_STATUS_CONFIG: Record<AttendanceStatus, {
  label: string
  shortLabel: string
  bgLight: string
  textDark: string
  bg: string
}> = {
  present: {
    label: 'Present',
    shortLabel: 'P',
    bgLight: 'bg-present-light',
    textDark: 'text-present-dark',
    bg: 'bg-present',
  },
  absent: {
    label: 'Absent',
    shortLabel: 'A',
    bgLight: 'bg-absent-light',
    textDark: 'text-absent-dark',
    bg: 'bg-absent',
  },
  leave: {
    label: 'Leave',
    shortLabel: 'L',
    bgLight: 'bg-leave-light',
    textDark: 'text-leave-dark',
    bg: 'bg-leave',
  },
  holiday: {
    label: 'Holiday',
    shortLabel: 'H',
    bgLight: 'bg-holiday-light',
    textDark: 'text-holiday-dark',
    bg: 'bg-holiday',
  },
}