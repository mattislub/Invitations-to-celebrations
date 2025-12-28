import { useCallback, useEffect, useMemo, useState } from 'react'
import { ShieldCheck, Type as TypeIcon, Image as ImageIcon, Plus, RefreshCcw, Upload, Trash, Video as VideoIcon, Server, CloudOff, LayoutGrid, Layers, Edit3 } from 'lucide-react'
import { Language, getTranslation } from '../translations'
import { CustomInvitationType, Invitation, VideoBackground, AdminFont, AdminBackground, InvitationTemplate, SavedInvitationTemplate } from '../types'
import TemplateEditor from './TemplateEditor'

const MAX_UPLOAD_BYTES = 900 * 1024
const MAX_IMAGE_DIMENSION = 1920

const getDataUrlSize = (dataUrl: string) => {
  const base64 = dataUrl.split(',')[1] ?? dataUrl
  return Math.floor((base64.length * 3) / 4)
}

const optimizeImageForUpload = async (file: File) => {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image for optimization'))
      img.src = objectUrl
    })

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Unable to draw image for optimization')
    }

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    let quality = 0.92
    let dataUrl = canvas.toDataURL('image/jpeg', quality)

    while (getDataUrlSize(dataUrl) > MAX_UPLOAD_BYTES && quality > 0.55) {
      quality -= 0.1
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }

    if (getDataUrlSize(dataUrl) > MAX_UPLOAD_BYTES) {
      return null
    }

    const optimizedName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return { dataUrl, name: optimizedName }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

interface AdminProps {
  language: Language
  customTypes: CustomInvitationType[]
  onCustomTypesChange: (types: CustomInvitationType[]) => void
  invitations: Invitation[]
  onInvitationsChange: (invitations: Invitation[]) => void
  backgrounds: AdminBackground[]
  onBackgroundsChange: (backgrounds: AdminBackground[]) => void
  videoBackgrounds: VideoBackground[]
  onVideoBackgroundsChange: (backgrounds: VideoBackground[]) => void
  template?: InvitationTemplate | null
  onTemplateChange?: (template: InvitationTemplate | null) => void
  savedTemplates?: SavedInvitationTemplate[]
  onSavedTemplatesChange?: (templates: SavedInvitationTemplate[]) => void
}

interface SyncPayload {
  customTypes: CustomInvitationType[]
  invitations: Invitation[]
  videoBackgrounds: VideoBackground[]
  fonts: AdminFont[]
  backgrounds: AdminBackground[]
  template?: InvitationTemplate | null
  savedTemplates?: SavedInvitationTemplate[]
}

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'disabled'

