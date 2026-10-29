// ─── Compress and resize an image to Base64 ───────────────────────────────────

export interface ImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number   // 0-1, JPEG quality
  circle?: boolean   // crop to circle (for avatars)
}

export async function compressImageToBase64(
  file: File,
  options: ImageOptions = {},
): Promise<string> {
  const {
    maxWidth = 256,
    maxHeight = 256,
    quality = 0.75,
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => {
      const img = new Image()

      img.onload = () => {
        // Calculate scaled dimensions maintaining aspect ratio
        let { width, height } = img
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!

        ctx.drawImage(img, 0, 0, width, height)

        resolve(canvas.toDataURL('image/jpeg', quality))
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// ─── Open image file picker ───────────────────────────────────────────────────

export function pickImageFile(): Promise<File | null> {
  return new Promise(resolve => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp'
    input.onchange = () => resolve(input.files?.[0] ?? null)
    input.oncancel = () => resolve(null)
    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  })
}

// ─── Get initials from name ───────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w.charAt(0).toUpperCase())
    .join('')
}