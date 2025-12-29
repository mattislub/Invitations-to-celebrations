import { useMemo, useState } from 'react'
import { LayoutTemplate, Ruler, CheckCircle2, MonitorSmartphone, Maximize2, Percent, Image, Sparkles } from 'lucide-react'
import { Language, getTranslation } from '../translations'

interface HomeProps {
  onStartDesigning: () => void
  language: Language
}

const PX_PER_INCH = 96
const CM_PER_INCH = 2.54
const BASE_TEMPLATE_SIZE = { width: 1080, height: 1920 }

type Unit = 'px' | 'cm' | 'in'

const formatUnitLabel = (unit: Unit, language: Language) => {
  if (unit === 'px') return 'px'
  if (unit === 'cm') return language === 'he' ? 'ס"מ' : 'cm'
  return language === 'he' ? 'אינץ׳' : 'in'
}

export default function Home({ onStartDesigning, language }: HomeProps) {
  const t = getTranslation(language)
  const [unit, setUnit] = useState<Unit>('px')

  const convertedSize = useMemo(() => {
    if (unit === 'px') return BASE_TEMPLATE_SIZE
    if (unit === 'cm') {
      return {
        width: BASE_TEMPLATE_SIZE.width / (PX_PER_INCH / CM_PER_INCH),
        height: BASE_TEMPLATE_SIZE.height / (PX_PER_INCH / CM_PER_INCH)
      }
    }
    return {
      width: BASE_TEMPLATE_SIZE.width / PX_PER_INCH,
      height: BASE_TEMPLATE_SIZE.height / PX_PER_INCH
    }
  }, [unit])

  const formatValue = (value: number) => unit === 'px' ? Math.round(value).toString() : value.toFixed(1)

  const featureCards = [
    {
      icon: LayoutTemplate,
      title: language === 'he' ? 'התאמה מלאה לעריכת תבנית' : 'Matches the template editor 1:1',
      description: language === 'he'
        ? 'דף החזית משתמש באותו גודל בדיוק, ללא שינוי ערכים וללא קנה מידה באחוזים.'
        : 'The front page uses the exact template size—no value changes and no percentage scaling.'
    },
    {
      icon: Ruler,
      title: language === 'he' ? 'גודל אמיתי' : 'True physical size',
      description: language === 'he'
        ? 'מדדי פיקסלים מומרים לס״מ/אינץ׳ כדי שתדעו מה יישלח או יודפס במציאות.'
        : 'Pixel values convert to cm/in so you know the real-world output for print or send.'
    },
    {
      icon: Maximize2,
      title: language === 'he' ? 'ללא אחוזים' : 'No percentages',
      description: language === 'he'
        ? 'כל שורה ושדה נשארים בדיוק בגודל שהוגדר בתבנית, גם כשהרקע משתנה.'
        : 'Every line and field keeps the defined size even when backgrounds change.'
    }
  ]

  const timeline = [
    {
      title: language === 'he' ? 'קובעים גודל אחד' : 'Lock a single size',
      text: language === 'he'
        ? 'בחרו רוחב וגובה בתבנית הניהול. הערכים האלה נמשכים ישירות לדף החזית.'
        : 'Pick a width and height in the admin template. Those values flow directly to the front page.'
    },
    {
      title: language === 'he' ? 'תצוגה תואמת' : 'Mirrored preview',
      text: language === 'he'
        ? 'הפריסה והטקסט מוצגים באותו יחס רוחב/גובה, כולל רקעים וסגנונות.'
        : 'Layout and wording show in the same aspect ratio, including backgrounds and styles.'
    },
    {
      title: language === 'he' ? 'יצוא בגודל אמיתי' : 'Export at full size',
      text: language === 'he'
        ? 'ההורדה נעשית בפיקסלים שהוגדרו, כך שהקובץ מוכן להדפסה או שליחה.'
        : 'Downloads respect the defined pixels, so the file is print- and send-ready.'
    }
  ]

  const heroTitleFirstLine = language === 'he'
    ? 'דף חזית חדש שמדבר' : 'A redesigned front page'

  const heroTitleSecondLine = language === 'he'
    ? 'באותו גודל כמו עריכת התבנית' : 'with the exact template size'

  return (
    <section className="bg-gradient-to-b from-amber-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'he' ? 'חוויית חזית מעודכנת' : 'Updated front experience'}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {heroTitleFirstLine}<br />
              <span className="bg-gradient-to-r from-gray-700 to-amber-600 bg-clip-text text-transparent">{heroTitleSecondLine}</span>
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-2xl">
              {language === 'he'
                ? 'המידות שמוגדרות בעורך התבניות נשמרות כמו שהן. בלי אחוזים, בלי שינוי ערכים ובלי הפתעות כשהלקוח נכנס לעצב.'
                : 'The sizes defined in the template editor stay intact. No percentages, no altered values, and no surprises when customers start designing.'}
            </p>
            <div className="flex flex-wrap gap-3">
              {(['px', 'cm', 'in'] as Unit[]).map(option => (
                <button
                  key={option}
                  onClick={() => setUnit(option)}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                    unit === option ? 'bg-gradient-to-r from-gray-800 to-amber-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:border-amber-200'
                  }`}
                >
                  <Ruler className="w-4 h-4" />
                  <span>{formatUnitLabel(option, language)}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <LayoutTemplate className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{language === 'he' ? 'מידות תבנית' : 'Template size'}</p>
                  <p className="text-lg font-semibold text-gray-900">{`${formatValue(convertedSize.width)} × ${formatValue(convertedSize.height)} ${formatUnitLabel(unit, language)}`}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm flex items-center space-x-3 rtl:space-x-reverse">
                <Percent className="w-6 h-6 text-gray-500" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{language === 'he' ? 'שימור ערכים' : 'Values locked'}</p>
                  <p className="text-lg font-semibold text-gray-900">{language === 'he' ? 'ללא שינוי אחוזי' : 'Zero % scaling'}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onStartDesigning}
                className="bg-gradient-to-r from-gray-800 to-amber-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {t.home.hero.cta}
              </button>
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>{language === 'he' ? 'אותה מידה בממשק ובעריכה' : 'Identical size in editor and front'}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-amber-100/60 rounded-3xl" aria-hidden />
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-amber-100 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Image className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="text-sm text-gray-500">{language === 'he' ? 'תצוגת רקע' : 'Background view'}</p>
                    <p className="text-lg font-semibold text-gray-900">{language === 'he' ? 'צפייה מלאה בקובץ' : 'Full-size preview'}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{language === 'he' ? 'שומר מידה' : 'Size safe'}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[{ label: language === 'he' ? 'עריכת תבנית' : 'Template editor', tone: 'amber' }, { label: language === 'he' ? 'דף חזית' : 'Front page', tone: 'emerald' }].map((card) => (
                  <div key={card.label} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-800">{card.label}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {`${formatValue(convertedSize.width)}×${formatValue(convertedSize.height)} ${formatUnitLabel(unit, language)}`}
                      </span>
                    </div>
                    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-3 shadow-inner">
                      <div
                        className="mx-auto bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-lg relative overflow-hidden"
                        style={{ aspectRatio: `${BASE_TEMPLATE_SIZE.width}/${BASE_TEMPLATE_SIZE.height}`, width: '100%', maxWidth: '280px' }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(17,24,39,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] text-gray-500">
                          <span>{language === 'he' ? '100% תוכן' : '100% content'}</span>
                          <span>{language === 'he' ? 'בלי אחוזים' : 'No %'}</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/95 rounded-xl px-4 py-3 text-center shadow">
                            <p className="text-sm font-semibold text-gray-800">{language === 'he' ? 'גודל אמיתי' : 'True size'}</p>
                            <p className="text-xs text-gray-500">{language === 'he' ? 'רוחב וגובה זהים לעריכה' : 'Same width & height as editor'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <MonitorSmartphone className="w-8 h-8 text-gray-700" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{language === 'he' ? 'רזולוציה קבועה' : 'Fixed resolution'}</p>
                    <p className="text-xs text-gray-600">{language === 'he' ? 'טוענים את אותו יחס גם במסך וגם בדפוס' : 'Same ratio for screen and print'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{language === 'he' ? 'ערכים נעולים' : 'Locked values'}</p>
                    <p className="text-xs text-gray-600">{language === 'he' ? 'אין שינוי בשדה או בטקסט בין מסכים' : 'Fields and text stay identical everywhere'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featureCards.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-3 hover:-translate-y-1 transition-transform">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Icon className="w-10 h-10 text-amber-600" />
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
            <LayoutTemplate className="w-6 h-6 text-amber-600" />
            <h3 className="text-3xl font-bold text-gray-900">{language === 'he' ? 'תהליך עבודה אחיד' : 'A unified workflow'}</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {timeline.map((item, index) => (
              <div key={item.title} className="relative bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="absolute -top-3 left-4 rtl:left-auto rtl:right-4 bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">{index + 1}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2 mt-2">{item.title}</h4>
                <p className="text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-amber-700 rounded-3xl p-10 md:p-12 shadow-2xl text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">{language === 'he' ? 'חזית שמייצגת את התבנית בדיוק' : 'A front page that mirrors your template'}</h3>
          <p className="text-white/90 text-lg max-w-3xl mx-auto mb-8">
            {language === 'he'
              ? 'הלקוחות רואים את אותה מידת תבנית שהוגדרה אצלכם בעורך. בלי שינוי ערכים, בלי אחוזים, ועם רזולוציה אמיתית מהתיקייה.'
              : 'Visitors see the same template size you set in the editor—no altered values, no percentage scaling, and a true resolution pulled from your files.'}
          </p>
          <button
            onClick={onStartDesigning}
            className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            {language === 'he' ? 'מעבר לתהליך העיצוב' : 'Go to the designer'}
          </button>
        </div>
      </div>
    </section>
  )
}
