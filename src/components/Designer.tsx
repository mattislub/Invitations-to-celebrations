import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Users, Gift, Cake, PartyPopper, User, ChevronRight, Wand2, Layers, Sparkles, BookOpen, Video } from 'lucide-react'
import { Language, getTranslation } from '../translations'
import { AdminBackground, CustomInvitationType, SavedInvitationTemplate, VideoBackground } from '../types'

type EventType = 'wedding' | 'bar-mitzvah' | 'bat-mitzvah' | 'birthday' | 'engagement' | 'thank-you' | `custom-${string}`
type DesignStyle = 'modern' | 'religious'

interface LocalizedName {
  he: string
  en: string
  yi?: string
}

interface DesignerProps {
  language: Language
  customTypes: CustomInvitationType[]
  imageBackgrounds: AdminBackground[]
  videoBackgrounds: VideoBackground[]
  savedTemplates?: SavedInvitationTemplate[]
}

interface EventTemplate {
  id: EventType
  names: LocalizedName
  icon: typeof Heart
  fields: FormField[]
  defaultNames: { [key: string]: string | undefined }
  isCustom?: boolean
}

interface FormField {
  id: string
  label: string
  type: 'text'
  placeholder: string
  required?: boolean
}

interface BackgroundOption {
  id: string
  name: string
  images: string[]
  type?: 'image' | 'video'
  videoUrl?: string
  previewImage?: string
  style?: DesignStyle[]
}

interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  text: string
  style?: DesignStyle[]
}

interface Animation {
  id: string
  name: string
  class: string
}

