import { useEffect, useMemo, useState } from 'react'
import { Plus, Type as TypeIcon, List, GripVertical, AlignLeft, Image as ImageIcon, X, Upload, Film } from 'lucide-react'
import { Language, getTranslation } from '../translations'
import { AdminBackground, VideoBackground } from '../types'

type FieldType = 'text' | 'date' | 'number'

interface TemplateField {
  id: string
  label: string
  type: FieldType
  required: boolean
}

interface TextLine {
  id: string
  text: string
  font: string
  fontSize: number
}

interface FontOption {
  id: string
  label: string
  css: string
}

interface TemplateEditorProps {
  language: Language
  backgrounds: AdminBackground[]
  onBackgroundsChange: (backgrounds: AdminBackground[]) => void
  videoBackgrounds: VideoBackground[]
  onVideoBackgroundsChange: (backgrounds: VideoBackground[]) => void
}

type BackgroundOption = {
  id: string
  name: string
  type: 'image' | 'video'
  preview?: string
  videoUrl?: string
  isDefault?: boolean
}

export default function TemplateEditor({
  language,
  backgrounds,
  onBackgroundsChange,
  videoBackgrounds,
  onVideoBackgroundsChange
}: TemplateEditorProps) {
  const t = getTranslation(language)
  type PanelKey = 'background' | 'fields' | 'text'

  const [fields, setFields] = useState<TemplateField[]>([
    { id: crypto.randomUUID(), label: language === 'he' ? 'שם מלא' : 'Full Name', type: 'text', required: true },
    { id: crypto.randomUUID(), label: language === 'he' ? 'תאריך אירוע' : 'Event Date', type: 'date', required: false }
  ])
  const [textLines, setTextLines] = useState<TextLine[]>([
    { id: crypto.randomUUID(), text: language === 'he' ? 'באהבה רבה' : 'With great joy', font: 'Playfair Display, serif', fontSize: 26 },
    { id: crypto.randomUUID(), text: language === 'he' ? 'נשמח לראותכם' : 'Looking forward to celebrating together', font: 'Assistant, sans-serif', fontSize: 18 }
  ])
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newFieldType, setNewFieldType] = useState<FieldType>('text')
  const [newTextLine, setNewTextLine] = useState('')
  const [selectedFont, setSelectedFont] = useState<string>('Assistant, sans-serif')
  const [selectedFontSize, setSelectedFontSize] = useState<number>(18)
  const [templateWidth, setTemplateWidth] = useState<number>(1080)
  const [templateHeight, setTemplateHeight] = useState<number>(1920)
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null)
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null)
  const [activePanel, setActivePanel] = useState<PanelKey | null>('background')
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string>('')

  const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  const apiBaseUrl = (configuredApiBaseUrl && configuredApiBaseUrl !== '') ? configuredApiBaseUrl.replace(/\/$/, '') : '/api'

  const backgroundOptions: BackgroundOption[] = useMemo(() => {
    const uploadedBackgrounds = backgrounds.map<BackgroundOption>((bg) => ({
      id: `image-${bg.id}`,
      name: bg.name,
      type: 'image',
      preview: bg.preview
    }))

    const uploadedVideos = videoBackgrounds.map<BackgroundOption>((bg) => ({
      id: `video-${bg.id}`,
      name: bg.name,
      type: 'video',
      preview: bg.previewImage,
      videoUrl: bg.url
    }))

    return [
      ...uploadedBackgrounds,
      ...uploadedVideos
    ]
  }, [backgrounds, videoBackgrounds])

  useEffect(() => {
    if (backgroundOptions.length === 0) return
    setSelectedBackgroundId((current) => {
      const exists = backgroundOptions.some((option) => option.id === current)
      return exists ? current : backgroundOptions[0].id
    })
  }, [backgroundOptions])

  const selectedBackground = useMemo(
    () => backgroundOptions.find((option) => option.id === selectedBackgroundId),
    [backgroundOptions, selectedBackgroundId]
  )

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  const uploadFileToServer = async (file: File, type: 'background' | 'video') => {
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataUrl, name: file.name, type })
      })

      if (!response.ok) {
        console.error('[TemplateEditor] Upload failed', { status: response.status })
        return null
      }

      const result = await response.json() as { url?: string }
      return result.url ?? null
    } catch (error) {
      console.error('[TemplateEditor] Upload error', error)
      return null
    }
  }

  const renderBackgroundMedia = (option?: BackgroundOption, baseOpacity = 1) => {
    if (!option) return null

    if (option.type === 'video' && option.videoUrl) {
      return (
        <video
          key={option.id}
          className="absolute inset-0 w-full h-full object-cover"
          src={option.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{ opacity: baseOpacity }}
        />
      )
    }

    if (option.preview) {
      return (
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${option.preview})`, opacity: baseOpacity }}
        />
      )
    }

    return <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100" style={{ opacity: baseOpacity }} />
  }

  const handleImageBackgroundUpload = async (file: File | null) => {
    if (!file) return
    const url = await uploadFileToServer(file, 'background')
    if (!url) return

    const newBackground: AdminBackground = {
      id: crypto.randomUUID(),
      name: file.name,
      preview: url
    }
    onBackgroundsChange([...backgrounds, newBackground])
    setSelectedBackgroundId(`image-${newBackground.id}`)
  }

  const handleVideoBackgroundUpload = async (file: File | null) => {
    if (!file) return
    const url = await uploadFileToServer(file, 'video')
    if (!url) return

    const newVideo: VideoBackground = {
      id: crypto.randomUUID(),
      name: file.name,
      url
    }
    onVideoBackgroundsChange([...videoBackgrounds, newVideo])
    setSelectedBackgroundId(`video-${newVideo.id}`)
  }

  const fontOptions: FontOption[] = useMemo(
    () => [
      { id: 'assistant', label: 'Assistant', css: 'Assistant, sans-serif' },
      { id: 'playfair', label: 'Playfair Display', css: 'Playfair Display, serif' },
      { id: 'hebrew-serif', label: language === 'he' ? 'Noto Serif Hebrew' : 'Noto Serif Hebrew', css: '"Noto Serif Hebrew", serif' },
      { id: 'inter', label: 'Inter', css: 'Inter, sans-serif' }
    ],
    [language]
  )

  const addField = () => {
    if (!newFieldLabel.trim()) return
    setFields((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: newFieldLabel.trim(), type: newFieldType, required: false }
    ])
    setNewFieldLabel('')
    setNewFieldType('text')
  }

  const addTextLine = () => {
    if (!newTextLine.trim()) return
    setTextLines((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: newTextLine.trim(), font: selectedFont, fontSize: selectedFontSize }
    ])
    setNewTextLine('')
  }

  const toggleRequired = (id: string) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, required: !field.required } : field))
    )
  }

  const updateFieldType = (id: string, type: FieldType) => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, type } : field)))
  }

  const updateTextLine = (id: string, key: keyof TextLine, value: string | number) => {
    setTextLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, [key]: value } : line))
    )
  }

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id))
  }

  const removeTextLine = (id: string) => {
    setTextLines((prev) => prev.filter((line) => line.id !== id))
  }

  const reorder = <T extends { id: string }>(items: T[], draggingId: string, targetId: string) => {
    const draggingIndex = items.findIndex((item) => item.id === draggingId)
    const targetIndex = items.findIndex((item) => item.id === targetId)
    if (draggingIndex === -1 || targetIndex === -1) return items

    const updated = [...items]
    const [removed] = updated.splice(draggingIndex, 1)
    updated.splice(targetIndex, 0, removed)
    return updated
  }

  const handleFieldDrop = (targetId: string) => {
    if (!draggingFieldId || draggingFieldId === targetId) return
    setFields((prev) => reorder(prev, draggingFieldId, targetId))
    setDraggingFieldId(null)
  }

  const handleTextDrop = (targetId: string) => {
    if (!draggingTextId || draggingTextId === targetId) return
    setTextLines((prev) => reorder(prev, draggingTextId, targetId))
    setDraggingTextId(null)
  }

  const panelConfig: Record<PanelKey, { icon: typeof ImageIcon; label: string; helper?: string }> = {
    background: { icon: ImageIcon, label: t.templateEditor.background },
    fields: { icon: TypeIcon, label: t.templateEditor.fields, helper: t.templateEditor.dragHint },
    text: { icon: List, label: t.templateEditor.textLines, helper: t.templateEditor.dragHint }
  }
  const activePanelConfig = activePanel ? panelConfig[activePanel] : null

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'background':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-800">{t.templateEditor.backgrounds.library}</h4>
                <p className="text-sm text-gray-500">{t.templateEditor.backgrounds.libraryHelper}</p>
              </div>
              {backgroundOptions.length === 0 ? (
                <div className="p-4 rounded-xl bg-gray-50 text-gray-600 text-sm text-right">
                  {language === 'he'
                    ? 'אין רקעים זמינים עדיין. העלו רקעים בלשונית רקעים כדי להשתמש בהם כאן.'
                    : 'No backgrounds available yet. Upload backgrounds in the backgrounds tab to use them here.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {backgroundOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedBackgroundId(option.id)}
                      className={`text-right rounded-xl border overflow-hidden transition-all ${
                        selectedBackgroundId === option.id
                          ? 'border-amber-400 shadow-lg shadow-amber-100'
                          : 'border-gray-200 hover:border-amber-200 hover:shadow'
                      }`}
                    >
                      <div className="relative h-24">
                        {renderBackgroundMedia(option)}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold bg-white/80 text-gray-700">
                          {option.type === 'video'
                            ? t.templateEditor.backgrounds.videoBadge
                            : t.templateEditor.backgrounds.imageBadge}
                        </div>
                        {selectedBackgroundId === option.id && (
                          <div className="absolute inset-0 border-2 border-amber-400 rounded-xl pointer-events-none" />
                        )}
                      </div>
                      <div className="px-3 py-2">
                        <p className="font-semibold text-gray-800 line-clamp-1">{option.name}</p>
                        {option.isDefault && (
                          <p className="text-xs text-gray-500">{t.templateEditor.backgrounds.defaultLabel}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-800">{t.templateEditor.backgrounds.uploadTitle}</h4>
              <p className="text-sm text-gray-500">{t.templateEditor.backgrounds.uploadHelper}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-amber-300 transition">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{t.templateEditor.backgrounds.uploadImage}</p>
                    <p className="text-xs text-gray-500">{t.templateEditor.backgrounds.uploadImageHint}</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageBackgroundUpload(e.target.files?.[0] ?? null)}
                  />
                </label>
                <label className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-amber-300 transition">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{t.templateEditor.backgrounds.uploadVideo}</p>
                    <p className="text-xs text-gray-500">{t.templateEditor.backgrounds.uploadVideoHint}</p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleVideoBackgroundUpload(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">{t.templateEditor.dimensions.title}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-gray-700">{t.templateEditor.dimensions.width}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={320}
                      max={2000}
                      value={templateWidth}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (Number.isNaN(value)) return
                        setTemplateWidth(Math.min(Math.max(value, 320), 2000))
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-right"
                    />
                    <span className="text-sm text-gray-500">{t.templateEditor.dimensions.unit}</span>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm text-gray-700">{t.templateEditor.dimensions.height}</span>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={320}
                      max={3000}
                      value={templateHeight}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (Number.isNaN(value)) return
                        setTemplateHeight(Math.min(Math.max(value, 320), 3000))
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-right"
                    />
                    <span className="text-sm text-gray-500">{t.templateEditor.dimensions.unit}</span>
                  </div>
                </label>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="relative h-48 bg-gray-100">
                {renderBackgroundMedia(selectedBackground)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="relative z-10 p-4 flex items-end h-full">
                  <div>
                    <p className="text-white font-semibold">{selectedBackground?.name}</p>
                    <p className="text-sm text-white/80">
                      {selectedBackground?.type === 'video'
                        ? t.templateEditor.backgrounds.videoBadge
                        : t.templateEditor.backgrounds.imageBadge}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'fields':
        return (
          <div className="space-y-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200"
                draggable
                onDragStart={() => setDraggingFieldId(field.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleFieldDrop(field.id)}
              >
                <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                <div className="flex-1 text-right">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <span className="font-semibold text-gray-800">{field.label}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={field.type}
                        onChange={(e) => updateFieldType(field.id, e.target.value as FieldType)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="text">{t.templateEditor.options.types.text}</option>
                        <option value="date">{t.templateEditor.options.types.date}</option>
                        <option value="number">{t.templateEditor.options.types.number}</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={() => toggleRequired(field.id)}
                        />
                        {t.templateEditor.options.required}
                      </label>
                      <button
                        onClick={() => removeField(field.id)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        {t.admin.buttons.delete}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-3 grid md:grid-cols-3 gap-3">
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder={t.templateEditor.placeholders.fieldLabel}
                className="md:col-span-2 w-full border border-gray-300 rounded-lg px-4 py-3 text-right"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-right"
              >
                <option value="text">{t.templateEditor.options.types.text}</option>
                <option value="date">{t.templateEditor.options.types.date}</option>
                <option value="number">{t.templateEditor.options.types.number}</option>
              </select>
            </div>
            <button
              onClick={addField}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              {t.templateEditor.addField}
            </button>
          </div>
        )
      case 'text':
        return (
          <div className="space-y-3">
            {textLines.map((line) => (
              <div
                key={line.id}
                className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200"
                draggable
                onDragStart={() => setDraggingTextId(line.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleTextDrop(line.id)}
              >
                <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                <div className="flex-1">
                  <input
                    value={line.text}
                    onChange={(e) => updateTextLine(line.id, 'text', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 text-right"
                  />
                  <div className="flex flex-wrap gap-3 items-center">
                    <select
                      value={line.font}
                      onChange={(e) => updateTextLine(line.id, 'font', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {fontOptions.map((font) => (
                        <option key={font.id} value={font.css}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={12}
                      max={64}
                      value={line.fontSize}
                      onChange={(e) => updateTextLine(line.id, 'fontSize', Number(e.target.value))}
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => removeTextLine(line.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      {t.admin.buttons.delete}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-3 space-y-3">
              <textarea
                value={newTextLine}
                onChange={(e) => setNewTextLine(e.target.value)}
                placeholder={t.templateEditor.placeholders.textLine}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-right"
              />
              <div className="flex flex-wrap gap-3 items-center">
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {fontOptions.map((font) => (
                    <option key={font.id} value={font.css}>
                      {font.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min={12}
                    max={48}
                    value={selectedFontSize}
                    onChange={(e) => setSelectedFontSize(Number(e.target.value))}
                    className="w-40"
                  />
                  <span className="text-sm text-gray-600">{selectedFontSize}px</span>
                </div>
              </div>
              <button
                onClick={addTextLine}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                {t.templateEditor.addText}
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{t.templateEditor.title}</h2>
        <p className="text-lg text-gray-600">{t.templateEditor.subtitle}</p>
      </div>

      <div className="relative">
        <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-10 border border-amber-50">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{t.templateEditor.preview}</h3>
              <p className="text-sm text-gray-500">{t.templateEditor.dragHint}</p>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
              {t.templateEditor.previewFieldHint}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
            <div
              className="relative w-full transition-all duration-300"
              style={{
                aspectRatio: `${templateWidth}/${templateHeight}`,
                minHeight: '70vh'
              }}
            >
              {renderBackgroundMedia(selectedBackground, 0.95)}
              <div className="absolute inset-0 bg-white/85 backdrop-blur-sm rounded-xl p-6 sm:p-10 space-y-4 overflow-auto">
                {textLines.map((line) => (
                  <p
                    key={line.id}
                    style={{ fontFamily: line.font, fontSize: line.fontSize }}
                    className="text-gray-800 text-center"
                  >
                    {line.text}
                  </p>
                ))}
                <div className="grid gap-3">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 bg-amber-50/80 border border-dashed border-amber-300 rounded-lg px-4 py-3 shadow-sm cursor-move"
                      draggable
                      onDragStart={() => setDraggingFieldId(field.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleFieldDrop(field.id)}
                    >
                      <GripVertical className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="flex-1 text-right">
                        <p className="text-sm font-semibold text-amber-800">
                          {'{{ '}
                          {field.label}
                          {' }}'} {field.required && <span className="text-red-500">*</span>}
                        </p>
                        <p className="text-xs text-amber-700">{t.templateEditor.previewFieldHint}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed right-4 bottom-6 md:right-10 md:bottom-10 z-30">
          <div className="bg-white/95 backdrop-blur-md shadow-2xl border border-amber-100 rounded-full p-3 flex md:flex-col gap-3">
            {(Object.keys(panelConfig) as PanelKey[]).map((panel) => {
              const Icon = panelConfig[panel].icon
              const isActive = activePanel === panel
              return (
                <button
                  key={panel}
                  onClick={() => setActivePanel(isActive ? null : panel)}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-200'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-amber-50'
                  }`}
                  title={panelConfig[panel].label}
                  aria-label={panelConfig[panel].label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              )
            })}
          </div>
        </div>

        {activePanelConfig && (
          <div className="fixed left-4 right-4 bottom-24 md:bottom-auto md:top-24 md:right-[6.5rem] md:left-auto md:w-96 z-30">
            <div className="bg-white shadow-2xl border border-amber-100 rounded-2xl p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = activePanelConfig.icon
                      return <Icon className="w-5 h-5 text-amber-500" />
                    })()}
                    <h3 className="text-xl font-bold text-gray-800">{activePanelConfig.label}</h3>
                  </div>
                  {activePanelConfig.helper && (
                    <p className="text-sm text-gray-500 mt-1">{activePanelConfig.helper}</p>
                  )}
                </div>
                <button
                  onClick={() => setActivePanel(null)}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                  aria-label={language === 'he' ? 'סגור הגדרות' : 'Close settings'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderPanelContent()}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
