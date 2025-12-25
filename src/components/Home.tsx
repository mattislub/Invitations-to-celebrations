import { useState } from 'react'
import { Heart, Gift, Mail, Layers, Sparkles, Play } from 'lucide-react'
import { Language, getTranslation } from '../translations'

interface BackgroundLayer {
  id: number
  image: string
  opacity: number
  name: string
}

interface Animation {
  id: string
  name: string
  class: string
  description: string
}

interface HomeProps {
  onStartDesigning: () => void
  language: Language
}

export default function Home({ onStartDesigning, language }: HomeProps) {
  const t = getTranslation(language)

  const [layers, setLayers] = useState<BackgroundLayer[]>([
    { id: 1, image: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.3, name: language === 'he' ? 'פרחים רומנטיים' : 'Romantic Flowers' },
    { id: 2, image: 'https://images.pexels.com/photos/1670723/pexels-photo-1670723.jpeg?auto=compress&cs=tinysrgb&w=800', opacity: 0.2, name: language === 'he' ? 'רקע זהוב' : 'Golden Background' },
  ])

  const [selectedAnimation, setSelectedAnimation] = useState<string>('fadeIn')
  const [animationKey, setAnimationKey] = useState<number>(0)

  const animations: Animation[] = [
    { id: 'fadeIn', name: t.designer.animation.types.fade, class: 'animate-fade-in', description: language === 'he' ? 'הופעה הדרגתית רכה' : 'Smooth gradual appearance' },
    { id: 'slideUp', name: t.designer.animation.types.slide, class: 'animate-slide-up', description: language === 'he' ? 'החלקה מלמטה למעלה' : 'Slide from bottom to top' },
    { id: 'zoomIn', name: t.designer.animation.types.zoom, class: 'animate-zoom-in', description: language === 'he' ? 'הגדלה פנימה' : 'Zoom in effect' },
    { id: 'bounce', name: t.designer.animation.types.bounce, class: 'animate-bounce-in', description: language === 'he' ? 'קפיצה אנרגטית' : 'Energetic bounce' },
    { id: 'rotate', name: language === 'he' ? 'סיבוב' : 'Rotate', class: 'animate-rotate-in', description: language === 'he' ? 'סיבוב והופעה' : 'Rotate and appear' },
  ]

  const updateLayerOpacity = (id: number, opacity: number) => {
    setLayers(layers.map(layer =>
      layer.id === id ? { ...layer, opacity } : layer
    ))
  }

  const playAnimation = (animationId: string) => {
    setSelectedAnimation(animationId)
    setAnimationKey(prev => prev + 1)
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            {t.home.hero.title.split(' ').slice(0, 2).join(' ')}<br />
            <span className="bg-gradient-to-r from-gray-700 to-amber-600 bg-clip-text text-transparent">
              {t.home.hero.title.split(' ').slice(2).join(' ')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t.home.hero.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 md:order-1">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
                <Layers className="w-6 h-6 text-amber-500" />
                <h3 className="text-2xl font-bold text-gray-800">{language === 'he' ? 'תכונת רקעים שקופים' : 'Transparent Backgrounds Feature'}</h3>
              </div>
              <p className="text-gray-600 mb-6">
                {language === 'he' ? 'שלבו מספר שכבות רקע עם שליטה מלאה על רמת השקיפות לכל שכבה. צרו עומק ומימד בהזמנות שלכם!' : 'Combine multiple background layers with full control over opacity for each layer. Create depth and dimension in your invitations!'}
              </p>

              <div className="relative h-80 rounded-xl overflow-hidden mb-6 border-4 border-gray-100">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
                    style={{
                      backgroundImage: `url(${layer.image})`,
                      opacity: layer.opacity,
                    }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl">
                    <h4 className="text-3xl font-bold text-gray-800 mb-2">{language === 'he' ? 'שרה ודוד' : 'Sarah & David'}</h4>
                    <p className="text-lg text-gray-600">{t.designer.phrases.wedding.modern}</p>
                    <p className="text-sm text-gray-500 mt-4">15.08.2025</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {layers.map((layer) => (
                  <div key={layer.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{layer.name}</span>
                      <span className="text-sm text-gray-500">{Math.round(layer.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={layer.opacity * 100}
                      onChange={(e) => updateLayerOpacity(layer.id, parseInt(e.target.value) / 100)}
                      className="w-full h-2 bg-gradient-to-r from-gray-200 to-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-6">
            <div className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${language === 'he' ? 'border-r-4' : 'border-l-4'} border-amber-500`}>
              <Heart className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{language === 'he' ? 'הזמנות לחתונה' : 'Wedding Invitations'}</h3>
              <p className="text-gray-600">
                {language === 'he' ? 'עצבו הזמנות חתונה מרהיבות שישקפו את הסיפור הייחודי שלכם. בחרו מתוך מגוון רקעים אלגנטיים ושלבו אותם ליצירה מושלמת.' : 'Design stunning wedding invitations that reflect your unique story. Choose from a variety of elegant backgrounds and combine them for a perfect creation.'}
              </p>
            </div>

            <div className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${language === 'he' ? 'border-r-4' : 'border-l-4'} border-gray-500`}>
              <Gift className="w-12 h-12 text-gray-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{language === 'he' ? 'הזמנות לאירועים' : 'Event Invitations'}</h3>
              <p className="text-gray-600">
                {language === 'he' ? 'בר מצווה, בת מצווה, יום הולדת או כל אירוע מיוחד - צרו הזמנות מעוצבות שיותירו רושם בלתי נשכח על האורחים.' : 'Bar mitzvah, bat mitzvah, birthday or any special event - create designed invitations that will leave an unforgettable impression on your guests.'}
              </p>
            </div>

            <div className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${language === 'he' ? 'border-r-4' : 'border-l-4'} border-amber-600`}>
              <Mail className="w-12 h-12 text-amber-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{language === 'he' ? 'כרטיסי תודה' : 'Thank You Cards'}</h3>
              <p className="text-gray-600">
                {language === 'he' ? 'הביעו את הערכתכם בסטייל! עצבו כרטיסי תודה מרהיבים עם רקעים מרובדים שיגרמו למקבלים להרגיש באמת מוערכים.' : 'Express your appreciation in style! Design stunning thank you cards with layered backgrounds that will make recipients feel truly valued.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4">
              <Sparkles className="w-8 h-8 text-amber-500" />
              <h3 className="text-4xl font-bold text-gray-800">{language === 'he' ? 'הוסיפו אנימציות מרהיבות' : 'Add Amazing Animations'}</h3>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'he' ? 'בחרו מתוך מגוון אנימציות מעוצבות שיהפכו את ההזמנה שלכם לבלתי נשכחת' : 'Choose from a variety of designed animations that will make your invitation unforgettable'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h4 className="text-xl font-bold text-gray-800 mb-6">{language === 'he' ? 'בחרו אנימציה:' : 'Choose Animation:'}</h4>
                <div className="space-y-3 mb-8">
                  {animations.map((animation) => (
                    <button
                      key={animation.id}
                      onClick={() => playAnimation(animation.id)}
                      className={`w-full ${language === 'he' ? 'text-right' : 'text-left'} p-4 rounded-xl transition-all duration-300 flex items-center justify-between group ${
                        selectedAnimation === animation.id
                          ? 'bg-gradient-to-r from-gray-700 to-amber-500 text-white shadow-lg scale-105'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-lg mb-1">{animation.name}</div>
                        <div className={`text-sm ${selectedAnimation === animation.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {animation.description}
                        </div>
                      </div>
                      <Play className={`w-5 h-5 ${selectedAnimation === animation.id ? 'text-white' : 'text-amber-500 group-hover:scale-110'} transition-transform`} />
                    </button>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    💡 <strong>{language === 'he' ? 'טיפ:' : 'Tip:'}</strong> {language === 'he' ? 'לחצו על אנימציה כדי לראות אותה בפעולה בתצוגה המקדימה' : 'Click on an animation to see it in action in the preview'}
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="bg-gradient-to-br from-gray-100 to-amber-50 rounded-2xl p-8 min-h-[500px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{
                  backgroundImage: 'url(https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800)'
                }} />
                <div
                  key={animationKey}
                  className={`bg-white rounded-2xl p-8 shadow-2xl text-center relative z-10 ${animations.find(a => a.id === selectedAnimation)?.class}`}
                >
                  <Heart className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h4 className="text-3xl font-bold text-gray-800 mb-2">{language === 'he' ? 'שרה ודוד' : 'Sarah & David'}</h4>
                  <p className="text-xl text-gray-600 mb-4">{t.designer.phrases.wedding.modern}</p>
                  <div className="w-20 h-1 bg-gradient-to-r from-gray-700 to-amber-500 mx-auto mb-4 rounded-full" />
                  <p className="text-gray-500">15.08.2025</p>
                  <p className="text-gray-500">{language === 'he' ? 'גן אירועים רויאל' : 'Royal Events Hall'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-gray-700 to-amber-500 rounded-3xl p-12 shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {language === 'he' ? 'מוכנים ליצור משהו מיוחד?' : 'Ready to Create Something Special?'}
          </h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            {language === 'he' ? 'הצטרפו לאלפי זוגות ומארגני אירועים שכבר בחרו בנו ליצירת ההזמנות המושלמות שלהם' : 'Join thousands of couples and event organizers who have already chosen us to create their perfect invitations'}
          </p>
          <button
            onClick={onStartDesigning}
            className="bg-white text-gray-700 px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            {language === 'he' ? 'צור את ההזמנה שלך עכשיו' : 'Create Your Invitation Now'}
          </button>
        </div>
      </section>
    </>
  )
}
