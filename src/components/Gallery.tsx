import { useState } from 'react'
import { Layers, Sparkles } from 'lucide-react'
import { Language, getTranslation } from '../translations'
import { Invitation } from '../types'

interface GalleryProps {
  language: Language
  invitations: Invitation[]
}

export default function Gallery({ language, invitations }: GalleryProps) {
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
