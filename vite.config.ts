import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ensureDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

const uploadRoot = path.resolve(__dirname, 'public', 'uploads')
const allowedUploadTypes = ['font', 'background'] as const
type UploadType = (typeof allowedUploadTypes)[number]

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9.\-_]/g, '-')

const uploadHandler = async (req: any, res: any, next: any) => {
  if (req.url !== '/api/upload' || req.method !== 'POST') {
    next()
    return
  }

  const chunks: Buffer[] = []
  req.on('data', (chunk: Buffer) => chunks.push(chunk))
  req.on('end', () => {
    try {
      const payload = JSON.parse(Buffer.concat(chunks).toString() || '{}') as {
        data?: string
        name?: string
        type?: UploadType
      }

      if (!payload.data) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Missing file data' }))
        return
      }

      const uploadType: UploadType = allowedUploadTypes.includes(payload.type as UploadType)
        ? (payload.type as UploadType)
        : 'background'

      const sanitizedBase64 = payload.data.replace(/^data:[^;]+;base64,/, '')
      const buffer = Buffer.from(sanitizedBase64, 'base64')
      const safeName = sanitizeFileName(payload.name || `upload-${Date.now()}`)
      const uniqueName = `${Date.now()}-${safeName}`

      const targetDir = path.join(uploadRoot, uploadType)
      ensureDirectory(targetDir)

      const filePath = path.join(targetDir, uniqueName)
      fs.writeFileSync(filePath, buffer)

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ url: `/uploads/${uploadType}/${uniqueName}`, name: safeName }))
    } catch (error) {
      res.statusCode = 500
      res.end(JSON.stringify({ error: 'Failed to save file' }))
    }
  })
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-upload-endpoint',
      configureServer(server) {
        ensureDirectory(uploadRoot)
        server.middlewares.use(uploadHandler)
      },
      configurePreviewServer(server) {
        ensureDirectory(uploadRoot)
        server.middlewares.use(uploadHandler)
      }
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
})
