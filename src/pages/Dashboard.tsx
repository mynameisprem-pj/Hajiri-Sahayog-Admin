import { useMemo } from 'react'
import { Upload, Users, BookOpen, CalendarCheck, TrendingDown, FileJson } from 'lucide-react'
import { Card, StatCard, TopBar, EmptyState, Button, Badge, PercentageBadge } from '@/components/ui'
import { useTeacherRecords, useAdminStore } from '@/store/useAdminStore'
import { getSchoolStats, getEnrichedStudents, getLowAttendanceStudents } from '@/utils/dataHelpers'
import { parseMultipleBackupFiles, pickBackupFiles } from '@/utils/fileImport'

export function DashboardPage() {
  const records = useTeacherRecords()
  const addTeacherRecords = useAdminStore(s => s.addTeacherRecords)
  const setActiveTab = useAdminStore(s => s.setActiveTab)
  const showToast = useAdminStore(s => s.showToast)

  const stats = useMemo(() => getSchoolStats(records), [records])
  const enriched = useMemo(() => getEnrichedStudents(records), [records])
  const lowAttendance = useMemo(() => getLowAttendanceStudents(enriched, 75).slice(0, 8), [enriched])

  const handleImport = async () => {
    const files = await pickBackupFiles()
    if (!files.length) return
    const result = await parseMultipleBackupFiles(files)
    addTeacherRecords(result.records)
    if (result.errors.length > 0) {
      result.errors.forEach(e => showToast('error', e))
    }
  }

  if (records.length === 0) {
    return (
      <div className="flex-1 p-8">
        <TopBar title="Dashboard" subtitle="School attendance overview" />
        <EmptyState
          icon={<FileJson size={32} />}
          title="No data imported yet"
          description="Import teacher backup files (.json) to see the school-wide attendance dashboard."
          action={
            <Button icon={<Upload size={16} />} onClick={handleImport}>
              Import Teacher Files
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <TopBar
        title="Dashboard"
        subtitle="School-wide attendance overview"
        actions={
          <Button size="sm" variant="secondary" icon={<Upload size={15} />} onClick={handleImport}>
            Import More Files
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Teachers"  value={stats.totalTeachers}  color="blue"   icon={<Users size={20} />} />
        <StatCard label="Classes"   value={stats.totalClasses}   color="slate"  icon={<BookOpen size={20} />} />
        <StatCard label="Students"  value={stats.totalStudents}  color="slate"  icon={<Users size={20} />} />
        <StatCard label="Avg. Attendance" value={`${stats.overallPresentPct}%`} color={stats.overallPresentPct >= 85 ? 'green' : stats.overallPresentPct >= 75 ? 'yellow' : 'red'} icon={<CalendarCheck size={20} />} />
      </div>

      {/* Attendance Breakdown */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Present"  value={stats.present}  color="green"  />
        <StatCard label="Absent"   value={stats.absent}   color="red"    />
        <StatCard label="Leave"    value={stats.leave}    color="yellow" />
        <StatCard label="Holiday"  value={stats.holiday}  color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Imported Teachers */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm">Imported Teachers</h2>
            <button onClick={() => setActiveTab('teachers')}
              className="text-xs text-primary-600 font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {records.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-600">
                    {r.profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{r.profile.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {r.classes.length} classes · {r.students.length} students
                  </p>
                </div>
                <Badge color="gray">{r.classes.length} cls</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Attendance Alert */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown size={16} className="text-absent" />
              <h2 className="font-semibold text-slate-800 text-sm">Low Attendance (&lt;75%)</h2>
            </div>
            <button onClick={() => setActiveTab('students')}
              className="text-xs text-primary-600 font-medium hover:underline">
              View All
            </button>
          </div>
          {lowAttendance.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-slate-400">All students above 75% 🎉</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {lowAttendance.map(e => (
                <div key={`${e.teacherId}-${e.student.id}`} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{e.student.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {e.class.name} · {e.teacher.name}
                    </p>
                  </div>
                  <PercentageBadge value={e.attendancePercentage} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}