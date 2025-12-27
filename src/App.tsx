import { useState } from 'react'
import { Sparkles, Languages, Shield } from 'lucide-react'
import Home from './components/Home'
import Gallery from './components/Gallery'
import Designer from './components/Designer'
import Admin from './components/Admin'
import { Language, getTranslation } from './translations'
import { CustomInvitationType } from './types'

type Page = 'home' | 'gallery' | 'designer' | 'admin'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [language, setLanguage] = useState<Language>('he')
  const [customInvitationTypes, setCustomInvitationTypes] = useState<CustomInvitationType[]>([{
    id: 'family-celebration',
    nameHe: 'שמחה משפחתית',
    nameYi: 'משפוחה שמחה',
    nameEn: 'Family Celebration',
  }])

  const t = getTranslation(language)
  const isRTL = language === 'he'

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'he' ? 'en' : 'he')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center space-x-2 rtl:space-x-reverse hover:opacity-80 transition-opacity"
            >
              <Sparkles className="w-8 h-8 text-amber-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-amber-600 bg-clip-text text-transparent">
                {t.header.title}
              </h1>
            </button>
            <nav className="hidden md:flex space-x-8 rtl:space-x-reverse items-center">
              <button
                onClick={() => setCurrentPage('home')}
                className={`transition-colors font-medium ${
                  currentPage === 'home' ? 'text-amber-600' : 'text-gray-700 hover:text-amber-600'
                }`}
              >
                {t.header.home}
              </button>
              <button
                onClick={() => setCurrentPage('gallery')}
                className={`transition-colors font-medium ${
                  currentPage === 'gallery' ? 'text-amber-600' : 'text-gray-700 hover:text-amber-600'
                }`}
              >
                {t.header.gallery}
              </button>
              <button
                onClick={() => setCurrentPage('admin')}
                className={`transition-colors font-medium flex items-center space-x-1 rtl:space-x-reverse ${
                  currentPage === 'admin' ? 'text-amber-600' : 'text-gray-700 hover:text-amber-600'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>{t.header.admin}</span>
              </button>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors font-medium">{t.header.pricing}</a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors font-medium">{t.header.contact}</a>
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 rtl:space-x-reverse text-gray-700 hover:text-amber-600 transition-colors"
                title={language === 'he' ? 'Switch to English' : 'עבור לעברית'}
              >
                <Languages className="w-5 h-5" />
                <span className="text-sm font-medium">{language === 'he' ? 'EN' : 'עב'}</span>
              </button>
            </nav>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={toggleLanguage}
                className="md:hidden flex items-center space-x-1 rtl:space-x-reverse text-gray-700 hover:text-amber-600 transition-colors"
                title={language === 'he' ? 'Switch to English' : 'עבור לעברית'}
              >
                <Languages className="w-5 h-5" />
                <span className="text-sm font-medium">{language === 'he' ? 'EN' : 'עב'}</span>
              </button>
              <button
                onClick={() => setCurrentPage('designer')}
                className="bg-gradient-to-r from-gray-700 to-amber-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 font-medium"
              >
                {t.header.startNow}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {currentPage === 'home' && <Home onStartDesigning={() => setCurrentPage('designer')} language={language} />}
        {currentPage === 'gallery' && <Gallery language={language} />}
        {currentPage === 'designer' && <Designer language={language} customTypes={customInvitationTypes} />}
        {currentPage === 'admin' && (
          <Admin
            language={language}
            customTypes={customInvitationTypes}
            onCustomTypesChange={setCustomInvitationTypes}
          />
        )}
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid md:grid-cols-3 gap-8 text-center ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
            <div>
              <div className={`flex items-center justify-center ${isRTL ? 'md:justify-start' : 'md:justify-start'} space-x-2 rtl:space-x-reverse mb-4`}>
                <Sparkles className="w-6 h-6 text-amber-400" />
                <h4 className="text-xl font-bold">{t.header.title}</h4>
              </div>
              <p className="text-gray-400">
                {t.footer.subtitle}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">{t.footer.quickLinks}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">{t.header.home}</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">{t.header.gallery}</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">{t.header.pricing}</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">{t.header.contact}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">{t.footer.contactUs}</h4>
              <p className="text-gray-400">
                info@invitations.co.il<br />
                050-1234567
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t.footer.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App;
