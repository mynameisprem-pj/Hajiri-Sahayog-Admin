import { useState } from 'react'
import { Upload, Trash2, ChevronRight, Users, BookOpen, Calendar } from 'lucide-react'
import { TopBar, Button, Card, EmptyState, ConfirmDialog, Badge } from '@/components/ui'
import { useTeacherRecords, useAdminStore } from '@/store/useAdminStore'
import { parseMultipleBackupFiles, pickBackupFiles } from '@/utils/fileImport'
import type { TeacherRecord } from '@/types'

function TeacherCard({ record, onRemove, onSelect }: {
  record: TeacherRecord
  onRemove: () => void
  onSelect: () => void
}) {
  const importedDate = new Date(record.importedAt).toLocaleDateString('en', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <Card padding="none">
      <div className="flex items-center gap-4 p-5">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-primary-600">
            {record.profile.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-slate-800 truncate">{record.profile.name}</p>
            <Badge color="blue">{record.profile.dateSystem}</Badge>
          </div>
          <p className="text-xs text-slate-500 truncate">{record.profile.schoolName}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <BookOpen size={11} /> {record.classes.length} classes
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Users size={11} /> {record.students.length} students
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar size={11} /> {record.attendance.length} records
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRemove}
            className="p-2 rounded-xl text-slate-300 hover:text-absent hover:bg-absent-light
                       transition-all active:scale-90"
            aria-label="Remove teacher file"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onSelect}
            className="p-2 rounded-xl text-slate-300 hover:text-primary-600 hover:bg-primary-50
                       transition-all active:scale-90"
            aria-label="View teacher details"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-slate-50 flex items-center justify-between">
        <p className="text-xs text-slate-400">File: {record.fileName}</p>
        <p className="text-xs text-slate-400">Imported {importedDate}</p>
      </div>
    </Card>
  )
}

// ─── Teacher Detail ───────────────────────────────────────────────────────────

function TeacherDetail({ record, onBack }: { record: TeacherRecord; onBack: () => void }) {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack}
          className="text-sm text-primary-600 hover:underline font-medium">
          ← Teachers
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600 font-medium">{record.profile.name}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card padding="md">
          <p className="text-2xl font-bold text-slate-800">{record.classes.length}</p>
          <p className="text-sm text-slate-500 mt-1">Classes</p>
        </Card>
        <Card padding="md">
          <p className="text-2xl font-bold text-slate-800">{record.students.length}</p>
          <p className="text-sm text-slate-500 mt-1">Students</p>
        </Card>
        <Card padding="md">
          <p className="text-2xl font-bold text-slate-800">{record.attendance.length}</p>
          <p className="text-sm text-slate-500 mt-1">Attendance Records</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Classes</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {record.classes.map(cls => {
              const count = record.students.filter(s => s.classId === cls.id).length
              return (
                <div key={cls.id} className="flex items-center justify-between px-5 py-3.5">
                  <p className="text-sm font-medium text-slate-800">{cls.name}</p>
                  <Badge color="gray">{count} students</Badge>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Holidays */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">
              Holidays ({record.holidays.length})
            </h3>
          </div>
          {record.holidays.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No holidays</p>
          ) : (
            <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
              {record.holidays.map(h => (
                <div key={h.id} className="flex items-center justify-between px-5 py-3">
                  <p className="text-sm text-slate-700">{h.name}</p>
                  <p className="text-xs text-slate-400">{h.date}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ─── Teachers Page ────────────────────────────────────────────────────────────

export function TeachersPage() {
  const records = useTeacherRecords()
  const addTeacherRecords = useAdminStore(s => s.addTeacherRecords)
  const removeTeacherRecord = useAdminStore(s => s.removeTeacherRecord)
  const showToast = useAdminStore(s => s.showToast)

  const [removeTarget, setRemoveTarget] = useState<TeacherRecord | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<TeacherRecord | null>(null)

  const handleImport = async () => {
    const files = await pickBackupFiles()
    if (!files.length) return
    const result = await parseMultipleBackupFiles(files)
    addTeacherRecords(result.records)
    if (result.errors.length > 0) result.errors.forEach(e => showToast('error', e))
  }

  if (selectedRecord) {
    return <TeacherDetail record={selectedRecord} onBack={() => setSelectedRecord(null)} />
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <TopBar
        title="Teachers"
        subtitle={`${records.length} teacher file${records.length !== 1 ? 's' : ''} imported`}
        actions={
          <Button icon={<Upload size={15} />} onClick={handleImport}>
            Import Files
          </Button>
        }
      />

      {records.length === 0 ? (
        <EmptyState
          icon="👩‍🏫"
          title="No teacher files imported"
          description="Import .json backup files exported from the Hajiri Sahayog teacher app."
          action={
            <Button icon={<Upload size={16} />} onClick={handleImport}>
              Import Teacher Files
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {records.map(r => (
            <TeacherCard
              key={r.id}
              record={r}
              onRemove={() => setRemoveTarget(r)}
              onSelect={() => setSelectedRecord(r)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) removeTeacherRecord(removeTarget.id)
          setRemoveTarget(null)
        }}
        title="Remove Teacher File"
        message={`Remove ${removeTarget?.profile.name}'s data? This only removes it from this session — the original file is unaffected.`}
        confirmLabel="Remove"
      />
    </div>
  )
}