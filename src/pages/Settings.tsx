import { useState } from 'react'
import { Camera, Building2, User, School, Trash2, Info, Mail } from 'lucide-react'
import {
  TopBar, Card, Button, Input, ConfirmDialog,
} from '@/components/ui'
import { useAdminStore, useProfile, useTeacherRecords } from '@/store/useAdminStore'
import { compressImageToBase64, pickImageFile, getInitials } from '@/utils/imageUtils'
import { APP_NAME, APP_VERSION, DEVELOPER_NAME, DEVELOPER_EMAIL } from '@/types'

// ─── Image Picker Box ─────────────────────────────────────────────────────────

interface ImagePickerProps {
  value?: string
  onPick: () => void
  onRemove: () => void
  label: string
  shape?: 'circle' | 'rounded'
  placeholder: React.ReactNode
  loading?: boolean
  name?: string
}

function ImagePickerBox({
  value, onPick, onRemove, label, shape = 'rounded',
  placeholder, loading, name,
}: ImagePickerProps) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <button
        onClick={onPick}
        disabled={loading}
        className={`relative w-20 h-20 ${shapeClass} border-2 border-dashed border-slate-200
                   hover:border-primary-400 transition-colors group overflow-hidden
                   bg-slate-50 flex items-center justify-center`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
                            transition-opacity flex items-center justify-center`}>
              <Camera size={16} className="text-white" />
            </div>
          </>
        ) : name ? (
          <span className="text-xl font-bold text-primary-400">{getInitials(name)}</span>
        ) : (
          <div className="text-slate-300 group-hover:text-primary-400 transition-colors">
            {placeholder}
          </div>
        )}
      </button>
      {loading && <p className="text-xs text-slate-400">Processing...</p>}
      {value && !loading && (
        <button onClick={onRemove} className="text-xs text-absent hover:underline">Remove</button>
      )}
    </div>
  )
}

// ─── Settings Row ─────────────────────────────────────────────────────────────

function SettingsRow({
  icon, label, value, onClick, danger = false,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`flex items-center gap-3 w-full px-5 py-4 text-left
                  ${onClick ? 'hover:bg-surface-tertiary transition-colors cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                       ${danger ? 'bg-absent-light text-absent' : 'bg-primary-50 text-primary-600'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-absent' : 'text-slate-800'}`}>{label}</p>
        {value && <p className="text-xs text-slate-400 mt-0.5 truncate">{value}</p>}
      </div>
    </button>
  )
}

// ─── Settings Page ────────────────────────────────────────────────────────────

export function SettingsPage() {
  const profile = useProfile()
  const records = useTeacherRecords()
  const updateProfile = useAdminStore(s => s.updateProfile)
  const clearProfile = useAdminStore(s => s.clearProfile)
  const clearAllRecords = useAdminStore(s => s.clearAllRecords)
  const showToast = useAdminStore(s => s.showToast)

  const [editOpen, setEditOpen] = useState(false)
  const [clearDataOpen, setClearDataOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  // Edit form
  const [name, setName] = useState(profile?.name ?? '')
  const [schoolName, setSchoolName] = useState(profile?.schoolName ?? '')
  const [avatarBase64, setAvatarBase64] = useState(profile?.avatarBase64)
  const [logoBase64, setLogoBase64] = useState(profile?.logoBase64)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [logoLoading, setLogoLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; schoolName?: string }>({})

  const openEdit = () => {
    setName(profile?.name ?? '')
    setSchoolName(profile?.schoolName ?? '')
    setAvatarBase64(profile?.avatarBase64)
    setLogoBase64(profile?.logoBase64)
    setErrors({})
    setEditOpen(true)
  }

  const handlePickAvatar = async () => {
    const file = await pickImageFile()
    if (!file) return
    setAvatarLoading(true)
    try {
      setAvatarBase64(await compressImageToBase64(file, { maxWidth: 256, maxHeight: 256, quality: 0.8 }))
    } finally { setAvatarLoading(false) }
  }

  const handlePickLogo = async () => {
    const file = await pickImageFile()
    if (!file) return
    setLogoLoading(true)
    try {
      setLogoBase64(await compressImageToBase64(file, { maxWidth: 300, maxHeight: 300, quality: 0.85 }))
    } finally { setLogoLoading(false) }
  }

  const handleSave = async () => {
    const e: typeof errors = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!schoolName.trim()) e.schoolName = 'School name is required'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setSaving(true)
    try {
      updateProfile({ name: name.trim(), schoolName: schoolName.trim(), avatarBase64, logoBase64 })
      setEditOpen(false)
      showToast('success', 'Profile updated')
    } finally { setSaving(false) }
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <TopBar title="Settings" />

      <div className="max-w-2xl flex flex-col gap-6">

        {/* Profile */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Profile</p>
          <Card padding="none">
            {/* Profile preview */}
            <div className="flex items-center gap-4 px-5 py-5 border-b border-slate-50">
              <div className="flex items-center gap-3">
                {profile?.avatarBase64 ? (
                  <img src={profile.avatarBase64} alt="avatar"
                    className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center
                                  justify-center text-primary-700 font-bold">
                    {profile ? getInitials(profile.name) : '?'}
                  </div>
                )}
                {profile?.logoBase64 && (
                  <img src={profile.logoBase64} alt="logo"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{profile?.name}</p>
                <p className="text-sm text-slate-400">{profile?.schoolName}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={openEdit}>Edit</Button>
            </div>
            <SettingsRow icon={<User size={16} />} label={profile?.name ?? ''} value="Your Name" />
            <div className="border-t border-slate-50 mx-5" />
            <SettingsRow icon={<School size={16} />} label={profile?.schoolName ?? ''} value="School Name" />
          </Card>
        </div>

        {/* Data */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Session Data</p>
          <Card padding="none">
            <SettingsRow
              icon={<Trash2 size={16} />}
              label="Clear Imported Files"
              value={`${records.length} teacher file${records.length !== 1 ? 's' : ''} in session`}
              onClick={() => setClearDataOpen(true)}
              danger
            />
          </Card>
          <p className="text-xs text-slate-400 mt-2 px-1">
            Clears all imported teacher data from this session. Original files are unaffected.
          </p>
        </div>

        {/* App Info */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">App Information</p>
          <Card padding="none">
            <SettingsRow icon={<Info size={16} />} label={`${APP_NAME} Admin`} value={`Version ${APP_VERSION}`} />
            <div className="border-t border-slate-50 mx-5" />
            <SettingsRow icon={<User size={16} />} label={`Developer: ${DEVELOPER_NAME}`} value="Built for teachers of Nepal" />
            <div className="border-t border-slate-50 mx-5" />
            <SettingsRow
              icon={<Mail size={16} />}
              label="Contact"
              value={DEVELOPER_EMAIL}
              onClick={() => window.open(`mailto:${DEVELOPER_EMAIL}`, '_blank')}
            />
          </Card>
        </div>

        {/* Danger Zone */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Danger Zone</p>
          <Card padding="none">
            <SettingsRow
              icon={<Trash2 size={16} />}
              label="Reset Admin Profile"
              value="Delete profile and return to setup"
              onClick={() => setResetOpen(true)}
              danger
            />
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-elevated p-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Edit Profile</h2>

            <div className="flex gap-6 justify-center mb-5">
              <ImagePickerBox
                value={avatarBase64}
                onPick={handlePickAvatar}
                onRemove={() => setAvatarBase64(undefined)}
                label="Your Photo"
                shape="circle"
                placeholder={<Camera size={20} />}
                loading={avatarLoading}
                name={name}
              />
              <ImagePickerBox
                value={logoBase64}
                onPick={handlePickLogo}
                onRemove={() => setLogoBase64(undefined)}
                label="School Logo"
                shape="rounded"
                placeholder={<Building2 size={20} />}
                loading={logoLoading}
              />
            </div>

            <div className="flex flex-col gap-4 mb-5">
              <Input
                label="Your Name"
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
                error={errors.name}
                required
              />
              <Input
                label="School / Institution Name"
                value={schoolName}
                onChange={e => { setSchoolName(e.target.value); setErrors(p => ({ ...p, schoolName: undefined })) }}
                error={errors.schoolName}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button fullWidth loading={saving} onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={clearDataOpen}
        onClose={() => setClearDataOpen(false)}
        onConfirm={() => { clearAllRecords(); setClearDataOpen(false) }}
        title="Clear Imported Files"
        message="This will remove all imported teacher data from this session. The original .json files on your device are not affected."
        confirmLabel="Clear All"
      />

      <ConfirmDialog
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => { clearAllRecords(); clearProfile(); setResetOpen(false) }}
        title="Reset Admin Profile"
        message="This will delete your admin profile and all session data. You will be taken back to the setup screen."
        confirmLabel="Reset"
      />
    </div>
  )
}