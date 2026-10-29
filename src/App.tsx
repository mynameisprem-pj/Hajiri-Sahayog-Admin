import { useProfile, useActiveTab } from '@/store/useAdminStore'
import { Sidebar, ToastContainer } from '@/components/ui'
import {
  WelcomePage, DashboardPage, TeachersPage,
  StudentsPage, AttendancePage, ReportsPage, SettingsPage,
} from '@/pages'

export default function App() {
  const profile = useProfile()
  const activeTab = useActiveTab()

  // No profile — show welcome/setup
  if (!profile) {
    return (
      <>
        <WelcomePage />
        <ToastContainer />
      </>
    )
  }

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeTab === 'dashboard'  && <DashboardPage  />}
        {activeTab === 'teachers'   && <TeachersPage   />}
        {activeTab === 'students'   && <StudentsPage   />}
        {activeTab === 'attendance' && <AttendancePage />}
        {activeTab === 'reports'    && <ReportsPage    />}
        {activeTab === 'settings'   && <SettingsPage   />}
      </div>

      <ToastContainer />
    </div>
  )
}