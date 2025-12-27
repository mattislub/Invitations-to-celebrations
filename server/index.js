import { createServer } from 'http'
import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, 'data')
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const DATA_FILE = path.join(DATA_DIR, 'admin-state.json')

const ensureDirs = async () => {
  await mkdir(DATA_DIR, { recursive: true })
  await mkdir(UPLOADS_DIR, { recursive: true })
}

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk.toString()
    if (body.length > 25 * 1024 * 1024) {
      reject(new Error('Payload too large'))
      req.destroy()
    }
  })
  req.on('end', () => {
    try {
      resolve(body ? JSON.parse(body) : {})
    } catch (error) {
      reject(error)
    }
  })
  req.on('error', reject)
})

const sendJson = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(JSON.stringify(data))
}

const serveFile = async (res, filePath) => {
  try {
    const file = await readFile(filePath)
    const ext = path.extname(filePath)
    const type = ext === '.mp4' ? 'video/mp4' : ext === '.png' || ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'application/octet-stream'
    res.writeHead(200, {
      'Content-Type': type,
      'Access-Control-Allow-Origin': '*'
    })
    res.end(file)
  } catch {
    res.writeHead(404)
    res.end()
  }
}

const getAdminState = async () => {
  try {
    await stat(DATA_FILE)
    const content = await readFile(DATA_FILE, 'utf8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

const saveAdminState = async (data) => {
  await ensureDirs()
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

const saveUpload = async (name, type, dataUrl, hostInfo) => {
  const [, base64Data] = dataUrl.split('base64,')
  if (!base64Data) {
    throw new Error('Invalid file payload')
  }

  const buffer = Buffer.from(base64Data, 'base64')
  const safeName = name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const folder = path.join(UPLOADS_DIR, type)
  await mkdir(folder, { recursive: true })
  const filename = `${Date.now()}-${safeName}`
  const filePath = path.join(folder, filename)
  await writeFile(filePath, buffer)

  const protocol = hostInfo.protocol ?? 'http'
  const host = hostInfo.host ?? 'localhost'
  return `${protocol}://${host}/api/uploads/${type}/${filename}`
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const { pathname } = url

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    res.end()
    return
  }

  if (pathname.startsWith('/api/uploads/') || pathname.startsWith('/uploads/')) {
    const filePath = path.join(UPLOADS_DIR, pathname.replace(/^\/(?:api\/)?uploads\//, ''))
    await serveFile(res, filePath)
    return
  }

  if (pathname === '/api/admin/state' && req.method === 'GET') {
    const data = await getAdminState()
    sendJson(res, 200, data)
    return
  }

  if (pathname === '/api/admin/state' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req)
      await saveAdminState(body)
      sendJson(res, 200, { ok: true })
    } catch (error) {
      sendJson(res, 400, { error: error.message })
    }
    return
  }

  if (pathname === '/api/upload' && req.method === 'POST') {
    try {
      const { data, name, type } = await readJsonBody(req)
      if (!data || !name || !type) {
        sendJson(res, 400, { error: 'Missing upload fields' })
        return
      }

      const forwardedProto = req.headers['x-forwarded-proto']
      const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || 'http'
      const url = await saveUpload(name, type, data, {
        protocol,
        host: req.headers.host
      })
      sendJson(res, 200, { url })
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Upload failed' })
    }
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' })
  res.end('Not found')
})

const PORT = Number(process.env.PORT || 4000)

ensureDirs().then(() => {
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
  })
}).catch((error) => {
  console.error('Failed to start server', error)
})
