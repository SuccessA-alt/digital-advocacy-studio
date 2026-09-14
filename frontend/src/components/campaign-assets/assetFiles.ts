export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 60_000)
}

export function readLocalImage(
  file: File,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reject(new Error('The file could not be read.'))
    }

    reader.onload = () => {
      const image = new Image()

      image.onload = () => resolve(image)

      image.onerror = () => {
        reject(
          new Error(
            'This image could not be opened. Try a PNG, JPEG or WebP file.',
          ),
        )
      }

      image.src = String(reader.result)
    }

    reader.readAsDataURL(file)
  })
}