const mergeBackgrounds = (existing: AdminBackground[], uploads: AdminBackground[]) => {
  const seen = new Set(existing.map((bg) => bg.file || bg.preview || bg.id))

  const uniqueUploads = uploads.filter((bg) => {
    const key = bg.file || bg.preview || bg.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return [...existing, ...uniqueUploads]
}

export default function Admin({
  language,
  customTypes,
  onCustomTypesChange,
  invitations,
  onInvitationsChange,
  backgrounds,
  onBackgroundsChange,
  videoBackgrounds,
  onVideoBackgroundsChange,
  template,
  onTemplateChange,
  savedTemplates = [],
  onSavedTemplatesChange
}: AdminProps) {
  const t = getTranslation(language)
  const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  const apiBaseUrl = (configuredApiBaseUrl && configuredApiBaseUrl !== '')
    ? configuredApiBaseUrl.replace(/\/$/, '')
    : '/api'
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [fonts, setFonts] = useState<AdminFont[]>([
    { id: 'assistant', name: 'Assistant', url: 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap' },
    { id: 'playfair', name: 'Playfair Display', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap' }
  ])
  const [newFont, setNewFont] = useState({ name: '', url: '' })
  const [newFontFile, setNewFontFile] = useState<File | null>(null)
  const [newBackground, setNewBackground] = useState({ name: '', preview: '' })
  const [newBackgroundFile, setNewBackgroundFile] = useState<File | null>(null)
  const [newVideoBackground, setNewVideoBackground] = useState({ name: '', url: '', previewImage: '' })
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null)
  const [newVideoPreviewFile, setNewVideoPreviewFile] = useState<File | null>(null)
  const [newInvitationType, setNewInvitationType] = useState({ nameHe: '', nameYi: '', nameEn: '' })
  const [statusMessage, setStatusMessage] = useState('')
  const [, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'backgrounds' | 'videos' | 'fonts' | 'templates'>('overview')

  useEffect(() => {
    console.info('[Admin] Using API base URL:', apiBaseUrl)
  }, [apiBaseUrl])

  const stats = useMemo(() => ([
    { label: t.admin.stats.invitations, value: invitations.length, icon: ImageIcon, accent: 'from-amber-600 to-orange-500' },
    { label: t.admin.stats.fonts, value: fonts.length, icon: TypeIcon, accent: 'from-blue-500 to-indigo-500' },
    { label: t.admin.stats.backgrounds, value: backgrounds.length, icon: ImageIcon, accent: 'from-emerald-500 to-teal-500' },
    { label: t.admin.stats.videoBackgrounds, value: videoBackgrounds.length, icon: VideoIcon, accent: 'from-purple-500 to-indigo-500' },
    { label: t.admin.stats.templates, value: savedTemplates.length, icon: Edit3, accent: 'from-amber-500 to-yellow-500' }
  ]), [fonts.length, backgrounds.length, savedTemplates.length, videoBackgrounds.length, invitations.length, t])

  const adminTabs = useMemo(() => ([
    { id: 'overview' as const, label: t.admin.title, description: t.admin.subtitle, icon: ShieldCheck },
    { id: 'types' as const, label: t.admin.sections.invitationTypes.title, description: t.admin.sections.invitationTypes.description, icon: TypeIcon },
    { id: 'backgrounds' as const, label: t.admin.sections.backgrounds.title, description: t.admin.sections.backgrounds.description, icon: ImageIcon },
    { id: 'videos' as const, label: t.admin.sections.videoBackgrounds.title, description: t.admin.sections.videoBackgrounds.description, icon: VideoIcon },
    { id: 'fonts' as const, label: t.admin.sections.fonts.title, description: t.admin.sections.fonts.description, icon: TypeIcon },
    { id: 'templates' as const, label: t.templateEditor.title, description: t.templateEditor.subtitle, icon: Edit3 }
  ]), [t])

  const handleAddFont = () => {
    if (!newFont.name.trim() || !newFont.url.trim() || !newFontFile) {
      setStatusMessage(t.admin.messages.uploadError)
      return
    }
    setFonts(prev => [...prev, { id: crypto.randomUUID(), ...newFont, file: newFontFile?.name }])
    setNewFont({ name: '', url: '' })
    setNewFontFile(null)
    setStatusMessage('')
  }

  const handleAddBackground = () => {
    console.info('[Admin] Add background clicked', {
      name: newBackground.name,
      hasPreview: Boolean(newBackground.preview.trim()),
      hasFile: Boolean(newBackgroundFile),
      fileName: newBackgroundFile?.name
    })

    if (!newBackground.name.trim() || !newBackground.preview.trim() || !newBackgroundFile) {
      console.warn('[Admin] Add background blocked - missing required fields', {
        hasName: Boolean(newBackground.name.trim()),
        hasPreview: Boolean(newBackground.preview.trim()),
        hasFile: Boolean(newBackgroundFile)
      })
      setStatusMessage(t.admin.messages.uploadError)
      return
    }

    const newEntry = { id: crypto.randomUUID(), ...newBackground, file: newBackgroundFile?.name }
    console.info('[Admin] Adding background to state', {
      id: newEntry.id,
      name: newEntry.name,
      file: newEntry.file,
      previewLength: newEntry.preview.length
    })

    onBackgroundsChange([...backgrounds, newEntry])
    setNewBackground({ name: '', preview: '' })
    setNewBackgroundFile(null)
    setStatusMessage('')
  }

  const handleAddVideoBackground = () => {
    if (!newVideoBackground.name.trim() || !newVideoBackground.url.trim() || !newVideoFile) {
      setStatusMessage(t.admin.messages.uploadError)
      return
    }
    onVideoBackgroundsChange([
      ...videoBackgrounds,
      { id: crypto.randomUUID(), ...newVideoBackground, previewImage: newVideoBackground.previewImage || undefined }
    ])
    setNewVideoBackground({ name: '', url: '', previewImage: '' })
    setNewVideoFile(null)
    setNewVideoPreviewFile(null)
    setStatusMessage('')
  }

  const handleAddInvitationType = () => {
    if (!newInvitationType.nameHe.trim() || !newInvitationType.nameEn.trim()) return
    const updatedTypes = [...customTypes, { id: crypto.randomUUID(), ...newInvitationType }]
    onCustomTypesChange(updatedTypes)
    setNewInvitationType({ nameHe: '', nameYi: '', nameEn: '' })
  }

  const handleRemoveInvitationType = (id: string) => {
    onCustomTypesChange(customTypes.filter(type => type.id !== id))
  }

  const handleRemoveVideoBackground = (id: string) => {
    onVideoBackgroundsChange(videoBackgrounds.filter(bg => bg.id !== id))
  }

  const handleFileUpload = async (file: File, type: 'font' | 'background' | 'video' | 'image' | 'preview'): Promise<string | null> => {
    setUploading(true)
    setStatusMessage(t.admin.messages.uploading)

    console.info('[Admin] Upload started', { type, name: file.name, size: file.size, apiBaseUrl })

    try {
      const isImage = file.type.startsWith('image/') || type === 'background' || type === 'image' || type === 'preview'
      let dataUrl: string | null = null
      let uploadName = file.name

      if (isImage) {
        const optimized = await optimizeImageForUpload(file)
        if (optimized) {
          dataUrl = optimized.dataUrl
          uploadName = optimized.name
          console.info('[Admin] Image optimized for upload', {
            originalSize: file.size,
            optimizedSize: getDataUrlSize(dataUrl)
          })
        } else {
          console.warn('[Admin] Upload blocked - optimized image still too large', {
            originalSize: file.size
          })
          setStatusMessage(t.admin.messages.uploadTooLarge)
          return null
        }
      }

      if (!dataUrl) {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        })
      }

      if (getDataUrlSize(dataUrl) > MAX_UPLOAD_BYTES) {
        console.warn('[Admin] Upload blocked - payload exceeds limit', {
          type,
          name: uploadName,
          payloadSize: getDataUrlSize(dataUrl)
        })
        setStatusMessage(t.admin.messages.uploadTooLarge)
        return null
      }

      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: dataUrl, name: uploadName, type })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed (${response.status}): ${errorText}`)
      }

      const result = await response.json() as { url?: string }
      if (!result.url) {
        throw new Error('Upload failed: missing URL in server response')
      }
      console.info('[Admin] Upload succeeded', { type, name: file.name, url: result.url })
      setStatusMessage('')
      return result.url
    } catch (error) {
      console.error('[Admin] Upload error', error)
      setStatusMessage(t.admin.messages.uploadError)
      return null
    } finally {
      setUploading(false)
    }
  }

  const syncToServer = useCallback(async () => {
    const payload: SyncPayload = {
      customTypes,
      invitations,
      videoBackgrounds,
      fonts,
      backgrounds,
      template: template ?? null,
      savedTemplates
    }

    setSyncStatus('syncing')

    try {
      console.info('[Admin] Syncing admin state to server...')
      const response = await fetch(`${apiBaseUrl}/admin/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('sync failed')
      }

      console.info('[Admin] Sync succeeded')
      setSyncStatus('success')
    } catch (error) {
      console.error('[Admin] Sync error', error)
      setSyncStatus('error')
    }
  }, [apiBaseUrl, backgrounds, customTypes, fonts, invitations, savedTemplates, template, videoBackgrounds])

  useEffect(() => {
    const fetchData = async () => {
      setSyncStatus('syncing')
      try {
        console.info('[Admin] Fetching admin state from server...')
        const [stateResponse, backgroundsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/admin/state`),
          fetch(`${apiBaseUrl}/admin/backgrounds`)
        ])

        if (!stateResponse.ok) {
          throw new Error('Failed to fetch admin state')
        }

        const payload = await stateResponse.json() as Partial<SyncPayload>

        let uploadedBackgrounds: AdminBackground[] = []
        if (backgroundsResponse.ok) {
          const uploadsPayload = await backgroundsResponse.json() as { backgrounds?: AdminBackground[] }
          uploadedBackgrounds = uploadsPayload.backgrounds ?? []
        }

        if (payload.fonts) setFonts(payload.fonts)
        if (payload.backgrounds) {
          const mergedBackgrounds = mergeBackgrounds(payload.backgrounds, uploadedBackgrounds)
          onBackgroundsChange(mergedBackgrounds)
        } else if (uploadedBackgrounds.length > 0) {
          onBackgroundsChange(mergeBackgrounds([], uploadedBackgrounds))
        }
        if (payload.customTypes) onCustomTypesChange(payload.customTypes)
        if (payload.invitations) onInvitationsChange(payload.invitations)
        if (payload.videoBackgrounds) onVideoBackgroundsChange(payload.videoBackgrounds)
        if ('template' in payload && onTemplateChange) onTemplateChange(payload.template ?? null)
        if (payload.savedTemplates && onSavedTemplatesChange) onSavedTemplatesChange(payload.savedTemplates)

        console.info('[Admin] Admin state fetched', {
          fonts: payload.fonts?.length ?? 0,
          backgrounds: payload.backgrounds?.length ?? 0,
          invitations: payload.invitations?.length ?? 0,
          templateFields: payload.template?.fields?.length ?? 0,
          templateTexts: payload.template?.textLines?.length ?? 0
        })
        setSyncStatus('success')
      } catch (error) {
        console.error('[Admin] Fetch error', error)
        setSyncStatus('error')
      }
    }

    void fetchData()
  }, [apiBaseUrl, onBackgroundsChange, onCustomTypesChange, onInvitationsChange, onSavedTemplatesChange, onTemplateChange, onVideoBackgroundsChange])

  // Sync to server only when user triggers save, keeping admin console predictable.

  const handleFontFileChange = async (file: File | null) => {
    if (!file) return
    setNewFontFile(file)
    const url = await handleFileUpload(file, 'font')
    if (url) {
      setNewFont(prev => ({ ...prev, url }))
    }
  }

  const handleBackgroundFileChange = async (file: File | null) => {
    if (!file) return

    console.info('[Admin] Background file selected', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    setNewBackgroundFile(file)
    const url = await handleFileUpload(file, 'background')
    if (url) {
      console.info('[Admin] Background preview URL received', { url })
      setNewBackground(prev => ({ ...prev, preview: url }))
    }
  }

  const handleVideoFileChange = async (file: File | null) => {
    if (!file) return
    setNewVideoFile(file)
    const url = await handleFileUpload(file, 'video')
    if (url) {
      setNewVideoBackground(prev => ({ ...prev, url }))
    }
  }

  const handlePreviewImageFileChange = async (file: File | null) => {
    if (!file) return
    setNewVideoPreviewFile(file)
    const url = await handleFileUpload(file, 'preview')
    if (url) {
      setNewVideoBackground(prev => ({ ...prev, previewImage: url }))
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-amber-100 text-amber-600 w-12 h-12 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">{t.admin.title}</h1>
          <p className="text-lg text-gray-600 mt-1">{t.admin.subtitle}</p>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          {statusMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
        <aside className="bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-24">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Layers className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm text-gray-500">{t.admin.server.title}</p>
              <p className="font-semibold text-gray-800">{t.admin.title}</p>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {adminTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                    isActive
                      ? 'border-amber-200 bg-amber-50 text-amber-700 shadow-sm'
                      : 'border-gray-100 hover:border-amber-200 hover:bg-amber-50/60 text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="font-semibold leading-tight">{tab.label}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{tab.description}</p>
                  </div>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <LayoutGrid className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm text-gray-500">{t.admin.subtitle}</p>
                    <h2 className="text-2xl font-bold text-gray-800">{t.admin.title}</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="bg-gradient-to-br from-white to-amber-50/50 shadow-lg rounded-2xl p-5 border border-amber-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.accent} flex items-center justify-center text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-500 flex items-center justify-center text-white">
                  {syncStatus === 'disabled' ? <CloudOff className="w-6 h-6" /> : <Server className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{t.admin.server.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {syncStatus === 'syncing' && t.admin.server.syncing}
                    {syncStatus === 'success' && t.admin.server.synced}
                    {syncStatus === 'error' && t.admin.server.error}
                    {syncStatus === 'disabled' && t.admin.server.disabled}
                    {syncStatus === 'idle' && t.admin.server.synced}
                  </p>
                </div>
                <button
                  onClick={syncToServer}
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold shadow hover:shadow-md disabled:opacity-60"
                  disabled={syncStatus === 'syncing' || syncStatus === 'disabled'}
                >
                  <RefreshCcw className="w-4 h-4" />
                  {t.admin.buttons.save}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="bg-white rounded-2xl shadow-xl p-2 border border-gray-100">
              <TemplateEditor
                language={language}
                backgrounds={backgrounds}
                onBackgroundsChange={onBackgroundsChange}
                videoBackgrounds={videoBackgrounds}
                onVideoBackgroundsChange={onVideoBackgroundsChange}
                template={template}
                savedTemplates={savedTemplates}
                onSavedTemplatesChange={onSavedTemplatesChange}
                onTemplateSave={(nextTemplate) => {
                  onTemplateChange?.(nextTemplate)
                  setStatusMessage(t.templateEditor.actions.saveTemplateSuccess)
                }}
              />
            </div>
          )}

          {activeTab === 'types' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <TypeIcon className="w-6 h-6 text-gray-800" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{t.admin.sections.invitationTypes.title}</h2>
                  <p className="text-gray-600 text-sm">{t.admin.sections.invitationTypes.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  value={newInvitationType.nameHe}
                  onChange={(e) => setNewInvitationType(prev => ({ ...prev, nameHe: e.target.value }))}
                  placeholder={t.admin.fields.name}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
                <input
                  type="text"
                  value={newInvitationType.nameYi}
                  onChange={(e) => setNewInvitationType(prev => ({ ...prev, nameYi: e.target.value }))}
                  placeholder={t.admin.fields.yiddishName}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
                <input
                  type="text"
                  value={newInvitationType.nameEn}
                  onChange={(e) => setNewInvitationType(prev => ({ ...prev, nameEn: e.target.value }))}
                  placeholder={t.admin.fields.englishName}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
              </div>

              <button
                onClick={handleAddInvitationType}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                {t.admin.buttons.add}
              </button>

              <div className="mt-6 space-y-3">
                {customTypes.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-6">{t.admin.messages.empty}</p>
                )}
                {customTypes.map((type) => (
                  <div key={type.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">{type.nameHe}</p>
                      <p className="text-sm text-gray-600">{t.admin.fields.yiddishName}: {type.nameYi || '-'}</p>
                      <p className="text-sm text-gray-600">{t.admin.fields.englishName}: {type.nameEn}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveInvitationType(type.id)}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      title={t.admin.buttons.delete}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'backgrounds' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon className="w-6 h-6 text-emerald-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{t.admin.sections.backgrounds.title}</h2>
                  <p className="text-gray-600 text-sm">{t.admin.sections.backgrounds.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={newBackground.name}
                  onChange={(e) => setNewBackground(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.admin.fields.name}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={newBackground.preview}
                  readOnly
                  placeholder={t.admin.fields.url}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"
                />
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">{t.admin.fields.file}</span>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBackgroundFileChange(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {newBackgroundFile && (
                      <p className="text-xs text-gray-500 mt-1">{newBackgroundFile.name}</p>
                    )}
                  </div>
                </label>
              </div>

              <button
                onClick={handleAddBackground}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                {t.admin.buttons.add}
              </button>

              <div className="mt-6 grid md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {backgrounds.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-6 md:col-span-2">{t.admin.messages.empty}</p>
                )}
                {backgrounds.map(bg => (
                  <div key={bg.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-14 h-14 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${bg.preview})` }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">{bg.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{bg.preview}</p>
                        {bg.file && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Upload className="w-3 h-3" />
                            <span>{bg.file}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <VideoIcon className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{t.admin.sections.videoBackgrounds.title}</h2>
                  <p className="text-gray-600 text-sm">{t.admin.sections.videoBackgrounds.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={newVideoBackground.name}
                  onChange={(e) => setNewVideoBackground(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.admin.fields.name}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={newVideoBackground.url}
                  readOnly
                  placeholder={t.admin.fields.videoUrl}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"
                />
                <input
                  type="text"
                  value={newVideoBackground.previewImage}
                  readOnly
                  placeholder={t.admin.fields.preview}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"
                />
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">{t.admin.fields.file}</span>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoFileChange(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {newVideoFile && (
                      <p className="text-xs text-gray-500 mt-1">{newVideoFile.name}</p>
                    )}
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">{t.admin.fields.preview}</span>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePreviewImageFileChange(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {newVideoPreviewFile && (
                      <p className="text-xs text-gray-500 mt-1">{newVideoPreviewFile.name}</p>
                    )}
                  </div>
                </label>
              </div>

              <button
                onClick={handleAddVideoBackground}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                {t.admin.buttons.add}
              </button>

              <div className="mt-6 grid md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {videoBackgrounds.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-6 md:col-span-2">{t.admin.messages.empty}</p>
                )}
                {videoBackgrounds.map(bg => (
                  <div key={bg.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/80 flex-shrink-0 relative">
                      {bg.url && (
                        <video
                          className="w-full h-full object-cover"
                          src={bg.url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          poster={bg.previewImage}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <VideoIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800">{bg.name}</h3>
                      <p className="text-xs text-gray-500 break-all">{bg.url}</p>
                      {bg.previewImage && (
                        <p className="text-xs text-gray-400 break-all mt-1">{bg.previewImage}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveVideoBackground(bg.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title={t.admin.buttons.delete}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fonts' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <TypeIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{t.admin.sections.fonts.title}</h2>
                  <p className="text-gray-600 text-sm">{t.admin.sections.fonts.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={newFont.name}
                  onChange={(e) => setNewFont(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.admin.fields.name}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newFont.url}
                  readOnly
                  placeholder={t.admin.fields.url}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"
                />
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">{t.admin.fields.file}</span>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={(e) => handleFontFileChange(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {newFontFile && (
                      <p className="text-xs text-gray-500 mt-1">{newFontFile.name}</p>
                    )}
                  </div>
                </label>
              </div>

              <button
                onClick={handleAddFont}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                {t.admin.buttons.add}
              </button>

              <div className="mt-6 space-y-3 max-h-60 overflow-y-auto">
                {fonts.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-6">{t.admin.messages.empty}</p>
                )}
                {fonts.map(font => (
                  <div key={font.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-1">
                    <h3 className="font-semibold text-gray-800">{font.name}</h3>
                    <p className="text-xs text-gray-500 break-all">{font.url}</p>
                    {font.file && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>{font.file}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
