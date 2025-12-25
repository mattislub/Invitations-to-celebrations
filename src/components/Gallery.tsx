import { useState } from 'react'
import { Layers, Sparkles } from 'lucide-react'
import { Language, getTranslation } from '../translations'

interface InvitationTemplate {
  id: number
  titleHe: string
  titleEn: string
  category: string
  layers: Array<{
    image: string
    opacity: number
  }>
}

interface GalleryProps {
  language: Language
}

const templates: InvitationTemplate[] = [
  {
    id: 1,
    titleHe: 'רומנטי קלאסי',
    titleEn: 'Classic Romantic',
    category: 'wedding',
    layers: [
      { image: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.3 },
      { image: 'https://images.pexels.com/photos/1670723/pexels-photo-1670723.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.2 },
    ]
  },
  {
    id: 2,
    titleHe: 'אלגנטי מודרני',
    titleEn: 'Modern Elegant',
    category: 'wedding',
    layers: [
      { image: 'https://images.pexels.com/photos/1415554/pexels-photo-1415554.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.25 },
      { image: 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.2 },
    ]
  },
  {
    id: 3,
    titleHe: 'זהב ויוקרה',
    titleEn: 'Gold & Luxury',
    category: 'wedding',
    layers: [
      { image: 'https://images.pexels.com/photos/3171815/pexels-photo-3171815.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.3 },
      { image: 'https://images.pexels.com/photos/1670723/pexels-photo-1670723.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.25 },
    ]
  },
  {
    id: 4,
    titleHe: 'בר מצווה מיוחד',
    titleEn: 'Special Bar Mitzvah',
    category: 'barMitzvah',
    layers: [
      { image: 'https://images.pexels.com/photos/1111318/pexels-photo-1111318.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.3 },
      { image: 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.15 },
    ]
  },
  {
    id: 5,
    titleHe: 'יום הולדת חגיגי',
    titleEn: 'Festive Birthday',
    category: 'birthday',
    layers: [
      { image: 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.35 },
      { image: 'https://images.pexels.com/photos/3171815/pexels-photo-3171815.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.2 },
    ]
  },
  {
    id: 6,
    titleHe: 'תודה מהלב',
    titleEn: 'Heartfelt Thanks',
    category: 'thankYou',
    layers: [
      { image: 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.25 },
      { image: 'https://images.pexels.com/photos/1670723/pexels-photo-1670723.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.2 },
    ]
  },
]

export default function Gallery({ language }: GalleryProps) {
  const t = getTranslation(language)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hoveredTemplate, setHoveredTemplate] = useState<number | null>(null)

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

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

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
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <div className="relative h-80 overflow-hidden">
                {template.layers.map((layer, index) => (
                  <div
                    key={index}
                    className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{
                      backgroundImage: `url(${layer.image})`,
                      opacity: hoveredTemplate === template.id ? layer.opacity * 1.3 : layer.opacity,
                      transform: hoveredTemplate === template.id ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl transform transition-transform duration-300 group-hover:scale-105">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{language === 'he' ? 'שם ושם' : 'Name & Name'}</h3>
                    <p className="text-gray-600">{language === 'he' ? 'מזמינים אתכם' : 'Invite you'}</p>
                    <p className="text-sm text-gray-500 mt-3">01.01.2025</p>
                  </div>
                </div>

                {hoveredTemplate === template.id && (
                  <div className={`absolute top-4 ${language === 'he' ? 'right-4' : 'left-4'} bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 rtl:space-x-reverse animate-fade-in`}>
                    <Layers className="w-4 h-4" />
                    <span>{template.layers.length} {language === 'he' ? 'שכבות' : 'Layers'}</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{language === 'he' ? template.titleHe : template.titleEn}</h3>
                  <span className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                    {getCategoryLabel(template.category)}
                  </span>
                </div>
                <button className="w-full bg-gradient-to-r from-gray-700 to-amber-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                  {language === 'he' ? 'התאם לאירוע שלך' : 'Customize for Your Event'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">{language === 'he' ? 'לא נמצאו תבניות בקטגוריה זו' : 'No templates found in this category'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
