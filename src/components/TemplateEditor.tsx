import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Plus, Type as TypeIcon, AlignLeft, Image as ImageIcon, Crosshair } from 'lucide-react'
import { Language, getTranslation } from '../translations'

interface TextBox {
  id: string
  text: string
  font: string
  fontSize: number
  x: number
  y: number
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

  const [textBoxes, setTextBoxes] = useState<TextBox[]>(() => {
    const headlineId = crypto.randomUUID()
    const sublineId = crypto.randomUUID()
    return [
      { id: headlineId, text: language === 'he' ? 'באהבה רבה' : 'With great joy', font: 'Playfair Display, serif', fontSize: 30, x: 50, y: 30 },
      { id: sublineId, text: language === 'he' ? 'נשמח לראותכם' : 'Looking forward to celebrating together', font: 'Assistant, sans-serif', fontSize: 18, x: 50, y: 60 }
    ]
  })
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null)
  const [newTextBox, setNewTextBox] = useState('')
  const [selectedFont, setSelectedFont] = useState<string>('Assistant, sans-serif')
  const [selectedFontSize, setSelectedFontSize] = useState<number>(18)
  const [backgroundUrl, setBackgroundUrl] = useState<string>('https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800')
  const [templateWidth, setTemplateWidth] = useState<number>(1080)
  const [templateHeight, setTemplateHeight] = useState<number>(1920)
  const previewRef = useRef<HTMLDivElement>(null)

  const fontOptions: FontOption[] = useMemo(
    () => [
      { id: 'assistant', label: 'Assistant', css: 'Assistant, sans-serif' },
      { id: 'playfair', label: 'Playfair Display', css: 'Playfair Display, serif' },
      { id: 'hebrew-serif', label: language === 'he' ? 'Noto Serif Hebrew' : 'Noto Serif Hebrew', css: '"Noto Serif Hebrew", serif' },
      { id: 'inter', label: 'Inter', css: 'Inter, sans-serif' }
    ],
    [language]
  )

  useEffect(() => {
    if (!selectedBoxId && textBoxes[0]) {
      setSelectedBoxId(textBoxes[0].id)
    }
  }, [selectedBoxId, textBoxes])

  const selectedBox = textBoxes.find((box) => box.id === selectedBoxId) || textBoxes[0]

  const addTextBox = () => {
    if (!newTextBox.trim()) return
    const id = crypto.randomUUID()
    const box: TextBox = {
      id,
      text: newTextBox.trim(),
      font: selectedFont,
      fontSize: selectedFontSize,
      x: 50,
      y: 50
    }
    setTextBoxes((prev) => [...prev, box])
    setSelectedBoxId(id)
    setNewTextBox('')
  }

  const updateTextBox = <K extends keyof TextBox>(id: string, key: K, value: TextBox[K]) => {
    setTextBoxes((prev) => prev.map((box) => (box.id === id ? { ...box, [key]: value } : box)))
  }

  const removeTextBox = (id: string) => {
    setTextBoxes((prev) => {
      const filtered = prev.filter((box) => box.id !== id)
      if (selectedBoxId === id) {
        setSelectedBoxId(filtered[0]?.id || null)
      }
      return filtered
    })
  }

  const clampPercentage = (value: number) => Math.min(100, Math.max(0, value))

  const handlePreviewClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current || !selectedBox) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = clampPercentage(((event.clientX - rect.left) / rect.width) * 100)
    const y = clampPercentage(((event.clientY - rect.top) / rect.height) * 100)
    updateTextBox(selectedBox.id, 'x', x)
    updateTextBox(selectedBox.id, 'y', y)
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
                <h3 className="text-2xl font-bold text-gray-800">{t.templateEditor.textBoxes}</h3>
                <p className="text-sm text-gray-500">{t.templateEditor.instructions}</p>
              </div>
            </div>

            <div className="space-y-4">
              {textBoxes.map((box, index) => (
                <div
                  key={box.id}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    selectedBoxId === box.id
                      ? 'border-amber-400 bg-amber-50/60 shadow-sm'
                      : 'border-gray-200 bg-gray-50 hover:border-amber-200'
                  }`}
                  onClick={() => setSelectedBoxId(box.id)}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold">
                      <AlignLeft className="w-4 h-4" />
                      <span>
                        {t.templateEditor.textBoxes} {index + 1}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTextBox(box.id)
                      }}
                      className="text-red-500 text-sm hover:underline"
                    >
                      {t.admin.buttons.delete}
                    </button>
                  </div>

                  <textarea
                    value={box.text}
                    onChange={(e) => updateTextBox(box.id, 'text', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-right bg-white"
                    placeholder={t.templateEditor.placeholders.text}
                  />

                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="text-sm text-gray-700 flex flex-col gap-2">
                      <span>{t.templateEditor.typography.font}</span>
                      <select
                        value={box.font}
                        onChange={(e) => updateTextBox(box.id, 'font', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.id} value={font.css}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm text-gray-700 flex flex-col gap-2">
                      <span>{t.templateEditor.typography.fontSize}</span>
                      <input
                        type="range"
                        min={12}
                        max={72}
                        value={box.fontSize}
                        onChange={(e) => updateTextBox(box.id, 'fontSize', Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500 text-right">{box.fontSize}px</span>
                    </label>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <label className="text-sm text-gray-700 flex flex-col gap-2">
                      <span>{t.templateEditor.position.x}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={box.x}
                        onChange={(e) => updateTextBox(box.id, 'x', clampPercentage(Number(e.target.value)))}
                      />
                      <span className="text-xs text-gray-500 text-right">{box.x.toFixed(0)}%</span>
                    </label>
                    <label className="text-sm text-gray-700 flex flex-col gap-2">
                      <span>{t.templateEditor.position.y}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={box.y}
                        onChange={(e) => updateTextBox(box.id, 'y', clampPercentage(Number(e.target.value)))}
                      />
                      <span className="text-xs text-gray-500 text-right">{box.y.toFixed(0)}%</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <textarea
                value={newTextBox}
                onChange={(e) => setNewTextBox(e.target.value)}
                placeholder={t.templateEditor.placeholders.text}
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
                onClick={addTextBox}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                {t.templateEditor.addTextBox}
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
              onClick={handlePreviewClick}
              ref={previewRef}
            >
              <div className="bg-white/85 backdrop-blur-sm rounded-xl p-6 h-full relative overflow-hidden border border-dashed border-amber-200">
                {textBoxes.map((box) => {
                  const isSelected = selectedBoxId === box.id
                  return (
                    <div
                      key={box.id}
                      style={{
                        position: 'absolute',
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontFamily: box.font,
                        fontSize: box.fontSize
                      }}
                      className={`px-3 py-2 rounded-lg text-center cursor-pointer transition-all ${
                        isSelected ? 'bg-white shadow-lg ring-2 ring-amber-500/80' : 'bg-white/80 hover:ring-1 hover:ring-amber-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedBoxId(box.id)
                      }}
                    >
                      {box.text || t.templateEditor.selectionHint}
                    </div>
                  )
                })}

                {!textBoxes.length && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                    {t.templateEditor.selectionHint}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
              <Crosshair className="w-4 h-4" />
              <span>{t.templateEditor.clickToPlace}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
