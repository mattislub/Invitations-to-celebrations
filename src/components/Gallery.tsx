import { useState } from 'react'
import { Layers, Sparkles } from 'lucide-react'
import { Language, getTranslation } from '../translations'
import { AdminBackground, Invitation, SavedInvitationTemplate, VideoBackground } from '../types'

interface GalleryProps {
  language: Language
  invitations: Invitation[]
  savedTemplates?: SavedInvitationTemplate[]
  backgrounds?: AdminBackground[]
  videoBackgrounds?: VideoBackground[]
  onCustomizeTemplate?: (templateId: string) => void
}

export default function Gallery({
  language,
  invitations,
  savedTemplates = [],
  backgrounds = [],
  videoBackgrounds = [],
  onCustomizeTemplate
}: GalleryProps) {
  const t = getTranslation(language)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

  const categories = [
    { key: 'all', label: t.gallery.categories.all },
    { key: 'wedding', label: t.gallery.categories.wedding },
    { key: 'barMitzvah', label: t.gallery.categories.barMitzvah },
    { key: 'birthday', label: t.gallery.categories.birthday },
  ]

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      wedding: t.gallery.categories.wedding,
      barMitzvah: t.gallery.categories.barMitzvah,
      batMitzvah: t.gallery.categories.batMitzvah,
      birthday: t.gallery.categories.birthday,
      thankYou: language === 'he' ? 'כרטיסי תודה' : 'Thank You Cards'
    }
    return categoryMap[category] || category
  }

  const filteredInvitations = selectedCategory === 'all'
    ? invitations
    : invitations.filter(t => t.category === selectedCategory)

  const resolveTemplatePreview = (template: SavedInvitationTemplate) => {
    const backgroundId = template.template.backgroundId
    if (!backgroundId) return ''

    if (backgroundId.startsWith('image-')) {
      const id = backgroundId.replace('image-', '')
      return backgrounds.find((bg) => bg.id === id)?.preview ?? ''
    }

    if (backgroundId.startsWith('video-')) {
      const id = backgroundId.replace('video-', '')
      const videoBackground = videoBackgrounds.find((bg) => bg.id === id)
      return videoBackground?.previewImage ?? ''
    }

    return ''
  }

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4">
            <Sparkles className="w-10 h-10 text-amber-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-700 to-amber-600 bg-clip-text text-transparent">
              {t.gallery.title}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.gallery.subtitle}
          </p>
        </div>

        {savedTemplates.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-amber-500" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{t.gallery.templates.title}</h2>
                  <p className="text-gray-600">{t.gallery.templates.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedTemplates.map((template) => {
                const previewUrl = resolveTemplatePreview(template)

                return (
                  <div
                    key={template.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-amber-50"
                  >
                    <div className="relative h-64 bg-gray-100">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={template.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-50 to-white flex items-center justify-center text-amber-700 font-semibold">
                          {t.gallery.templates.missingPreview}
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                        {t.gallery.templates.badge}
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-bold text-gray-800 truncate" title={template.name}>{template.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {t.gallery.templates.description}
                      </p>
                      <button
                        onClick={() => onCustomizeTemplate?.(template.id)}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        {t.gallery.templates.customizeText}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-center mb-12 flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.key
                  ? 'bg-gradient-to-r from-gray-700 to-amber-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:shadow-md hover:scale-105'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              onMouseEnter={() => setHoveredTemplate(invitation.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="relative h-80 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
                  style={{
                    backgroundImage: `url(${invitation.imageUrl})`,
                    transform: hoveredTemplate === invitation.id ? 'scale(1.05)' : 'scale(1)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-end">
                  <div className="w-full p-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center shadow-xl transform transition-transform duration-300 group-hover:scale-105">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {language === 'he' ? invitation.titleHe : invitation.titleEn}
                      </h3>
                      {invitation.hosts && (
                        <p className="text-sm text-gray-600">{invitation.hosts}</p>
                      )}
                      {invitation.eventDate && (
                        <p className="text-sm text-gray-500 mt-2">{invitation.eventDate}</p>
                      )}
                    </div>
                  </div>
                </div>

                {hoveredTemplate === invitation.id && (
                  <div className={`absolute top-4 ${language === 'he' ? 'right-4' : 'left-4'} bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 rtl:space-x-reverse animate-fade-in`}>
                    <Layers className="w-4 h-4" />
                    <span>{t.gallery.realInvitation}</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{language === 'he' ? invitation.titleHe : invitation.titleEn}</h3>
                  <span className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                    {getCategoryLabel(invitation.category)}
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-gray-700 to-amber-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                  {language === 'he' ? 'התאם לאירוע שלך' : 'Customize for Your Event'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredInvitations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">{language === 'he' ? 'לא נמצאו תבניות בקטגוריה זו' : 'No templates found in this category'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