export default function Designer({
  language,
  customTypes,
  imageBackgrounds,
  videoBackgrounds,
  savedTemplates = []
}: DesignerProps) {
  const t = getTranslation(language)
  const [step, setStep] = useState<'type' | 'details' | 'style' | 'design'>('type')
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)
  const [designStyle, setDesignStyle] = useState<DesignStyle>('modern')
  const [formData, setFormData] = useState<{ [key: string]: string }>({})
  const [selectedBackground, setSelectedBackground] = useState<string>('')
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>('amber')
  const [selectedAnimation, setSelectedAnimation] = useState<string>('fadeIn')
  const [animationKey, setAnimationKey] = useState<number>(0)
  const [selectedSavedTemplateId, setSelectedSavedTemplateId] = useState<string>('')
  const [templateFieldValues, setTemplateFieldValues] = useState<Record<string, string>>({})
  const [templateTextValues, setTemplateTextValues] = useState<Record<string, string>>({})
  const hasAutoSelectedTemplate = useRef(false)

  const eventTemplates = useMemo<EventTemplate[]>(() => ([
    {
      id: 'wedding',
      names: {
        he: 'חתונה',
        en: 'Wedding',
        yi: 'חתונה'
      },
      icon: Heart,
      fields: [
        { id: 'groomName', label: 'שם החתן', type: 'text', placeholder: 'יוסי', required: true },
        { id: 'brideName', label: 'שם הכלה', type: 'text', placeholder: 'שרה', required: true },
        { id: 'groomParents', label: 'שמות הורי החתן', type: 'text', placeholder: 'משה ורחל כהן' },
        { id: 'brideParents', label: 'שמות הורי הכלה', type: 'text', placeholder: 'דוד ומרים לוי' },
        { id: 'hebrewDate', label: 'תאריך עברי', type: 'text', placeholder: "ח' אדר תשפ\"ה" },
        { id: 'gregorianDate', label: 'תאריך לועזי', type: 'text', placeholder: '15.08.2025' },
        { id: 'venue', label: 'מקום האירוע', type: 'text', placeholder: 'גן אירועים רויאל' },
        { id: 'time', label: 'שעה', type: 'text', placeholder: '19:00' },
      ],
      defaultNames: {
        groomName: 'דוד',
        brideName: 'שרה',
        groomParents: 'משה ורחל כהן',
        brideParents: 'יוסף ומרים לוי',
        hebrewDate: "ט\"ו באב תשפ\"ה",
        gregorianDate: '15.08.2025',
        venue: 'גן אירועים רויאל',
        time: '19:00'
      }
    },
    {
      id: 'bar-mitzvah',
      names: {
        he: 'בר מצווה',
        en: 'Bar Mitzvah',
        yi: 'בר מצוה'
      },
      icon: Users,
      fields: [
        { id: 'boyName', label: 'שם הבחור', type: 'text', placeholder: 'יוסי', required: true },
        { id: 'parentsNames', label: 'שמות ההורים', type: 'text', placeholder: 'דוד ושרה כהן' },
        { id: 'hebrewDate', label: 'תאריך עברי', type: 'text', placeholder: "כ\"א אדר תשפ\"ה" },
        { id: 'gregorianDate', label: 'תאריך לועזי', type: 'text', placeholder: '22.03.2025' },
        { id: 'venue', label: 'מקום האירוע', type: 'text', placeholder: 'בית הכנסת הגדול' },
        { id: 'time', label: 'שעה', type: 'text', placeholder: '18:30' },
      ],
      defaultNames: {
        boyName: 'יוסי',
        parentsNames: 'דוד ושרה כהן',
        hebrewDate: "כ\"א אדר תשפ\"ה",
        gregorianDate: '22.03.2025',
        venue: 'בית הכנסת הגדול',
        time: '18:30'
      }
    },
    {
      id: 'bat-mitzvah',
      names: {
        he: 'בת מצווה',
        en: 'Bat Mitzvah',
        yi: 'בת מצוה'
      },
      icon: Gift,
      fields: [
        { id: 'girlName', label: 'שם הבת', type: 'text', placeholder: 'שרה', required: true },
        { id: 'parentsNames', label: 'שמות ההורים', type: 'text', placeholder: 'דוד ורחל לוי' },
        { id: 'hebrewDate', label: 'תאריך עברי', type: 'text', placeholder: "י\"ב ניסן תשפ\"ה" },
        { id: 'gregorianDate', label: 'תאריך לועזי', type: 'text', placeholder: '10.04.2025' },
        { id: 'venue', label: 'מקום האירוע', type: 'text', placeholder: 'אולם סמדר' },
        { id: 'time', label: 'שעה', type: 'text', placeholder: '19:00' },
      ],
      defaultNames: {
        girlName: 'שרה',
        parentsNames: 'דוד ורחל לוי',
        hebrewDate: "י\"ב ניסן תשפ\"ה",
        gregorianDate: '10.04.2025',
        venue: 'אולם סמדר',
        time: '19:00'
      }
    },
    {
      id: 'birthday',
      names: {
        he: 'יום הולדת',
        en: 'Birthday',
        yi: 'געבורסטאג'
      },
      icon: Cake,
      fields: [
        { id: 'celebrantName', label: 'שם החוגג/ת', type: 'text', placeholder: 'דני', required: true },
        { id: 'age', label: 'גיל', type: 'text', placeholder: '30' },
        { id: 'date', label: 'תאריך', type: 'text', placeholder: '25.05.2025' },
        { id: 'venue', label: 'מקום האירוע', type: 'text', placeholder: 'הבית' },
        { id: 'time', label: 'שעה', type: 'text', placeholder: '20:00' },
      ],
      defaultNames: {
        celebrantName: 'דני',
        age: '30',
        date: '25.05.2025',
        venue: 'הבית',
        time: '20:00'
      }
    },
    {
      id: 'engagement',
      names: {
        he: 'אירוסין',
        en: 'Engagement',
        yi: 'תנאים'
      },
      icon: PartyPopper,
      fields: [
        { id: 'groomName', label: 'שם החתן', type: 'text', placeholder: 'יוסי', required: true },
        { id: 'brideName', label: 'שם הכלה', type: 'text', placeholder: 'שרה', required: true },
        { id: 'date', label: 'תאריך', type: 'text', placeholder: '01.06.2025' },
        { id: 'venue', label: 'מקום האירוע', type: 'text', placeholder: 'מסעדת טאבולה' },
        { id: 'time', label: 'שעה', type: 'text', placeholder: '19:30' },
      ],
      defaultNames: {
        groomName: 'יוסי',
        brideName: 'שרה',
        date: '01.06.2025',
        venue: 'מסעדת טאבולה',
        time: '19:30'
      }
    },
    {
      id: 'thank-you',
      names: {
        he: 'כרטיס תודה',
        en: 'Thank You Card',
        yi: 'דאנק קארטל'
      },
      icon: Heart,
      fields: [
        { id: 'fromName', label: 'מאת', type: 'text', placeholder: 'משפחת כהן', required: true },
        { id: 'message', label: 'מסר אישי', type: 'text', placeholder: 'תודה על בואכם לחגוג איתנו' },
      ],
      defaultNames: {
        fromName: 'משפחת כהן',
        message: 'תודה על בואכם לחגוג איתנו'
      }
    },
  ]), [])

  const customTemplates = useMemo<EventTemplate[]>(() => customTypes.map((type) => ({
    id: `custom-${type.id}` as EventType,
    names: {
      he: type.nameHe,
      en: type.nameEn,
      yi: type.nameYi
    },
    icon: Sparkles,
    fields: [
      { id: 'eventTitle', label: t.designer.form.eventTitle, type: 'text', placeholder: type.nameHe, required: true },
      { id: 'hosts', label: t.designer.form.hosts, type: 'text', placeholder: language === 'he' ? 'משפחת כהן' : 'Cohen Family' },
      { id: 'date', label: t.designer.form.date, type: 'text', placeholder: '25.05.2025' },
      { id: 'venue', label: t.designer.form.venue, type: 'text', placeholder: language === 'he' ? 'אולם אירועים' : 'Event Hall' },
      { id: 'time', label: t.designer.form.time, type: 'text', placeholder: '20:00' },
    ],
    defaultNames: {
      eventTitle: language === 'he' ? type.nameHe : type.nameEn || type.nameHe,
      hosts: language === 'he' ? 'משפחת כהן' : 'Cohen Family',
      date: '25.05.2025',
      venue: language === 'he' ? 'אולם אירועים' : 'Event Hall',
      time: '20:00'
    },
    isCustom: true
  })), [customTypes, language, t])

  const templatesWithCustom = useMemo(
    () => [...eventTemplates, ...customTemplates],
    [eventTemplates, customTemplates]
  )

  const baseBackgrounds: BackgroundOption[] = useMemo(() => ([]), [])

  const uploadedBackgroundOptions = useMemo<BackgroundOption[]>(() => imageBackgrounds.map((bg) => ({
    id: `uploaded-${bg.id}`,
    name: bg.name,
    images: bg.preview ? [bg.preview] : [],
    type: 'image'
  })), [imageBackgrounds])

  const videoBackgroundOptions = useMemo<BackgroundOption[]>(() => videoBackgrounds.map((bg) => ({
    id: `video-${bg.id}`,
    name: bg.name,
    images: bg.previewImage ? [bg.previewImage] : [],
    videoUrl: bg.url,
    previewImage: bg.previewImage,
    type: 'video'
  })), [videoBackgrounds])

  const backgrounds = useMemo(
    () => [...uploadedBackgroundOptions, ...baseBackgrounds, ...videoBackgroundOptions],
    [baseBackgrounds, uploadedBackgroundOptions, videoBackgroundOptions]
  )

  const selectedSavedTemplate = useMemo(
    () => savedTemplates?.find((item) => item.id === selectedSavedTemplateId),
    [savedTemplates, selectedSavedTemplateId]
  )

  const resolveBackgroundOption = useCallback((backgroundId?: string | null): BackgroundOption | undefined => {
    if (!backgroundId) return undefined
    if (backgroundId.startsWith('image-')) {
      const id = backgroundId.replace('image-', '')
      const match = imageBackgrounds.find((bg) => bg.id === id)
      if (!match) return undefined
      return {
        id: backgroundId,
        name: match.name,
        images: match.preview ? [match.preview] : [],
        type: 'image'
      }
    }
    if (backgroundId.startsWith('video-')) {
      const id = backgroundId.replace('video-', '')
      const match = videoBackgrounds.find((bg) => bg.id === id)
      if (!match) return undefined
      return {
        id: backgroundId,
        name: match.name,
        images: match.previewImage ? [match.previewImage] : [],
        videoUrl: match.url,
        previewImage: match.previewImage,
        type: 'video'
      }
    }
    return backgrounds.find((bg) => bg.id === backgroundId)
  }, [backgrounds, imageBackgrounds, videoBackgrounds])

  const selectedTemplateBackground = useMemo(
    () => resolveBackgroundOption(selectedSavedTemplate?.template.backgroundId),
    [resolveBackgroundOption, selectedSavedTemplate?.template.backgroundId]
  )

  useEffect(() => {
    setSelectedBackground((current) => current || backgrounds[0]?.id || '')
  }, [backgrounds])

  useEffect(() => {
    if (!selectedSavedTemplate) return
    const nextTextValues: Record<string, string> = {}
    selectedSavedTemplate.template.textLines?.forEach((line) => {
      nextTextValues[line.id] = line.text
    })
    setTemplateFieldValues({})
    setTemplateTextValues(nextTextValues)
    if (selectedSavedTemplate.template.backgroundId) {
      setSelectedBackground(selectedSavedTemplate.template.backgroundId)
    }
  }, [selectedSavedTemplate])

  useEffect(() => {
    if (selectedSavedTemplateId) return
    setTemplateFieldValues({})
    setTemplateTextValues({})
  }, [selectedSavedTemplateId])

  useEffect(() => {
    if (hasAutoSelectedTemplate.current) return
    if (!selectedSavedTemplateId && (savedTemplates?.length ?? 0) > 0) {
      setSelectedSavedTemplateId(savedTemplates?.[0]?.id ?? '')
      hasAutoSelectedTemplate.current = true
    }
  }, [savedTemplates, selectedSavedTemplateId])

  const formatTemplateDate = (value?: string) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')
  }

  const colorSchemes: ColorScheme[] = [
    {
      id: 'amber',
      name: 'זהב חם',
      primary: '#78350f',
      secondary: '#f59e0b',
      accent: '#fbbf24',
      text: '#1f2937',
      style: ['modern']
    },
    {
      id: 'rose',
      name: 'ורוד עדין',
      primary: '#881337',
      secondary: '#e11d48',
      accent: '#fb7185',
      text: '#1f2937',
      style: ['modern']
    },
    {
      id: 'navy-gold',
      name: 'כחול וזהב',
      primary: '#1e3a8a',
      secondary: '#1e40af',
      accent: '#d97706',
      text: '#1f2937',
      style: ['religious']
    },
    {
      id: 'burgundy',
      name: 'בורדו מכובד',
      primary: '#7f1d1d',
      secondary: '#991b1b',
      accent: '#ca8a04',
      text: '#1f2937',
      style: ['religious']
    },
    {
      id: 'forest-gold',
      name: 'ירוק עמוק',
      primary: '#14532d',
      secondary: '#166534',
      accent: '#ca8a04',
      text: '#1f2937',
      style: ['religious']
    },
    {
      id: 'charcoal',
      name: 'אפור מסורתי',
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#b45309',
      text: '#111827',
      style: ['religious']
    }
  ]

  const animations: Animation[] = [
    { id: 'fadeIn', name: 'דהייה', class: 'animate-fade-in' },
    { id: 'slideUp', name: 'החלקה', class: 'animate-slide-up' },
    { id: 'zoomIn', name: 'זום', class: 'animate-zoom-in' },
    { id: 'bounce', name: 'קפיצה', class: 'animate-bounce-in' },
    { id: 'rotate', name: 'סיבוב', class: 'animate-rotate-in' },
  ]

  const currentTemplate = templatesWithCustom.find(t => t.id === selectedEventType)

  const getTemplateDisplayName = (template: EventTemplate) =>
    language === 'en' ? template.names.en : template.names.he

  const displayData = useMemo(() => {
    if (!currentTemplate) return {}

    const data: { [key: string]: string } = {}
    currentTemplate.fields.forEach(field => {
      data[field.id] = formData[field.id] || currentTemplate.defaultNames[field.id] || ''
    })
    return data
  }, [formData, currentTemplate])

  const templateMode = Boolean(selectedSavedTemplate)
  const filteredBackgrounds = backgrounds.filter(bg => !bg.style || bg.style.includes(designStyle))
  const filteredColorSchemes = colorSchemes.filter(cs => !cs.style || cs.style.includes(designStyle))
  const selectedBackgroundOption = backgrounds.find(b => b.id === selectedBackground)
  const activeBackgroundOption = templateMode
    ? (selectedTemplateBackground ?? selectedBackgroundOption)
    : selectedBackgroundOption
  const currentColorScheme = colorSchemes.find(cs => cs.id === selectedColorScheme)

  const religiousBlessings: { [key in EventType]?: string } = {
    'wedding': 'בס"ד - ולירושלים עירך ברחמים תשוב',
    'bar-mitzvah': 'בס"ד - ויתן לך ה\' חכמה ובינה',
    'bat-mitzvah': 'בס"ד - אשת חיל מי ימצא',
    'engagement': 'בס"ד - מזל טוב',
  }

  const handleEventTypeSelect = (type: EventType) => {
    setSelectedEventType(type)
    setStep('details')
  }

  const handleStyleSelect = (style: DesignStyle) => {
    setDesignStyle(style)
    const matchingBackground = backgrounds.find(bg => !bg.style || bg.style.includes(style))
    setSelectedBackground(matchingBackground?.id ?? backgrounds[0]?.id ?? '')
    setSelectedColorScheme(style === 'religious' ? 'navy-gold' : 'amber')
    setStep('design')
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleContinueToDesign = () => {
    setStep('style')
  }

  const handleAnimationChange = (animationId: string) => {
    setSelectedAnimation(animationId)
    setAnimationKey(prev => prev + 1)
  }

  const renderBackgroundLayer = (background?: BackgroundOption, baseOpacity = 1) => {
    if (!background) return null

    if (background.type === 'video' && background.videoUrl) {
      return (
        <video
          key={background.id}
          className="absolute inset-0 w-full h-full object-cover"
          src={background.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          style={{ opacity: baseOpacity }}
        />
      )
    }

    return background.images.map((image, index) => (
      <div
        key={index}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${image})`,
          opacity: baseOpacity,
        }}
      />
    ))
  }

  const renderInvitationContent = () => {
    if (!selectedEventType || !currentTemplate) return null

    const isReligious = designStyle === 'religious'
    const blessing = isReligious && religiousBlessings[selectedEventType]

    switch (selectedEventType) {
      case 'wedding':
        if (isReligious) {
          return (
            <div style={{ fontFamily: 'serif' }}>
              {blessing && (
                <p className="text-sm mb-4 font-semibold" style={{ color: currentColorScheme?.primary }}>
                  {blessing}
                </p>
              )}
              <div className="mb-4">
                <p className="text-xs mb-2" style={{ color: currentColorScheme?.text }}>בשמחה ובטוב לבב</p>
                <p className="text-xs mb-3" style={{ color: currentColorScheme?.text }}>יוצאים בזה</p>
              </div>
              <div className="mb-6">
                <p className="text-sm mb-1" style={{ color: currentColorScheme?.text }}>{displayData.groomParents}</p>
                <p className="text-sm mb-3" style={{ color: currentColorScheme?.text }}>להזמינכם לחתונת בנם</p>
                <h4 className="text-3xl font-bold mb-4" style={{ color: currentColorScheme?.primary }}>
                  {displayData.groomName}
                </h4>
              </div>
              <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: currentColorScheme?.accent }} />
              <div className="mb-6">
                <p className="text-sm mb-1" style={{ color: currentColorScheme?.text }}>{displayData.brideParents}</p>
                <p className="text-sm mb-3" style={{ color: currentColorScheme?.text }}>להזמינכם לחתונת בתם</p>
                <h4 className="text-3xl font-bold mb-4" style={{ color: currentColorScheme?.primary }}>
                  {displayData.brideName}
                </h4>
              </div>
              <div className="w-24 h-0.5 mx-auto mb-4" style={{ backgroundColor: currentColorScheme?.accent }} />
              {displayData.hebrewDate && (
                <p className="text-lg font-bold mb-1" style={{ color: currentColorScheme?.primary }}>{displayData.hebrewDate}</p>
              )}
              {displayData.gregorianDate && (
                <p className="text-sm mb-3" style={{ color: currentColorScheme?.text }}>{displayData.gregorianDate}</p>
              )}
              {displayData.venue && (
                <p className="text-sm mb-1" style={{ color: currentColorScheme?.text }}>{displayData.venue}</p>
              )}
              {displayData.time && (
                <p className="text-sm" style={{ color: currentColorScheme?.text }}>שעה: {displayData.time}</p>
              )}
            </div>
          )
        }
        return (
          <>
            <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: currentColorScheme?.secondary }} />
            <h4 className="text-3xl font-bold mb-2" style={{ color: currentColorScheme?.primary }}>
              {displayData.groomName} & {displayData.brideName}
            </h4>
            <p className="text-xl mb-4" style={{ color: currentColorScheme?.text }}>מתחתנים!</p>
            <div className="w-20 h-1 mx-auto mb-4 rounded-full" style={{ background: `linear-gradient(to right, ${currentColorScheme?.primary}, ${currentColorScheme?.secondary})` }} />
            {displayData.groomParents && (
              <p className="text-sm mb-1" style={{ color: currentColorScheme?.text }}>{displayData.groomParents}</p>
            )}
            {displayData.brideParents && (
              <p className="text-sm mb-4" style={{ color: currentColorScheme?.text }}>{displayData.brideParents}</p>
            )}
            {displayData.hebrewDate && (
              <p className="text-lg font-bold mb-1" style={{ color: currentColorScheme?.primary }}>{displayData.hebrewDate}</p>
            )}
            {displayData.gregorianDate && (
              <p className="text-sm mb-3" style={{ color: currentColorScheme?.text }}>{displayData.gregorianDate}</p>
            )}
            {displayData.venue && (
              <p className="mb-1" style={{ color: currentColorScheme?.text }}>{displayData.venue}</p>
            )}
            {displayData.time && (
              <p style={{ color: currentColorScheme?.text }}>שעה: {displayData.time}</p>
            )}
          </>
        )

      case 'bar-mitzvah':
        if (isReligious) {
          return (
            <div style={{ fontFamily: 'serif' }}>
              {blessing && (
                <p className="text-sm mb-4 font-semibold" style={{ color: currentColorScheme?.primary }}>
                  {blessing}
                </p>
              )}
              <p className="text-xs mb-4" style={{ color: currentColorScheme?.text }}>בשמחה רבה מזמינים אתכם</p>
              {displayData.parentsNames && (
                <p className="text-sm mb-4" style={{ color: currentColorScheme?.text }}>{displayData.parentsNames}</p>
              )}
              <p className="text-sm mb-2" style={{ color: currentColorScheme?.text }}>לעלות בנם לתורה</p>
              <h4 className="text-3xl font-bold mb-4" style={{ color: currentColorScheme?.primary }}>
                {displayData.boyName}
              </h4>
              <p className="text-xl font-semibold mb-4" style={{ color: currentColorScheme?.secondary }}>בר מצווה</p>
              <div className="w-24 h-0.5 mx-auto mb-4" style={{ backgroundColor: currentColorScheme?.accent }} />
              {displayData.hebrewDate && (
                <p className="text-lg font-bold mb-1" style={{ color: currentColorScheme?.primary }}>{displayData.hebrewDate}</p>
              )}
              {displayData.gregorianDate && (
                <p className="text-sm mb-3" style={{ color: currentColorScheme?.text }}>{displayData.gregorianDate}</p>
              )}
              {displayData.venue && (
                <p className="text-sm mb-1" style={{ color: currentColorScheme?.text }}>{displayData.venue}</p>
              )}
              {displayData.time && (
                <p className="text-sm" style={{ color: currentColorScheme?.text }}>שעה: {displayData.time}</p>
              )}
            </div>
          )
        }
        return (
          <>
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: currentColorScheme?.secondary }} />
            <h4 className="text-3xl font-bold mb-2" style={{ color: currentColorScheme?.primary }}>{displayData.boyName}</h4>
            <p className="text-xl mb-4" style={{ color: currentColorScheme?.text }}>בר מצווה</p>
            <div className="w-20 h-1 mx-auto mb-4 rounded-full" style={{ background: `linear-gradient(to right, ${currentColorScheme?.primary}, ${currentColorScheme?.secondary})` }} />
            {displayData.parentsNames && (
              <p className="mb-4" style={{ color: currentColorScheme?.text }}>{displayData.parentsNames}</p>
            )}
            {displayData.hebrewDate && (
              <p className="text-lg font-bold mb-1" style={{ color: currentColorScheme?.primary }}>{displayData.hebrewDate}</p>
            )}
            {displayData.gregorianDate && (
              <p className="text-sm mb-3" style={{ color: currentColorScheme?.text }}>{displayData.gregorianDate}</p>
            )}
            {displayData.venue && (
              <p className="mb-1" style={{ color: currentColorScheme?.text }}>{displayData.venue}</p>
            )}
            {displayData.time && (
              <p style={{ color: currentColorScheme?.text }}>שעה: {displayData.time}</p>
            )}
          </>
        )

      case 'bat-mitzvah':
        if (isReligious) {
          return (
            <div style={{ fontFamily: 'serif' }}>
              {blessing && (
                <p className="text-sm mb-4 font-semibold" style={{ color: currentColorScheme?.primary }}>
                  {blessing}
                </p>
              )}
              <p className="text-xs mb-4" style={{ color: currentColorScheme?.text }}>בשמחה רבה מזמינים אתכם</p>
              {displayData.parentsNames && (
                <p className="text-sm mb-4" style={{ color: currentColorScheme?.text }}>{displayData.parentsNames}</p>
              )}
              <p className="text-sm mb-2" style={{ color: currentColorScheme?.text }}>לחגיגת בת המצווה של בתנו</p>
              <h4 className="text-3xl font-bold mb-4" style={{ color: currentColorScheme?.primary }}>
                {displayData.girlName}
              </h4>
              <p className="text-xl font-semibold mb-4" style={{ color: currentColorScheme?.secondary }}>בת מצווה</p>
              <div className="w-24 h-0.5 mx-auto mb-4" style={{ backgroundColor: currentColorScheme?.accent }} />
              {displayData.hebrewDate && (
                <p className="text-lg font-bold mb-1" style={{ color: currentColorScheme?.primary }}>{displayData.hebrewDate}</p>
              )}
              {displayData.gregorianDate && (
                <p className="text-sm mb-3" style={{ color: currentColorScheme?.text }}>{displayData.gregorianDate}</p>
              )}
              {displayData.venue && (
                <p className="text-sm mb-1" style={{ color: currentColorScheme?.text }}>{displayData.venue}</p>
              )}
              {displayData.time && (
                <p className="text-sm" style={{ color: currentColorScheme?.text }}>שעה: {displayData.time}</p>
              )}
            </div>
          )
        }
        return (
          <>
            <Gift className="w-16 h-16 mx-auto mb-4" style={{ color: currentColorScheme?.secondary }} />
            <h4 className="text-3xl font-bold mb-2" style={{ color: currentColorScheme?.primary }}>{displayData.girlName}</h4>
            <p className="text-xl mb-4" style={{ color: currentColorScheme?.text }}>בת מצווה</p>
            <div className="w-20 h-1 mx-auto mb-4 rounded-full" style={{ background: `linear-gradient(to right, ${currentColorScheme?.primary}, ${currentColorScheme?.secondary})` }} />
            {displayData.parentsNames && (
              <p className="mb-4" style={{ color: currentColorScheme?.text }}>{displayData.parentsNames}</p>
            )}
            {displayData.hebrewDate && (
              <p className="text-lg font-bold mb-1" style={{ color: currentColorScheme?.primary }}>{displayData.hebrewDate}</p>
            )}
            {displayData.gregorianDate && (
              <p className="text-sm mb-3" style={{ color: currentColorScheme?.text }}>{displayData.gregorianDate}</p>
            )}
            {displayData.venue && (
              <p className="mb-1" style={{ color: currentColorScheme?.text }}>{displayData.venue}</p>
            )}
            {displayData.time && (
              <p style={{ color: currentColorScheme?.text }}>שעה: {displayData.time}</p>
            )}
          </>
        )

      case 'birthday':
        return (
          <>
            <Cake className="w-16 h-16 mx-auto mb-4" style={{ color: currentColorScheme?.secondary }} />
            <h4 className="text-3xl font-bold mb-2" style={{ color: currentColorScheme?.primary }}>{displayData.celebrantName}</h4>
            {displayData.age && (
              <p className="text-xl mb-4" style={{ color: currentColorScheme?.text }}>חוגג/ת {displayData.age}</p>
            )}
            <div className="w-20 h-1 mx-auto mb-4 rounded-full" style={{ background: `linear-gradient(to right, ${currentColorScheme?.primary}, ${currentColorScheme?.secondary})` }} />
            {displayData.date && (
              <p className="text-lg font-bold mb-3" style={{ color: currentColorScheme?.primary }}>{displayData.date}</p>
            )}
            {displayData.venue && (
              <p className="mb-1" style={{ color: currentColorScheme?.text }}>{displayData.venue}</p>
            )}
            {displayData.time && (
              <p style={{ color: currentColorScheme?.text }}>שעה: {displayData.time}</p>
            )}
          </>
        )

      case 'engagement':
        if (isReligious) {
          return (
            <div style={{ fontFamily: 'serif' }}>
              {blessing && (
                <p className="text-sm mb-4 font-semibold" style={{ color: currentColorScheme?.primary }}>
                  {blessing}
                </p>
              )}
              <p className="text-xs mb-4" style={{ color: currentColorScheme?.text }}>בשמחה ובטוב לבב מזמינים אתכם</p>
              <p className="text-sm mb-2" style={{ color: currentColorScheme?.text }}>לחגוג עמנו את אירוסי</p>
              <h4 className="text-2xl font-bold mb-2" style={{ color: currentColorScheme?.primary }}>
                {displayData.groomName}
              </h4>
              <p className="text-lg mb-4" style={{ color: currentColorScheme?.secondary }}>ו</p>
              <h4 className="text-2xl font-bold mb-4" style={{ color: currentColorScheme?.primary }}>
                {displayData.brideName}
              </h4>
              <div className="w-24 h-0.5 mx-auto mb-4" style={{ backgroundColor: currentColorScheme?.accent }} />
              {displayData.date && (
                <p className="text-lg font-bold mb-3" style={{ color: currentColorScheme?.primary }}>{displayData.date}</p>
              )}
              {displayData.venue && (
                <p className="text-sm mb-1" style={{ color: currentColorScheme?.text }}>{displayData.venue}</p>
              )}
              {displayData.time && (
                <p className="text-sm" style={{ color: currentColorScheme?.text }}>שעה: {displayData.time}</p>
              )}
            </div>
          )
        }
        return (
          <>
            <PartyPopper className="w-16 h-16 mx-auto mb-4" style={{ color: currentColorScheme?.secondary }} />
            <h4 className="text-3xl font-bold mb-2" style={{ color: currentColorScheme?.primary }}>
              {displayData.groomName} & {displayData.brideName}
            </h4>
            <p className="text-xl mb-4" style={{ color: currentColorScheme?.text }}>מתארסים!</p>
            <div className="w-20 h-1 mx-auto mb-4 rounded-full" style={{ background: `linear-gradient(to right, ${currentColorScheme?.primary}, ${currentColorScheme?.secondary})` }} />
            {displayData.date && (
              <p className="font-medium mb-3" style={{ color: currentColorScheme?.secondary }}>{displayData.date}</p>
            )}
            {displayData.venue && (
              <p className="mb-1" style={{ color: currentColorScheme?.text }}>{displayData.venue}</p>
            )}
            {displayData.time && (
              <p style={{ color: currentColorScheme?.text }}>שעה: {displayData.time}</p>
            )}
          </>
        )

      case 'thank-you':
        return (
          <>
            <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: currentColorScheme?.secondary }} />
            <h4 className="text-3xl font-bold mb-4" style={{ color: currentColorScheme?.primary }}>תודה רבה!</h4>
            <div className="w-20 h-1 mx-auto mb-4 rounded-full" style={{ background: `linear-gradient(to right, ${currentColorScheme?.primary}, ${currentColorScheme?.secondary})` }} />
            {displayData.message && (
              <p className="text-lg mb-4" style={{ color: currentColorScheme?.text }}>{displayData.message}</p>
            )}
            {displayData.fromName && (
              <p className="font-medium" style={{ color: currentColorScheme?.secondary }}>{displayData.fromName}</p>
            )}
          </>
        )

      default:
        return (
          <>
            <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: currentColorScheme?.secondary }} />
            <h4 className="text-3xl font-bold mb-2" style={{ color: currentColorScheme?.primary }}>
              {displayData.eventTitle || (currentTemplate ? getTemplateDisplayName(currentTemplate) : '')}
            </h4>
            {currentTemplate?.names.yi && (
              <p className="text-md mb-2" style={{ color: currentColorScheme?.text }}>{currentTemplate.names.yi}</p>
            )}
            {displayData.hosts && (
              <p className="text-lg mb-4" style={{ color: currentColorScheme?.text }}>{displayData.hosts}</p>
            )}
            <div className="w-20 h-1 mx-auto mb-4 rounded-full" style={{ background: `linear-gradient(to right, ${currentColorScheme?.primary}, ${currentColorScheme?.secondary})` }} />
            {displayData.date && (
              <p className="font-medium mb-3" style={{ color: currentColorScheme?.secondary }}>{displayData.date}</p>
            )}
            {displayData.venue && (
              <p className="mb-1" style={{ color: currentColorScheme?.text }}>{displayData.venue}</p>
            )}
            {displayData.time && (
              <p style={{ color: currentColorScheme?.text }}>{language === 'he' ? `שעה: ${displayData.time}` : `Time: ${displayData.time}`}</p>
            )}
          </>
        )
    }
  }

  const renderSavedTemplateContent = () => {
    if (!selectedSavedTemplate) return null
    const { template } = selectedSavedTemplate

    return (
      <>
        {template.textLines?.map((line) => (
          <div
            key={line.id}
            className="absolute"
            style={{
              left: `${line.position.x}%`,
              top: `${line.position.y}%`,
              width: `${line.position.width}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: line.position.align as 'left' | 'center' | 'right'
            }}
          >
            <p
              style={{
                fontFamily: line.font,
                fontSize: line.fontSize,
                color: currentColorScheme?.primary ?? '#1f2937'
              }}
              className="leading-tight"
            >
              {templateTextValues[line.id] ?? line.text}
            </p>
          </div>
        ))}
        {template.fields?.map((field) => (
          <div
            key={field.id}
            className="absolute"
            style={{
              left: `${field.position.x}%`,
              top: `${field.position.y}%`,
              width: `${field.position.width}%`,
              transform: 'translate(-50%, -50%)',
              textAlign: field.position.align as 'left' | 'center' | 'right'
            }}
          >
            <p
              className="text-base font-semibold"
              style={{ color: currentColorScheme?.text ?? '#1f2937' }}
            >
              {templateFieldValues[field.id] || field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </p>
          </div>
        ))}
      </>
    )
  }

  if (step === 'type') {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            בחרו סוג אירוע
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            מה הסוג של ההזמנה שתרצו ליצור?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {templatesWithCustom.map((template) => {
            const Icon = template.icon
            return (
              <button
                key={template.id}
                onClick={() => handleEventTypeSelect(template.id)}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:scale-105 text-center border-2 border-transparent hover:border-amber-500"
              >
                <Icon className="w-16 h-16 text-amber-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{getTemplateDisplayName(template)}</h3>
                {template.names.yi && (
                  <p className="text-sm text-gray-600">{template.names.yi}</p>
                )}
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  if (step === 'details') {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <button
          onClick={() => setStep('type')}
          className="mb-8 flex items-center text-gray-600 hover:text-amber-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5 ml-2" />
          חזרה לבחירת סוג אירוע
        </button>

        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            פרטי ההזמנה
          </h2>
          <p className="text-lg text-gray-600">
            מלאו את הפרטים או השאירו ריק לשמות אקראיים
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-amber-500 ml-2" />
              <h3 className="text-2xl font-bold text-gray-800">הזינו פרטים</h3>
            </div>

            <div className="space-y-4">
              {currentTemplate?.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    {field.label}
                    {field.required && <span className="text-red-500 mr-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleContinueToDesign}
              className="w-full mt-8 bg-gradient-to-r from-gray-700 to-amber-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              המשך לעיצוב
              <Wand2 className="w-5 h-5 mr-2" />
            </button>
          </div>

          <div className="lg:sticky lg:top-24 self-start">
              <div className="bg-gradient-to-br from-gray-100 to-amber-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">תצוגה מקדימה</h3>
              <div className="relative min-h-[500px] flex items-center justify-center rounded-xl overflow-hidden">
                {renderBackgroundLayer(selectedBackgroundOption)}
                <div className="bg-white rounded-2xl p-8 shadow-2xl text-center relative z-10 max-w-md">
                  {renderInvitationContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (step === 'style') {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <button
          onClick={() => setStep('details')}
          className="mb-8 flex items-center text-gray-600 hover:text-amber-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5 ml-2" />
          חזרה לפרטים
        </button>

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            בחרו סגנון עיצוב
          </h2>
          <p className="text-lg text-gray-600">
            איזה סגנון מתאים לכם?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <button
            onClick={() => handleStyleSelect('modern')}
            className="bg-white rounded-2xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105 border-2 border-transparent hover:border-amber-500"
          >
            <Sparkles className="w-20 h-20 text-amber-500 mx-auto mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">מודרני</h3>
            <p className="text-gray-600">עיצוב עכשווי עם צבעים חיים ומגוון רקעים</p>
          </button>

          <button
            onClick={() => handleStyleSelect('religious')}
            className="bg-white rounded-2xl p-12 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105 border-2 border-transparent hover:border-blue-800"
          >
            <BookOpen className="w-20 h-20 text-blue-800 mx-auto mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-3xl font-bold text-gray-800 mb-4">חרדי / דתי</h3>
            <p className="text-gray-600">עיצוב מסורתי צנוע עם ברכות ופסוקים</p>
          </button>
        </div>
      </section>
    )
  }

  if (step === 'design') {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <button
          onClick={() => setStep('style')}
          className="mb-8 flex items-center text-gray-600 hover:text-amber-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5 ml-2" />
          חזרה לבחירת סגנון
        </button>

        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            עיצוב ההזמנה
          </h2>
          <p className="text-lg text-gray-600">
            בחרו רקע, צבעים ואנימציה להזמנה שלכם
          </p>
        </div>

        <div className="space-y-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{t.designer.savedTemplates.title}</h3>
                <p className="text-gray-600">{t.designer.savedTemplates.subtitle}</p>
              </div>
              {selectedSavedTemplateId && (
                <button
                  onClick={() => setSelectedSavedTemplateId('')}
                  className="text-sm font-semibold text-gray-700 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {t.designer.savedTemplates.clear}
                </button>
              )}
            </div>

            {savedTemplates?.length ? (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  {savedTemplates.map((saved) => {
                    const isActive = saved.id === selectedSavedTemplateId
                    return (
                      <button
                        key={saved.id}
                        onClick={() => setSelectedSavedTemplateId(saved.id)}
                        className={`text-right rounded-xl border p-4 transition-all duration-200 ${
                          isActive
                            ? 'border-amber-400 shadow-lg shadow-amber-100 bg-amber-50/70'
                            : 'border-gray-200 hover:border-amber-200 hover:shadow'
                        }`}
                      >
                        <p className="font-bold text-gray-800 line-clamp-1">{saved.name}</p>
                        {saved.updatedAt && (
                          <p className="text-xs text-gray-500 mt-1">{formatTemplateDate(saved.updatedAt)}</p>
                        )}
                        <p className={`text-xs mt-2 ${isActive ? 'text-amber-700' : 'text-gray-500'}`}>
                          {t.designer.savedTemplates.useHint}
                        </p>
                      </button>
                    )
                  })}
                </div>

                {selectedSavedTemplate && (
                  <>
                    {selectedSavedTemplate.template.backgroundId && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        {t.designer.savedTemplates.backgroundLocked}
                      </div>
                    )}
                    <div className="grid lg:grid-cols-2 gap-6 mt-8">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">{t.designer.savedTemplates.fieldsTitle}</h4>
                          <p className="text-xs text-gray-500">{t.designer.savedTemplates.fieldsHelper}</p>
                      </div>
                      {selectedSavedTemplate.template.fields?.length ? (
                        <div className="space-y-3">
                          {selectedSavedTemplate.template.fields.map((field) => (
                            <label key={field.id} className="block">
                              <span className="text-sm font-medium text-gray-700 block mb-1">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                              </span>
                              <input
                                type="text"
                                value={templateFieldValues[field.id] ?? ''}
                                onChange={(e) => setTemplateFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value
                                }))}
                                placeholder={field.label}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
                              />
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">{t.designer.savedTemplates.empty}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">{t.designer.savedTemplates.textLinesTitle}</h4>
                        <p className="text-xs text-gray-500">{t.designer.savedTemplates.textLinesHelper}</p>
                      </div>
                      {selectedSavedTemplate.template.textLines?.length ? (
                        <div className="space-y-3">
                          {selectedSavedTemplate.template.textLines.map((line, index) => (
                            <label key={line.id} className="block">
                              <span className="text-sm font-medium text-gray-700 block mb-1">
                                {`${t.designer.savedTemplates.textLinesTitle} ${index + 1}`}
                              </span>
                              <input
                                type="text"
                                value={templateTextValues[line.id] ?? line.text}
                                onChange={(e) => setTemplateTextValues((prev) => ({
                                  ...prev,
                                  [line.id]: e.target.value
                                }))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-right"
                              />
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">{t.designer.savedTemplates.empty}</p>
                      )}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">{t.designer.savedTemplates.empty}</p>
            )}
          </div>

          {!templateMode && (
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center mb-6">
                    <Layers className="w-6 h-6 text-amber-500 ml-2" />
                    <h3 className="text-2xl font-bold text-gray-800">בחרו רקע</h3>
                  </div>
                  {filteredBackgrounds.length === 0 ? (
                    <div className="p-4 rounded-xl bg-gray-50 text-gray-600 text-sm text-right">
                      {language === 'he'
                        ? 'עדיין אין רקעים שהועלו. הוסיפו רקעים בלשונית הניהול כדי לבחור אותם כאן.'
                        : 'No uploaded backgrounds yet. Add backgrounds in the admin panel to select them here.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {filteredBackgrounds.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => setSelectedBackground(bg.id)}
                          className={`relative rounded-xl overflow-hidden h-32 transition-all duration-300 ${
                            selectedBackground === bg.id
                              ? 'ring-4 ring-amber-500 scale-105'
                              : 'ring-2 ring-gray-200 hover:ring-amber-300'
                          }`}
                        >
                          <div className="absolute inset-0">
                            {bg.type === 'video' && bg.videoUrl ? (
                              <video
                                className="w-full h-full object-cover"
                                src={bg.videoUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                poster={bg.previewImage}
                                style={{ opacity: 0.6 }}
                              />
                            ) : (
                              bg.images.map((image, index) => (
                                <div
                                  key={index}
                                  className="absolute inset-0 bg-cover bg-center"
                                  style={{
                                    backgroundImage: `url(${image})`,
                                    opacity: index === 0 ? 0.6 : 0.4,
                                  }}
                                />
                              ))
                            )}
                          </div>
                          {selectedBackground === bg.id && (
                            <div className="absolute inset-0 bg-black/10" />
                          )}
                          {bg.type === 'video' && (
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
                              <Video className="w-3 h-3" />
                              <span>{language === 'he' ? 'וידאו' : 'Video'}</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center mb-6">
                    <Sparkles className="w-6 h-6 text-amber-500 ml-2" />
                    <h3 className="text-2xl font-bold text-gray-800">בחרו ערכת צבעים</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredColorSchemes.map((scheme) => (
                      <button
                        key={scheme.id}
                        onClick={() => setSelectedColorScheme(scheme.id)}
                        className={`p-4 rounded-xl transition-all duration-300 text-right ${
                          selectedColorScheme === scheme.id
                            ? 'ring-4 ring-offset-2 scale-105'
                            : 'ring-2 ring-gray-200 hover:ring-gray-300'
                        }`}
                        style={{
                          backgroundColor: `${scheme.primary}15`
                        }}
                      >
                        <div className="flex gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.primary }} />
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.secondary }} />
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: scheme.accent }} />
                        </div>
                        <p className="font-bold text-sm" style={{ color: scheme.primary }}>{scheme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center mb-6">
                    <Sparkles className="w-6 h-6 text-amber-500 ml-2" />
                    <h3 className="text-2xl font-bold text-gray-800">בחרו אנימציה</h3>
                  </div>
                  <div className="space-y-3">
                    {animations.map((animation) => (
                      <button
                        key={animation.id}
                        onClick={() => handleAnimationChange(animation.id)}
                        className={`w-full text-right p-4 rounded-xl transition-all duration-300 ${
                          selectedAnimation === animation.id
                            ? 'bg-gradient-to-r from-gray-700 to-amber-500 text-white shadow-lg scale-105'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="font-bold text-lg">{animation.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <button className="w-full bg-gradient-to-r from-gray-700 to-amber-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:shadow-xl hover:scale-105 transition-all duration-300">
                    שמירה והורדה
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-gray-100 to-amber-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">תצוגה מקדימה סופית</h3>
            <div className="relative min-h-[600px] w-full flex items-center justify-center rounded-xl overflow-hidden">
              {renderBackgroundLayer(activeBackgroundOption)}
              <div
                key={animationKey}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl p-10 md:p-12 shadow-2xl text-center relative z-10 w-full max-w-5xl ${animations.find(a => a.id === selectedAnimation)?.class}`}
              >
                {templateMode ? (
                  <div className="relative w-full" style={{ minHeight: '540px' }}>
                    {selectedTemplateBackground && (
                      <div className="absolute inset-0 rounded-2xl overflow-hidden">
                        {renderBackgroundLayer(selectedTemplateBackground)}
                      </div>
                    )}
                    <div className="relative w-full h-full min-h-[500px]">
                      {renderSavedTemplateContent()}
                    </div>
                  </div>
                ) : (
                  renderInvitationContent()
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return null
}
