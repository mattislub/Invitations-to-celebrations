import { useMemo, useState } from 'react'
import { ShieldCheck, Palette, Type as TypeIcon, Image as ImageIcon, Ruler, Plus, Save, RefreshCcw, Upload, Trash } from 'lucide-react'
import { Language, getTranslation } from '../translations'
import { CustomInvitationType } from '../types'

interface AdminProps {
  language: Language
  customTypes: CustomInvitationType[]
  onCustomTypesChange: (types: CustomInvitationType[]) => void
}

interface StyleItem {
  id: string
  name: string
  description: string
}

interface FontItem {
  id: string
  name: string
  url: string
  file?: string
}

interface BackgroundItem {
  id: string
  name: string
  preview: string
  file?: string
}

interface DimensionSettings {
  width: number
  height: number
  unit: 'px' | 'cm'
}

export default function Admin({ language, customTypes, onCustomTypesChange }: AdminProps) {
  const t = getTranslation(language)
  const [designStyles, setDesignStyles] = useState<StyleItem[]>([
    { id: 'modern-elegant', name: 'Modern Elegant', description: 'Minimal lines with warm gradients' },
    { id: 'heritage-gold', name: 'Heritage Gold', description: 'Traditional framing with golden ornaments' }
  ])
  const [fonts, setFonts] = useState<FontItem[]>([
    { id: 'assistant', name: 'Assistant', url: 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap' },
    { id: 'playfair', name: 'Playfair Display', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap' }
  ])
  const [backgrounds, setBackgrounds] = useState<BackgroundItem[]>([
    { id: 'soft-blush', name: 'Soft Blush', preview: 'https://images.pexels.com/photos/2043997/pexels-photo-2043997.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'royal-blue', name: 'Royal Blue', preview: 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=600' }
  ])
  const [dimensions, setDimensions] = useState<DimensionSettings>({ width: 1080, height: 1920, unit: 'px' })
  const [newStyle, setNewStyle] = useState({ name: '', description: '' })
  const [newFont, setNewFont] = useState({ name: '', url: '' })
  const [newFontFile, setNewFontFile] = useState<File | null>(null)
  const [newBackground, setNewBackground] = useState({ name: '', preview: '' })
  const [newBackgroundFile, setNewBackgroundFile] = useState<File | null>(null)
  const [newInvitationType, setNewInvitationType] = useState({ nameHe: '', nameYi: '', nameEn: '' })
  const [statusMessage, setStatusMessage] = useState('')
  const [, setUploading] = useState(false)

  const stats = useMemo(() => ([
    { label: t.admin.stats.styles, value: designStyles.length, icon: Palette, accent: 'from-amber-500 to-orange-400' },
    { label: t.admin.stats.fonts, value: fonts.length, icon: TypeIcon, accent: 'from-blue-500 to-indigo-500' },
    { label: t.admin.stats.backgrounds, value: backgrounds.length, icon: ImageIcon, accent: 'from-emerald-500 to-teal-500' },
    { label: t.admin.stats.dimensions, value: `${dimensions.width}×${dimensions.height}${dimensions.unit}`, icon: Ruler, accent: 'from-gray-700 to-gray-500' }
  ]), [designStyles.length, fonts.length, backgrounds.length, dimensions, t])

  const handleAddStyle = () => {
    if (!newStyle.name.trim()) return
    setDesignStyles(prev => [...prev, { id: crypto.randomUUID(), ...newStyle }])
    setNewStyle({ name: '', description: '' })
  }

  const handleAddFont = () => {
    if (!newFont.name.trim() || !newFont.url.trim()) return
    setFonts(prev => [...prev, { id: crypto.randomUUID(), ...newFont, file: newFontFile?.name }])
    setNewFont({ name: '', url: '' })
    setNewFontFile(null)
  }

  const handleAddBackground = () => {
    if (!newBackground.name.trim() || !newBackground.preview.trim()) return
    setBackgrounds(prev => [...prev, { id: crypto.randomUUID(), ...newBackground, file: newBackgroundFile?.name }])
    setNewBackground({ name: '', preview: '' })
    setNewBackgroundFile(null)
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

  const handleReset = () => {
    setDesignStyles([])
    setFonts([])
    setBackgrounds([])
    setStatusMessage('')
  }

  const handleSaveDimensions = () => {
    setStatusMessage(t.admin.messages.saved)
    setTimeout(() => setStatusMessage(''), 3000)
  }

  const handleFileUpload = async (file: File, type: 'font' | 'background'): Promise<string | null> => {
    setUploading(true)
    setStatusMessage(t.admin.messages.uploading)

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: base64, name: file.name, type })
      })

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()
      setStatusMessage('')
      return result.url as string
    } catch (error) {
      console.error('Upload error', error)
      setStatusMessage(t.admin.messages.uploadError)
      return null
    } finally {
      setUploading(false)
    }
  }

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
    setNewBackgroundFile(file)
    const url = await handleFileUpload(file, 'background')
    if (url) {
      setNewBackground(prev => ({ ...prev, preview: url }))
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.accent} flex items-center justify-center text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
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

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-amber-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{t.admin.sections.styles.title}</h2>
                <p className="text-gray-600 text-sm">{t.admin.sections.styles.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newStyle.name}
                onChange={(e) => setNewStyle(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t.admin.fields.name}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                type="text"
                value={newStyle.description}
                onChange={(e) => setNewStyle(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t.admin.fields.description}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handleAddStyle}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-700 to-amber-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              {t.admin.buttons.add}
            </button>

            <div className="mt-6 space-y-3 max-h-60 overflow-y-auto">
              {designStyles.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-6">{t.admin.messages.empty}</p>
              )}
              {designStyles.map(style => (
                <div key={style.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-800">{style.name}</h3>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </div>
              ))}
            </div>
          </div>

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
                type="url"
                value={newBackground.preview}
                onChange={(e) => setNewBackground(prev => ({ ...prev, preview: e.target.value }))}
                placeholder={t.admin.fields.url}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
        </div>

        <div className="space-y-6">
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
                type="url"
                value={newFont.url}
                onChange={(e) => setNewFont(prev => ({ ...prev, url: e.target.value }))}
                placeholder={t.admin.fields.url}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Ruler className="w-6 h-6 text-gray-700" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{t.admin.sections.dimensions.title}</h2>
                <p className="text-gray-600 text-sm">{t.admin.sections.dimensions.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.admin.fields.width}</label>
                <input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.admin.fields.height}</label>
                <input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-gray-700">{t.admin.fields.unit}</label>
              <select
                value={dimensions.unit}
                onChange={(e) => setDimensions(prev => ({ ...prev, unit: e.target.value as DimensionSettings['unit'] }))}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-700"
              >
                <option value="px">px</option>
                <option value="cm">cm</option>
              </select>
              <span className="text-sm text-gray-600">{dimensions.width} × {dimensions.height} {dimensions.unit}</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveDimensions}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
              >
                <Save className="w-4 h-4" />
                {t.admin.buttons.save}
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-3 rounded-xl font-semibold shadow border border-gray-200 hover:border-gray-300"
              >
                <RefreshCcw className="w-4 h-4" />
                {t.admin.buttons.reset}
              </button>
              {statusMessage && <span className="text-sm text-emerald-600 font-semibold">{statusMessage}</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
