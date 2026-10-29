import type { TeacherBackup, TeacherRecord } from '@/types'

// ─── Validate backup file shape ───────────────────────────────────────────────

export function isValidBackup(data: unknown): data is TeacherBackup {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return (
    typeof d.version === 'string' &&
    typeof d.profile === 'object' && d.profile !== null &&
    Array.isArray(d.classes) &&
    Array.isArray(d.students) &&
    Array.isArray(d.attendance) &&
    Array.isArray(d.holidays)
  )
}

// ─── Parse a single backup file ───────────────────────────────────────────────

export async function parseBackupFile(
  file: File,
): Promise<{ record: TeacherRecord; error: null } | { record: null; error: string }> {
  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!isValidBackup(data)) {
      return { record: null, error: `${file.name}: Invalid backup file format` }
    }

    const record: TeacherRecord = {
      id: `${data.profile.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      profile: data.profile,
      classes: data.classes ?? [],
      students: data.students ?? [],
      attendance: data.attendance ?? [],
      holidays: data.holidays ?? [],
      importedAt: new Date().toISOString(),
      fileName: file.name,
    }

    return { record, error: null }
  } catch {
    return { record: null, error: `${file.name}: Could not parse file` }
  }
}

// ─── Parse multiple backup files at once ──────────────────────────────────────

export interface ImportResult {
  records: TeacherRecord[]
  errors: string[]
  totalFiles: number
  successCount: number
}

export async function parseMultipleBackupFiles(files: File[]): Promise<ImportResult> {
  const records: TeacherRecord[] = []
  const errors: string[] = []

  await Promise.all(
    files.map(async file => {
      const result = await parseBackupFile(file)
      if (result.record) {
        records.push(result.record)
      } else {
        errors.push(result.error)
      }
    })
  )

  return {
    records,
    errors,
    totalFiles: files.length,
    successCount: records.length,
  }
}

// ─── File picker ──────────────────────────────────────────────────────────────

export function pickBackupFiles(): Promise<File[]> {
  return new Promise(resolve => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.multiple = true
    input.onchange = () => resolve(Array.from(input.files ?? []))
    input.oncancel = () => resolve([])
    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  })
}