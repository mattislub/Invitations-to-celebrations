import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Plus, Type as TypeIcon, List, GripVertical, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, X, Upload, Film, Move, Save, RefreshCcw } from 'lucide-react'
import { Language, getTranslation } from '../translations'
import { AdminBackground, InvitationTemplate, TemplateField, TemplateTextLine, VideoBackground, SavedInvitationTemplate } from '../types'
import { fetchWithApiFallback, getApiBaseUrlCandidates } from '../utils/api'

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
  template?: InvitationTemplate | null
  savedTemplates?: SavedInvitationTemplate[]
  onSavedTemplatesChange?: (templates: SavedInvitationTemplate[]) => void
  onTemplateSave?: (template: InvitationTemplate) => void
}

type BackgroundOption = {
  id: string
  name: string
  type: 'image' | 'video'
  preview?: string
  videoUrl?: string
  isDefault?: boolean
}

const DEFAULT_TEMPLATE_WIDTH = 1080
const DEFAULT_TEMPLATE_HEIGHT = 1920

const createDefaultFields = (language: Language): TemplateField[] => ([
  {
    id: crypto.randomUUID(),
    label: language === 'he' ? 'שם מלא' : 'Full Name',
    type: 'text',
    required: true,
    position: { x: 50, y: 60, width: 70, align: 'center' }
  },
  {
    id: crypto.randomUUID(),
    label: language === 'he' ? 'תאריך אירוע' : 'Event Date',
    type: 'text',
    required: false,
    position: { x: 50, y: 72, width: 60, align: 'center' }
  }
])

const createDefaultTextLines = (language: Language): TemplateTextLine[] => ([
  {
    id: crypto.randomUUID(),
    text: language === 'he' ? 'באהבה רבה' : 'With great joy',
    font: 'Playfair Display, serif',
    fontSize: 26,
    position: { x: 50, y: 20, width: 90, align: 'center' }
  },
  {
    id: crypto.randomUUID(),
    text: language === 'he' ? 'נשמח לראותכם' : 'Looking forward to celebrating together',
    font: 'Assistant, sans-serif',
    fontSize: 18,
    position: { x: 50, y: 30, width: 90, align: 'center' }
  }
])

