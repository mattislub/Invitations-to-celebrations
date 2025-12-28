import { useMemo, useState } from 'react'
import { Plus, Type as TypeIcon, List, GripVertical, AlignLeft, Image as ImageIcon } from 'lucide-react'
import { Language, getTranslation } from '../translations'

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
}

export default function TemplateEditor({ language }: TemplateEditorProps) {
  const t = getTranslation(language)

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
  const [backgroundUrl, setBackgroundUrl] = useState<string>('https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800')
  const [templateWidth, setTemplateWidth] = useState<number>(1080)
  const [templateHeight, setTemplateHeight] = useState<number>(1920)
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null)
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null)

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

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{t.templateEditor.title}</h2>
        <p className="text-lg text-gray-600">{t.templateEditor.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <TypeIcon className="w-6 h-6 text-amber-500 ml-2" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{t.templateEditor.fields}</h3>
                <p className="text-sm text-gray-500">{t.templateEditor.dragHint}</p>
              </div>
            </div>

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
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-3">
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
              className="mt-4 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              {t.templateEditor.addField}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <List className="w-6 h-6 text-amber-500 ml-2" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{t.templateEditor.textLines}</h3>
                <p className="text-sm text-gray-500">{t.templateEditor.dragHint}</p>
              </div>
            </div>

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
            </div>

            <div className="mt-6 space-y-3">
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
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                {t.templateEditor.addText}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <ImageIcon className="w-6 h-6 text-amber-500 ml-2" />
              <h3 className="text-2xl font-bold text-gray-800">{t.templateEditor.background}</h3>
            </div>
            <input
              type="text"
              value={backgroundUrl}
              onChange={(e) => setBackgroundUrl(e.target.value)}
              placeholder={t.templateEditor.backgroundUrl}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-right mb-4"
            />
            <div className="mb-6">
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
              <div
                className="h-48 bg-center bg-cover"
                style={{ backgroundImage: `url(${backgroundUrl || ''})` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{t.templateEditor.preview}</h3>
            <div
              className="rounded-2xl overflow-hidden border border-gray-200 bg-center bg-cover p-8 mx-auto"
              style={{
                backgroundImage: `url(${backgroundUrl || ''})`,
                width: `${templateWidth}px`,
                height: `${templateHeight}px`,
                maxWidth: '100%'
              }}
            >
              <div className="bg-white/85 backdrop-blur-sm rounded-xl p-6 space-y-4 h-full overflow-auto">
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
      </div>
    </section>
  )
}
