import { useState } from 'react'
import { Camera, Building2, Upload } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useAdminStore } from '@/store/useAdminStore'
import { compressImageToBase64, pickImageFile, getInitials } from '@/utils/imageUtils'
import { APP_NAME } from '@/types'

export function WelcomePage() {
  const saveProfile = useAdminStore(s => s.saveProfile)

  const [name, setName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>()
  const [logoBase64, setLogoBase64] = useState<string | undefined>()
  const [errors, setErrors] = useState<{ name?: string; schoolName?: string }>({})
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [logoLoading, setLogoLoading] = useState(false)

  const handlePickAvatar = async () => {
    const file = await pickImageFile()
    if (!file) return
    setAvatarLoading(true)
    try {
      const b64 = await compressImageToBase64(file, { maxWidth: 256, maxHeight: 256, quality: 0.8 })
      setAvatarBase64(b64)
    } finally {
      setAvatarLoading(false)
    }
  }

  const handlePickLogo = async () => {
    const file = await pickImageFile()
    if (!file) return
    setLogoLoading(true)
    try {
      const b64 = await compressImageToBase64(file, { maxWidth: 300, maxHeight: 300, quality: 0.85 })
      setLogoBase64(b64)
    } finally {
      setLogoLoading(false)
    }
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim()) e.name = 'Your name is required'
    if (!schoolName.trim()) e.schoolName = 'School name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      saveProfile({
        name: name.trim(),
        schoolName: schoolName.trim(),
        avatarBase64,
        logoBase64,
        createdAt: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50
                    flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center
                          shadow-elevated mx-auto mb-4">
            <span className="text-white text-2xl">📋</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{APP_NAME} Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Set up your admin profile to get started</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-6 flex flex-col gap-5">

          {/* Profile Picture + Logo side by side */}
          <div className="flex gap-4">

            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <p className="text-xs font-medium text-slate-500">Your Photo <span className="text-slate-300">(optional)</span></p>
              <button
                onClick={handlePickAvatar}
                disabled={avatarLoading}
                className="relative w-20 h-20 rounded-full border-2 border-dashed border-slate-200
                           hover:border-primary-400 transition-colors group overflow-hidden
                           bg-slate-50 flex items-center justify-center"
              >
                {avatarBase64 ? (
                  <>
                    <img src={avatarBase64} alt="avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
                                    transition-opacity flex items-center justify-center">
                      <Camera size={16} className="text-white" />
                    </div>
                  </>
                ) : name ? (
                  <span className="text-xl font-bold text-primary-400">{getInitials(name)}</span>
                ) : (
                  <Camera size={20} className="text-slate-300 group-hover:text-primary-400 transition-colors" />
                )}
              </button>
              {avatarLoading && <p className="text-xs text-slate-400">Processing...</p>}
              {avatarBase64 && (
                <button onClick={() => setAvatarBase64(undefined)}
                  className="text-xs text-absent hover:underline">Remove</button>
              )}
            </div>

            {/* Institution Logo */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <p className="text-xs font-medium text-slate-500">School Logo <span className="text-slate-300">(optional)</span></p>
              <button
                onClick={handlePickLogo}
                disabled={logoLoading}
                className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200
                           hover:border-primary-400 transition-colors group overflow-hidden
                           bg-slate-50 flex items-center justify-center"
              >
                {logoBase64 ? (
                  <>
                    <img src={logoBase64} alt="logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
                                    transition-opacity flex items-center justify-center">
                      <Upload size={16} className="text-white" />
                    </div>
                  </>
                ) : (
                  <Building2 size={20} className="text-slate-300 group-hover:text-primary-400 transition-colors" />
                )}
              </button>
              {logoLoading && <p className="text-xs text-slate-400">Processing...</p>}
              {logoBase64 && (
                <button onClick={() => setLogoBase64(undefined)}
                  className="text-xs text-absent hover:underline">Remove</button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Name + School */}
          <Input
            label="Your Name"
            placeholder="e.g. Sita Devi Sharma"
            value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
            error={errors.name}
            required
            autoFocus
          />

          <Input
            label="School / Institution Name"
            placeholder="e.g. Shree Saraswati Secondary School"
            value={schoolName}
            onChange={e => { setSchoolName(e.target.value); setErrors(p => ({ ...p, schoolName: undefined })) }}
            error={errors.schoolName}
            required
          />

          <div className="bg-primary-50 rounded-2xl px-4 py-3">
            <p className="text-xs text-primary-700 font-medium">
              ℹ️ Your profile is saved in this browser only. Import teacher backup files to start viewing attendance data.
            </p>
          </div>

          <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
            Enter Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}