export default function TemplateEditor({
  language,
  backgrounds,
  onBackgroundsChange,
  videoBackgrounds,
  onVideoBackgroundsChange,
  template,
  savedTemplates = [],
  onSavedTemplatesChange,
  onTemplateSave
}: TemplateEditorProps) {
  const t = getTranslation(language)
  type PanelKey = 'background' | 'fields' | 'text'

  const [fields, setFields] = useState<TemplateField[]>(() => createDefaultFields(language))
  const [textLines, setTextLines] = useState<TemplateTextLine[]>(() => createDefaultTextLines(language))
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newTextLine, setNewTextLine] = useState('')
  const [selectedFont, setSelectedFont] = useState<string>('Assistant, sans-serif')
  const [selectedFontSize, setSelectedFontSize] = useState<number>(18)
  const [templateWidth, setTemplateWidth] = useState<number>(DEFAULT_TEMPLATE_WIDTH)
  const [templateHeight, setTemplateHeight] = useState<number>(DEFAULT_TEMPLATE_HEIGHT)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null)
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null)
  const [draggingElement, setDraggingElement] = useState<{ type: 'field' | 'text'; id: string } | null>(null)
  const [activePanel, setActivePanel] = useState<PanelKey | null>('background')
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string>('')
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const PX_PER_INCH = 96
  const CM_PER_INCH = 2.54
  const PX_PER_CM = PX_PER_INCH / CM_PER_INCH

  const apiBaseUrlCandidates = useMemo(() => getApiBaseUrlCandidates(), [])

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

  useEffect(() => {
    if (!template) return
    setFields(template.fields?.length ? template.fields : createDefaultFields(language))
    setTextLines(template.textLines?.length ? template.textLines : createDefaultTextLines(language))
    setTemplateWidth(template.dimensions?.width ?? DEFAULT_TEMPLATE_WIDTH)
    setTemplateHeight(template.dimensions?.height ?? DEFAULT_TEMPLATE_HEIGHT)
    setSelectedBackgroundId(template.backgroundId ?? '')
    setTemplateName((current) => current || (language === 'he' ? 'תבנית חדשה' : 'New Template'))
  }, [language, template])

  useEffect(() => {
    if (!selectedTextId) return
    setSelectedTextId((current) =>
      textLines.some((line) => line.id === current) ? current : null
    )
  }, [selectedTextId, textLines])

  const selectedBackground = useMemo(
    () => backgroundOptions.find((option) => option.id === selectedBackgroundId),
    [backgroundOptions, selectedBackgroundId]
  )

  const buildTemplateSnapshot = () => ({
    fields,
    textLines,
    backgroundId: selectedBackgroundId || undefined,
    dimensions: {
      width: templateWidth,
      height: templateHeight
    }
  })

  const resetTemplateState = () => {
    setFields(createDefaultFields(language))
    setTextLines(createDefaultTextLines(language))
    setTemplateWidth(DEFAULT_TEMPLATE_WIDTH)
    setTemplateHeight(DEFAULT_TEMPLATE_HEIGHT)
    setSelectedBackgroundId('')
    setTemplateName('')
    setSelectedSavedId(null)
    setSaveMessage('')
    setActivePanel('background')
  }

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  const uploadFileToServer = async (file: File, type: 'background' | 'video') => {
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const result = await fetchWithApiFallback('/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataUrl, name: file.name, type })
      }, apiBaseUrlCandidates)
      const response = result.response

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

  const clampPercentage = (value: number) => Math.min(100, Math.max(0, value))
  const clampDimension = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
  const convertPixelsToCm = (value: number) => value / PX_PER_CM
  const convertPixelsToInches = (value: number) => value / PX_PER_INCH
  const convertCmToPixels = (value: number) => value * PX_PER_CM
  const convertInchesToPixels = (value: number) => value * PX_PER_INCH

  const dimensionPresets = useMemo(
    () => [
      {
        id: 'mobile',
        label: t.templateEditor.dimensions.presets.mobile,
        width: 1080,
        height: 1920
      },
      {
        id: 'square',
        label: t.templateEditor.dimensions.presets.square,
        width: 1200,
        height: 1200
      },
      {
        id: 'a5',
        label: t.templateEditor.dimensions.presets.a5,
        width: Math.round((148 / 25.4) * PX_PER_INCH),
        height: Math.round((210 / 25.4) * PX_PER_INCH)
      },
      {
        id: 'a4',
        label: t.templateEditor.dimensions.presets.a4,
        width: Math.round((210 / 25.4) * PX_PER_INCH),
        height: Math.round((297 / 25.4) * PX_PER_INCH)
      },
      {
        id: 'letter',
        label: t.templateEditor.dimensions.presets.letter,
        width: Math.round(8.5 * PX_PER_INCH),
        height: Math.round(11 * PX_PER_INCH)
      }
    ],
    [
      t.templateEditor.dimensions.presets.a4,
      t.templateEditor.dimensions.presets.a5,
      t.templateEditor.dimensions.presets.letter,
      t.templateEditor.dimensions.presets.mobile,
      t.templateEditor.dimensions.presets.square
    ]
  )

  const findPresetForDimensions = useCallback(
    (width: number, height: number) => {
      const tolerance = 2
      const preset = dimensionPresets.find(
        (option) =>
          Math.abs(option.width - width) <= tolerance && Math.abs(option.height - height) <= tolerance
      )
      return preset?.id ?? null
    },
    [dimensionPresets]
  )

  const updatePresetSelection = useCallback(
    (width: number, height: number) => {
      setSelectedPresetId(findPresetForDimensions(width, height))
    },
    [findPresetForDimensions]
  )

  const applyDimensionPreset = (presetId: string) => {
    const preset = dimensionPresets.find((option) => option.id === presetId)
    if (!preset) return
    setTemplateWidth(preset.width)
    setTemplateHeight(preset.height)
    setSelectedPresetId(presetId)
  }

  useEffect(() => {
    updatePresetSelection(templateWidth, templateHeight)
  }, [templateHeight, templateWidth, updatePresetSelection])

  const addField = () => {
    if (!newFieldLabel.trim()) return
    setFields((prev) => {
      const nextY = 50 + prev.length * 8
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          label: newFieldLabel.trim(),
          type: 'text',
          required: false,
          position: {
            x: 50,
            y: Math.min(95, nextY),
            width: 70,
            align: 'center'
          }
        }
      ]
    })
    setNewFieldLabel('')
  }

  const addTextLine = () => {
    if (!newTextLine.trim()) return
    setTextLines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: newTextLine.trim(),
        font: selectedFont,
        fontSize: selectedFontSize,
        position: {
          x: 50,
          y: Math.min(95, 20 + prev.length * 8),
          width: 90,
          align: 'center'
        }
      }
    ])
    setNewTextLine('')
  }

  const toggleRequired = (id: string) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, required: !field.required } : field))
    )
  }

  const updateFieldPosition = (id: string, key: 'x' | 'y' | 'width', value: number) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id
          ? {
              ...field,
              position: {
                ...field.position,
                [key]: clampPercentage(key === 'width' ? Math.max(value, 10) : value)
              }
            }
          : field
      )
    )
  }

  const updateFieldAlignment = (id: string, align: TemplateField['position']['align']) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, position: { ...field.position, align } } : field
      )
    )
  }

  const updateTextLine = (id: string, key: keyof TemplateTextLine, value: string | number) => {
    setTextLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, [key]: value } : line))
    )
  }

  const updateTextPosition = (id: string, key: 'x' | 'y' | 'width', value: number) => {
    setTextLines((prev) =>
      prev.map((line) =>
        line.id === id
          ? {
              ...line,
              position: {
                ...line.position,
                [key]: clampPercentage(key === 'width' ? Math.max(value, 10) : value)
              }
            }
          : line
      )
    )
  }

  const updateTextAlignment = (id: string, align: TemplateTextLine['position']['align']) => {
    setTextLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, position: { ...line.position, align } } : line))
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

  const moveElementTo = (type: 'field' | 'text', id: string, x: number, y: number) => {
    const clampedX = clampPercentage(x)
    const clampedY = clampPercentage(y)
    if (type === 'field') {
      setFields((prev) =>
        prev.map((field) =>
          field.id === id
            ? { ...field, position: { ...field.position, x: clampedX, y: clampedY } }
            : field
        )
      )
    } else {
      setTextLines((prev) =>
        prev.map((line) =>
          line.id === id ? { ...line, position: { ...line.position, x: clampedX, y: clampedY } } : line
        )
      )
    }
  }

  const moveSelectedTextBy = useCallback(
    (deltaX: number, deltaY: number) => {
      if (!selectedTextId) return
      setTextLines((prev) =>
        prev.map((line) =>
          line.id === selectedTextId
            ? {
                ...line,
                position: {
                  ...line.position,
                  x: clampPercentage(line.position.x + deltaX),
                  y: clampPercentage(line.position.y + deltaY)
                }
              }
            : line
        )
      )
    },
    [selectedTextId]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedTextId) return
      const target = event.target as HTMLElement | null
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.getAttribute('contenteditable') === 'true')
      ) {
        return
      }

      const step = event.shiftKey ? 2 : 1
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          moveSelectedTextBy(0, -step)
          break
        case 'ArrowDown':
          event.preventDefault()
          moveSelectedTextBy(0, step)
          break
        case 'ArrowLeft':
          event.preventDefault()
          moveSelectedTextBy(-step, 0)
          break
        case 'ArrowRight':
          event.preventDefault()
          moveSelectedTextBy(step, 0)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [moveSelectedTextBy, selectedTextId])

  const startDraggingElement = (event: ReactPointerEvent, type: 'field' | 'text', id: string) => {
    event.preventDefault()
    setDraggingElement({ type, id })
    if (type === 'text') {
      setSelectedTextId(id)
    }
    if (!previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    moveElementTo(type, id, x, y)
  }

  const handleCanvasPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingElement || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    moveElementTo(draggingElement.type, draggingElement.id, x, y)
  }

  const handleCanvasPointerUp = () => {
    setDraggingElement(null)
  }

  const panelConfig: Record<PanelKey, { icon: typeof ImageIcon; label: string; helper?: string }> = {
    background: { icon: ImageIcon, label: t.templateEditor.background },
    fields: { icon: TypeIcon, label: t.templateEditor.fields, helper: t.templateEditor.dragHint },
    text: { icon: List, label: t.templateEditor.textLines, helper: t.templateEditor.dragHint }
  }
  const activePanelConfig = activePanel ? panelConfig[activePanel] : null

  const handleSaveTemplate = (mode: 'update' | 'createNew' = 'update') => {
    if (!templateName.trim()) {
      setSaveMessage(language === 'he' ? 'אנא הזינו שם לתבנית' : 'Please enter a template name')
      setTimeout(() => setSaveMessage(''), 3500)
      return
    }

    const snapshot: InvitationTemplate = buildTemplateSnapshot()
    const now = new Date().toISOString()
    const targetId = mode === 'createNew' || !selectedSavedId ? crypto.randomUUID() : selectedSavedId
    const nextTemplate: SavedInvitationTemplate = {
      id: targetId,
      name: templateName.trim(),
      template: snapshot,
      updatedAt: now
    }

    const existsIndex = savedTemplates.findIndex((item) => item.id === nextTemplate.id)
    const nextList =
      mode === 'createNew'
        ? [nextTemplate, ...savedTemplates]
        : existsIndex >= 0
          ? savedTemplates.map((item, idx) => (idx === existsIndex ? nextTemplate : item))
          : [nextTemplate, ...savedTemplates]

    onSavedTemplatesChange?.(nextList)
    onTemplateSave?.(snapshot)
    setSelectedSavedId(nextTemplate.id)
    setSaveMessage(t.templateEditor.actions.saveTemplateSuccess)
    setTimeout(() => setSaveMessage(''), 3500)
  }

  const handleLoadSavedTemplate = (templateId: string) => {
    const existing = savedTemplates.find((item) => item.id === templateId)
    if (!existing) return
    const { template: saved } = existing
    setFields(saved.fields?.length ? saved.fields : createDefaultFields(language))
    setTextLines(saved.textLines?.length ? saved.textLines : createDefaultTextLines(language))
    setTemplateWidth(saved.dimensions?.width ?? DEFAULT_TEMPLATE_WIDTH)
    setTemplateHeight(saved.dimensions?.height ?? DEFAULT_TEMPLATE_HEIGHT)
    setSelectedBackgroundId(saved.backgroundId ?? '')
    setTemplateName(existing.name)
    setSelectedSavedId(templateId)
  }

  const handleDeleteSavedTemplate = (templateId: string) => {
    const filtered = savedTemplates.filter((item) => item.id !== templateId)
    onSavedTemplatesChange?.(filtered)
    if (selectedSavedId === templateId) {
      setSelectedSavedId(null)
    }
  }

  useEffect(() => {
    if (savedTemplates.length === 0) return
    if (selectedSavedId && savedTemplates.some((item) => item.id === selectedSavedId)) return
    const first = savedTemplates[0]
    if (first) {
      handleLoadSavedTemplate(first.id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedTemplates])

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
              <p className="text-sm text-gray-500 mb-2">{t.templateEditor.dimensions.unitHelper}</p>
              <div className="space-y-2 mb-4">
                <span className="text-sm text-gray-700">{t.templateEditor.dimensions.presetsTitle}</span>
                <p className="text-xs text-gray-500">{t.templateEditor.dimensions.presetsHelper}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dimensionPresets.map((preset) => {
                    const isActive = selectedPresetId === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyDimensionPreset(preset.id)}
                        className={`text-left rounded-xl border px-4 py-3 transition shadow-sm ${
                          isActive
                            ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-amber-100'
                            : 'border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{preset.label}</span>
                          <span className="text-[11px] text-gray-500">
                            {preset.width}×{preset.height}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm text-gray-700">{t.templateEditor.dimensions.width}</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                      <input
                        type="number"
                        min={320}
                        max={2000}
                        value={Math.round(templateWidth)}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (Number.isNaN(value)) return
                          const nextWidth = clampDimension(value, 320, 2000)
                          setTemplateWidth(nextWidth)
                          updatePresetSelection(nextWidth, templateHeight)
                        }}
                        className="w-full text-right focus:outline-none"
                      />
                      <span>{t.templateEditor.dimensions.pixels}</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                      <input
                        type="number"
                        min={convertPixelsToCm(320)}
                        max={convertPixelsToCm(2000)}
                        step={0.1}
                        value={Number(convertPixelsToCm(templateWidth).toFixed(2))}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (Number.isNaN(value)) return
                          const nextWidth = clampDimension(convertCmToPixels(value), 320, 2000)
                          setTemplateWidth(nextWidth)
                          updatePresetSelection(nextWidth, templateHeight)
                        }}
                        className="w-full text-right focus:outline-none"
                      />
                      <span>{t.templateEditor.dimensions.centimeters}</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                      <input
                        type="number"
                        min={convertPixelsToInches(320)}
                        max={convertPixelsToInches(2000)}
                        step={0.1}
                        value={Number(convertPixelsToInches(templateWidth).toFixed(2))}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (Number.isNaN(value)) return
                          const nextWidth = clampDimension(convertInchesToPixels(value), 320, 2000)
                          setTemplateWidth(nextWidth)
                          updatePresetSelection(nextWidth, templateHeight)
                        }}
                        className="w-full text-right focus:outline-none"
                      />
                      <span>{t.templateEditor.dimensions.inches}</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-gray-700">{t.templateEditor.dimensions.height}</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                      <input
                        type="number"
                        min={320}
                        max={3000}
                        value={Math.round(templateHeight)}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (Number.isNaN(value)) return
                          const nextHeight = clampDimension(value, 320, 3000)
                          setTemplateHeight(nextHeight)
                          updatePresetSelection(templateWidth, nextHeight)
                        }}
                        className="w-full text-right focus:outline-none"
                      />
                      <span>{t.templateEditor.dimensions.pixels}</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                      <input
                        type="number"
                        min={convertPixelsToCm(320)}
                        max={convertPixelsToCm(3000)}
                        step={0.1}
                        value={Number(convertPixelsToCm(templateHeight).toFixed(2))}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (Number.isNaN(value)) return
                          const nextHeight = clampDimension(convertCmToPixels(value), 320, 3000)
                          setTemplateHeight(nextHeight)
                          updatePresetSelection(templateWidth, nextHeight)
                        }}
                        className="w-full text-right focus:outline-none"
                      />
                      <span>{t.templateEditor.dimensions.centimeters}</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                      <input
                        type="number"
                        min={convertPixelsToInches(320)}
                        max={convertPixelsToInches(3000)}
                        step={0.1}
                        value={Number(convertPixelsToInches(templateHeight).toFixed(2))}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (Number.isNaN(value)) return
                          const nextHeight = clampDimension(convertInchesToPixels(value), 320, 3000)
                          setTemplateHeight(nextHeight)
                          updatePresetSelection(templateWidth, nextHeight)
                        }}
                        className="w-full text-right focus:outline-none"
                      />
                      <span>{t.templateEditor.dimensions.inches}</span>
                    </label>
                  </div>
                </div>
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
                      <span className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                        {t.templateEditor.options.types.text}
                      </span>
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
                  <div className="grid sm:grid-cols-3 gap-3 mt-3">
                    <label className="text-xs text-gray-600 flex flex-col gap-1">
                      <span>{t.templateEditor.layout.positionX}</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={field.position.x}
                        onChange={(e) => updateFieldPosition(field.id, 'x', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-xs text-gray-600 flex flex-col gap-1">
                      <span>{t.templateEditor.layout.positionY}</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={field.position.y}
                        onChange={(e) => updateFieldPosition(field.id, 'y', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-xs text-gray-600 flex flex-col gap-1">
                      <span>{t.templateEditor.layout.width}</span>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={field.position.width}
                        onChange={(e) => updateFieldPosition(field.id, 'width', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs font-semibold text-gray-700">{t.templateEditor.layout.alignment}</span>
                    <div className="flex rounded-lg overflow-hidden border border-gray-300">
                      <button
                        onClick={() => updateFieldAlignment(field.id, 'left')}
                        className={`px-3 py-2 ${field.position.align === 'left' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                        title={t.templateEditor.layout.alignLeft}
                        type="button"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateFieldAlignment(field.id, 'center')}
                        className={`px-3 py-2 ${field.position.align === 'center' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                        title={t.templateEditor.layout.alignCenter}
                        type="button"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateFieldAlignment(field.id, 'right')}
                        className={`px-3 py-2 ${field.position.align === 'right' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                        title={t.templateEditor.layout.alignRight}
                        type="button"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{t.templateEditor.layout.overlapHint}</p>
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
              <div className="w-full border border-gray-200 rounded-lg px-3 py-3 text-right bg-gray-50 text-sm font-semibold text-gray-700">
                {t.templateEditor.options.types.text}
              </div>
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
            {textLines.map((line) => {
              const isSelected = selectedTextId === line.id
              return (
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
                        onClick={() => setSelectedTextId(line.id)}
                        className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition ${isSelected ? 'bg-amber-100 border-amber-300 text-amber-800' : 'border-gray-200 text-gray-700 hover:border-amber-300'}`}
                        type="button"
                        aria-pressed={isSelected}
                      >
                        <Move className="w-4 h-4" />
                        {isSelected ? t.templateEditor.layout.activeWithArrows : t.templateEditor.layout.selectForArrows}
                      </button>
                      <button
                        onClick={() => removeTextLine(line.id)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        {t.admin.buttons.delete}
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3 mt-3">
                      <label className="text-xs text-gray-600 flex flex-col gap-1">
                        <span>{t.templateEditor.layout.positionX}</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={line.position.x}
                          onChange={(e) => updateTextPosition(line.id, 'x', Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-xs text-gray-600 flex flex-col gap-1">
                        <span>{t.templateEditor.layout.positionY}</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={line.position.y}
                          onChange={(e) => updateTextPosition(line.id, 'y', Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-xs text-gray-600 flex flex-col gap-1">
                        <span>{t.templateEditor.layout.width}</span>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={line.position.width}
                          onChange={(e) => updateTextPosition(line.id, 'width', Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-gray-700">{t.templateEditor.layout.alignment}</span>
                      <div className="flex rounded-lg overflow-hidden border border-gray-300">
                        <button
                          onClick={() => updateTextAlignment(line.id, 'left')}
                          className={`px-3 py-2 ${line.position.align === 'left' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                          title={t.templateEditor.layout.alignLeft}
                          type="button"
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateTextAlignment(line.id, 'center')}
                          className={`px-3 py-2 ${line.position.align === 'center' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                          title={t.templateEditor.layout.alignCenter}
                          type="button"
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateTextAlignment(line.id, 'right')}
                          className={`px-3 py-2 ${line.position.align === 'right' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`}
                          title={t.templateEditor.layout.alignRight}
                          type="button"
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">{t.templateEditor.layout.overlapHint}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <p className="text-xs text-gray-600">{t.templateEditor.layout.arrowKeysHint}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="pt-3 space-y-3">
              <textarea
                value={newTextLine}
                onChange={(e) => setNewTextLine(e.target.value)}
                placeholder={t.templateEditor.placeholders.textLine}
                className="w-full rounded-lg px-4 py-3 text-right bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
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

      <div className="bg-white rounded-3xl shadow-xl border border-amber-50 p-6 lg:p-8 mb-10">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-gray-800">
                {t.templateEditor.savedTemplates.nameLabel}
              </label>
              <button
                type="button"
                onClick={resetTemplateState}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-amber-300 hover:text-amber-700 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                {t.templateEditor.actions.startNewTemplate}
              </button>
            </div>
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={t.templateEditor.savedTemplates.namePlaceholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500">{t.templateEditor.savedTemplates.nameHelper}</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-800">{t.templateEditor.savedTemplates.title}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-2 gap-3">
              {savedTemplates.length === 0 && (
                <p className="text-gray-500 text-sm col-span-full">{t.templateEditor.savedTemplates.empty}</p>
              )}
              {savedTemplates.map((saved) => (
                <div
                  key={saved.id}
                  className={`border rounded-xl p-3 space-y-1 ${selectedSavedId === saved.id ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleLoadSavedTemplate(saved.id)}
                      className="text-right text-sm font-semibold text-gray-800 hover:text-amber-700 transition-colors"
                    >
                      {saved.name}
                    </button>
                    <button
                      onClick={() => handleDeleteSavedTemplate(saved.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title={t.admin.buttons.delete}
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {saved.updatedAt && (
                    <p className="text-[11px] text-gray-500">
                      {new Date(saved.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-10 border border-amber-50">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{t.templateEditor.preview}</h3>
              <p className="text-sm text-gray-500">{t.templateEditor.layout.dragAnywhere}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                {t.templateEditor.previewFieldHint}
              </div>
              <p className="text-xs text-gray-500">{t.templateEditor.actions.saveTemplateHelper}</p>
              {saveMessage && (
                <span className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {saveMessage}
                </span>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSaveTemplate('createNew')}
                  className="inline-flex items-center gap-2 border border-amber-200 bg-white text-amber-700 px-4 py-2 rounded-xl font-semibold shadow-sm hover:shadow transition-colors"
                  type="button"
                >
                  <Save className="w-4 h-4" />
                  {t.templateEditor.actions.saveAsNew}
                </button>
                <button
                  onClick={() => handleSaveTemplate('update')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:shadow-lg transition-colors"
                  type="button"
                >
                  <Save className="w-4 h-4" />
                  {t.templateEditor.actions.saveTemplate}
                </button>
              </div>
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
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl" />
              <div
                ref={previewRef}
                className="absolute inset-0"
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerLeave={handleCanvasPointerUp}
              >
                {textLines.map((line) => {
                  const isSelected = selectedTextId === line.id
                  return (
                    <div
                      key={line.id}
                      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-amber-500 rounded-lg' : ''}`}
                      style={{
                        left: `${line.position.x}%`,
                        top: `${line.position.y}%`,
                        width: `${line.position.width}%`,
                        transform: 'translate(-50%, -50%)',
                        textAlign: line.position.align as 'left' | 'center' | 'right'
                      }}
                      onPointerDown={(e) => startDraggingElement(e, 'text', line.id)}
                      tabIndex={0}
                      onFocus={() => setSelectedTextId(line.id)}
                      onClick={() => setSelectedTextId(line.id)}
                      aria-label={t.templateEditor.layout.selectForArrows}
                    >
                      <p
                        style={{ fontFamily: line.font, fontSize: line.fontSize }}
                        className="text-gray-800"
                      >
                        {line.text}
                      </p>
                    </div>
                  )
                })}
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="absolute cursor-move bg-amber-50/90 border border-amber-300 rounded-lg px-3 py-2 shadow-sm"
                    style={{
                      left: `${field.position.x}%`,
                      top: `${field.position.y}%`,
                      width: `${field.position.width}%`,
                      transform: 'translate(-50%, -50%)',
                      textAlign: field.position.align as 'left' | 'center' | 'right'
                    }}
                    onPointerDown={(e) => startDraggingElement(e, 'field', field.id)}
                  >
                    <p className="text-sm font-semibold text-amber-800">
                      {'{{ '}
                      {field.label}
                      {' }}'} {field.required && <span className="text-red-500">*</span>}
                    </p>
                    <p className="text-xs text-amber-700">{t.templateEditor.previewFieldHint}</p>
                  </div>
                ))}
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
