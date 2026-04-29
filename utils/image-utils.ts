/**
 * Converts an image Blob/File to WebP, resizing if larger than maxDimension.
 * Falls back to the original blob if conversion fails (e.g. environment limitation).
 */
export async function convertToWebP(
  file: Blob | File,
  quality = 0.85,
  maxDimension = 2400
): Promise<Blob> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      try {
        let { width, height } = img

        // Downscale very large images to save bandwidth
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width  = Math.round(width  * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width  = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file) // fallback: return original
          return
        }

        // Fill white background (handles transparent PNGs)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else resolve(file) // fallback if browser doesn't support WebP
          },
          'image/webp',
          quality
        )
      } catch {
        resolve(file) // always resolve, never reject
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file) // fallback: return original
    }

    img.src = objectUrl
  })
}
