import { create } from 'zustand'
import type {
  AdminProfile, TeacherRecord, AdminTab,
  ToastMessage, AttendanceFilters,
} from '@/types'

// ─── State ────────────────────────────────────────────────────────────────────

interface AdminState {
  // Profile
  profile: AdminProfile | null

  // Imported teacher data
  teacherRecords: TeacherRecord[]

  // Selected teacher/class/student for detail views
  selectedTeacherId: string | null
  selectedClassId: number | null
  selectedStudentId: number | null

  // Filters for attendance view
  filters: AttendanceFilters

  // UI
  activeTab: AdminTab
  toasts: ToastMessage[]

  // Actions — Profile
  saveProfile: (profile: AdminProfile) => void
  updateProfile: (data: Partial<AdminProfile>) => void
  clearProfile: () => void

  // Actions — Teacher Records
  addTeacherRecords: (records: TeacherRecord[]) => void
  removeTeacherRecord: (teacherId: string) => void
  clearAllRecords: () => void

  // Actions — Selection
  selectTeacher: (id: string | null) => void
  selectClass: (id: number | null) => void
  selectStudent: (id: number | null) => void

  // Actions — Filters
  setFilters: (filters: Partial<AttendanceFilters>) => void
  resetFilters: () => void

  // Actions — UI
  setActiveTab: (tab: AdminTab) => void
  showToast: (type: ToastMessage['type'], message: string) => void
  dismissToast: (id: string) => void
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultFilters: AttendanceFilters = {
  teacherId: '',
  classId: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  search: '',
}

const STORAGE_KEY = 'hajiri_admin_profile'

function loadProfile(): AdminProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveProfileToStorage(profile: AdminProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    console.error('Failed to save admin profile')
  }
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAdminStore = create<AdminState>((set, get) => ({
  profile: loadProfile(),
  teacherRecords: [],
  selectedTeacherId: null,
  selectedClassId: null,
  selectedStudentId: null,
  filters: defaultFilters,
  activeTab: 'dashboard',
  toasts: [],

  // ── Profile ──────────────────────────────────────────────────────────────
  saveProfile: (profile) => {
    saveProfileToStorage(profile)
    set({ profile })
  },

  updateProfile: (data) => {
    const current = get().profile
    if (!current) return
    const updated = { ...current, ...data }
    saveProfileToStorage(updated)
    set({ profile: updated })
  },

  clearProfile: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ profile: null })
  },

  // ── Teacher Records ───────────────────────────────────────────────────────
  addTeacherRecords: (newRecords) => {
    const existing = get().teacherRecords
    // Avoid exact duplicate file names imported twice
    const existingFileNames = new Set(existing.map(r => r.fileName))
    const toAdd = newRecords.filter(r => !existingFileNames.has(r.fileName))
    const duplicates = newRecords.length - toAdd.length

    set({ teacherRecords: [...existing, ...toAdd] })

    if (toAdd.length > 0) {
      get().showToast('success', `${toAdd.length} teacher file${toAdd.length > 1 ? 's' : ''} imported`)
    }
    if (duplicates > 0) {
      get().showToast('warning', `${duplicates} duplicate file${duplicates > 1 ? 's' : ''} skipped`)
    }
  },

  removeTeacherRecord: (teacherId) => {
    set(s => ({
      teacherRecords: s.teacherRecords.filter(r => r.id !== teacherId),
      selectedTeacherId: s.selectedTeacherId === teacherId ? null : s.selectedTeacherId,
    }))
    get().showToast('info', 'Teacher file removed')
  },

  clearAllRecords: () => {
    set({
      teacherRecords: [],
      selectedTeacherId: null,
      selectedClassId: null,
      selectedStudentId: null,
      filters: defaultFilters,
    })
  },

  // ── Selection ─────────────────────────────────────────────────────────────
  selectTeacher: (id) => set({ selectedTeacherId: id, selectedClassId: null, selectedStudentId: null }),
  selectClass:   (id) => set({ selectedClassId: id, selectedStudentId: null }),
  selectStudent: (id) => set({ selectedStudentId: id }),

  // ── Filters ───────────────────────────────────────────────────────────────
  setFilters: (filters) => set(s => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),

  // ── UI ────────────────────────────────────────────────────────────────────
  setActiveTab: (tab) => set({ activeTab: tab }),

  showToast: (type, message) => {
    const id = generateId()
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => get().dismissToast(id), 3500)
  },

  dismissToast: (id) => set(s => ({
    toasts: s.toasts.filter(t => t.id !== id),
  })),
}))

// ─── Selector hooks ───────────────────────────────────────────────────────────

export const useProfile        = () => useAdminStore(s => s.profile)
export const useTeacherRecords = () => useAdminStore(s => s.teacherRecords)
export const useActiveTab      = () => useAdminStore(s => s.activeTab)
export const useToasts         = () => useAdminStore(s => s.toasts)
export const useFilters        = () => useAdminStore(s => s.filters)
export const useSelectedTeacher = () => {
  const records = useAdminStore(s => s.teacherRecords)
  const id = useAdminStore(s => s.selectedTeacherId)
  return records.find(r => r.id === id) ?? null
}