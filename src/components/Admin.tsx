import { useMemo, useState } from 'react'
import { ShieldCheck, Palette, Type as TypeIcon, Image as ImageIcon, Ruler, Plus, Save, RefreshCcw } from 'lucide-react'
import { Language, getTranslation } from '../translations'

interface AdminProps {
  language: Language
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
}

interface BackgroundItem {
  id: string
  name: string
  preview: string
}

interface DimensionSettings {
  width: number
  height: number
  unit: 'px' | 'cm'
}

export default function Admin({ language }: AdminProps) {
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
  const [newBackground, setNewBackground] = useState({ name: '', preview: '' })
  const [statusMessage, setStatusMessage] = useState('')

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
    setFonts(prev => [...prev, { id: crypto.randomUUID(), ...newFont }])
    setNewFont({ name: '', url: '' })
  }

  const handleAddBackground = () => {
    if (!newBackground.name.trim() || !newBackground.preview.trim()) return
    setBackgrounds(prev => [...prev, { id: crypto.randomUUID(), ...newBackground }])
    setNewBackground({ name: '', preview: '' })
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
                <div key={font.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-800">{font.name}</h3>
                  <p className="text-xs text-gray-500 break-all">{font.url}</p>
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
