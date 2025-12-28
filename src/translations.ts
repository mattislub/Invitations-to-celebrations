export type Language = 'he' | 'en'

export interface Translations {
  header: {
    title: string
    home: string
    gallery: string
    pricing: string
    contact: string
    admin: string
    startNow: string
  }
  footer: {
    subtitle: string
    quickLinks: string
    contactUs: string
    rights: string
  }
  home: {
    hero: {
      title: string
      subtitle: string
      cta: string
    }
    features: {
      title: string
      items: {
        title: string
        description: string
      }[]
    }
    howItWorks: {
      title: string
      steps: {
        title: string
        description: string
      }[]
    }
  }
  gallery: {
    title: string
    subtitle: string
    realInvitation: string
    categories: {
      all: string
      wedding: string
      barMitzvah: string
      batMitzvah: string
      birthday: string
      engagement: string
      thankYou: string
    }
  }
  designer: {
    title: string
    subtitle: string
    steps: {
      eventType: string
      designStyle: string
      background: string
      details: string
      colors: string
      animation: string
    }
    eventTypes: {
      wedding: string
      barMitzvah: string
      batMitzvah: string
      birthday: string
      engagement: string
    }
    designStyles: {
      modern: string
      religious: string
      classic: string
    }
    backgrounds: {
      title: string
    }
    form: {
      groomName: string
      brideName: string
      boyName: string
      girlName: string
      personName: string
      groomParents: string
      brideParents: string
      parentsNames: string
      hebrewDate: string
      gregorianDate: string
      date: string
      venue: string
      time: string
      age: string
      eventTitle: string
      hosts: string
    }
    colors: {
      title: string
      schemes: {
        gold: string
        blue: string
        rose: string
        sage: string
        lavender: string
        coral: string
      }
    }
    animation: {
      title: string
      types: {
        fade: string
        slide: string
        zoom: string
        bounce: string
      }
    }
    preview: {
      title: string
      download: string
    }
    phrases: {
      wedding: {
        modern: string
        religious: string
      }
      barMitzvah: {
        modern: string
        religious: string
      }
      batMitzvah: {
        modern: string
        religious: string
      }
      birthday: string
      engagement: {
        modern: string
        religious: string
      }
    }
    blessings: {
      wedding: string
      barMitzvah: string
      batMitzvah: string
      engagement: string
    }
  }
  admin: {
    title: string
    subtitle: string
    stats: {
      invitations: string
      styles: string
      fonts: string
      backgrounds: string
      videoBackgrounds: string
      dimensions: string
    }
    server: {
      title: string
      syncing: string
      synced: string
      error: string
      disabled: string
    }
    sections: {
      invitationTypes: {
        title: string
        description: string
      }
      styles: {
        title: string
        description: string
      }
      galleryInvitations: {
        title: string
        description: string
      }
      fonts: {
        title: string
        description: string
      }
      backgrounds: {
        title: string
        description: string
      }
      videoBackgrounds: {
        title: string
        description: string
      }
      dimensions: {
        title: string
        description: string
      }
    }
    fields: {
      name: string
      description: string
      url: string
      preview: string
      file: string
      width: string
      height: string
      unit: string
      yiddishName: string
      englishName: string
      imageUrl: string
      hosts: string
      eventDate: string
      videoUrl: string
    }
    buttons: {
      add: string
      save: string
      reset: string
      delete: string
    }
    messages: {
      empty: string
      saved: string
      uploading: string
      uploadError: string
    }
  }
  templateEditor: {
    title: string
    subtitle: string
    textBoxes: string
    instructions: string
    background: string
    addTextBox: string
    backgroundUrl: string
    preview: string
    selectionHint: string
    clickToPlace: string
    dimensions: {
      title: string
      width: string
      height: string
      unit: string
    }
    placeholders: {
      text: string
    }
    typography: {
      font: string
      fontSize: string
    }
    position: {
      x: string
      y: string
    }
  }
}

export const translations: Record<Language, Translations> = {
  he: {
    header: {
      title: 'הזמנות מעוצבות',
      home: 'דף הבית',
      gallery: 'גלריה',
      pricing: 'תמחור',
      contact: 'צור קשר',
      admin: 'ניהול',
      startNow: 'התחל עכשיו'
    },
    footer: {
      subtitle: 'יוצרים הזמנות ייחודיות שמספרות את הסיפור שלכם',
      quickLinks: 'קישורים מהירים',
      contactUs: 'צור קשר',
      rights: 'כל הזכויות שמורות © 2025 הזמנות מעוצבות'
    },
    home: {
      hero: {
        title: 'צרו הזמנות מעוצבות לאירועים שלכם',
        subtitle: 'עיצובים ייחודיים ומותאמים אישית לחתונות, בר/בת מצווה, ימי הולדת ועוד',
        cta: 'התחילו לעצב'
      },
      features: {
        title: 'למה לבחור בנו?',
        items: [
          {
            title: 'עיצוב מותאם אישית',
            description: 'בחרו מתוך מגוון תבניות ותאימו לסגנון שלכם'
          },
          {
            title: 'קל לשימוש',
            description: 'ממשק פשוט ואינטואיטיבי שמאפשר ליצור הזמנות תוך דקות'
          },
          {
            title: 'איכות מקצועית',
            description: 'עיצובים ברמה גבוהה המותאמים להדפסה ושיתוף דיגיטלי'
          }
        ]
      },
      howItWorks: {
        title: 'איך זה עובד?',
        steps: [
          {
            title: 'בחרו סוג אירוע',
            description: 'חתונה, בר/בת מצווה, יום הולדת או אירוסין'
          },
          {
            title: 'התאימו עיצוב',
            description: 'בחרו צבעים, רקעים ואנימציות'
          },
          {
            title: 'הורידו והדפיסו',
            description: 'שמרו את ההזמנה ושתפו או הדפיסו'
          }
        ]
      }
    },
    gallery: {
      title: 'גלריית הזמנות אמיתיות',
      subtitle: 'השראה ודוגמאות להזמנות אמיתיות שעוצבו במערכת שלנו',
      realInvitation: 'הזמנה אמיתית',
      categories: {
        all: 'הכל',
        wedding: 'חתונות',
        barMitzvah: 'בר מצווה',
        batMitzvah: 'בת מצווה',
        birthday: 'ימי הולדת',
        engagement: 'אירוסין',
        thankYou: 'כרטיסי תודה'
      }
    },
    designer: {
      title: 'מעצב הזמנות',
      subtitle: 'צרו את ההזמנה המושלמת בכמה צעדים פשוטים',
      steps: {
        eventType: 'סוג אירוע',
        designStyle: 'סגנון עיצוב',
        background: 'בחרו רקע',
        details: 'מלאו פרטים',
        colors: 'בחרו צבעים',
        animation: 'הוסיפו אנימציה'
      },
      eventTypes: {
        wedding: 'חתונה',
        barMitzvah: 'בר מצווה',
        batMitzvah: 'בת מצווה',
        birthday: 'יום הולדת',
        engagement: 'אירוסין'
      },
      designStyles: {
        modern: 'מודרני',
        religious: 'דתי',
        classic: 'קלאסי'
      },
      backgrounds: {
        title: 'בחרו רקע'
      },
      form: {
        groomName: 'שם החתן',
        brideName: 'שם הכלה',
        boyName: 'שם הבר מצווה',
        girlName: 'שם הבת מצווה',
        personName: 'שם החוגג/ת',
        groomParents: 'שמות הורי החתן',
        brideParents: 'שמות הורי הכלה',
        parentsNames: 'שמות ההורים',
        hebrewDate: 'תאריך עברי',
        gregorianDate: 'תאריך לועזי',
        date: 'תאריך',
        venue: 'מקום',
        time: 'שעה',
        age: 'גיל',
        eventTitle: 'שם האירוע',
        hosts: 'מארחים'
      },
      colors: {
        title: 'בחרו ערכת צבעים',
        schemes: {
          gold: 'זהב',
          blue: 'כחול',
          rose: 'ורוד',
          sage: 'ירוק',
          lavender: 'לבנדר',
          coral: 'אלמוגים'
        }
      },
      animation: {
        title: 'בחרו אנימציה',
        types: {
          fade: 'דהייה',
          slide: 'החלקה',
          zoom: 'זום',
          bounce: 'קפיצה'
        }
      },
      preview: {
        title: 'תצוגה מקדימה',
        download: 'הורד הזמנה'
      },
      phrases: {
        wedding: {
          modern: 'מתחתנים!',
          religious: 'בשמחה ובגיל לב אנו מזמינים אתכם לחגוג עמנו'
        },
        barMitzvah: {
          modern: 'בר מצווה',
          religious: 'בשמחה ובגיל לב אנו מזמינים אתכם לחגוג עמנו'
        },
        batMitzvah: {
          modern: 'בת מצווה',
          religious: 'בשמחה ובגיל לב אנו מזמינים אתכם לחגוג עמנו'
        },
        birthday: 'יום הולדת',
        engagement: {
          modern: 'מתארסים!',
          religious: 'בשמחה ובגיל לב אנו מזמינים אתכם לחגוג עמנו'
        }
      },
      blessings: {
        wedding: 'בס"ד',
        barMitzvah: 'בס"ד',
        batMitzvah: 'בס"ד',
        engagement: 'בס"ד'
      }
    },
    admin: {
      title: 'מרכז ניהול',
      subtitle: 'דף ייעודי לניהול סגנונות, פונטים ורקעים במערכת',
      stats: {
        invitations: 'הזמנות בגלריה',
        styles: 'סגנונות רשומים',
        fonts: 'פונטים זמינים',
        backgrounds: 'רקעים פעילים',
        videoBackgrounds: 'רקעי וידאו',
        dimensions: 'תצורת מידה'
      },
      server: {
        title: 'סנכרון לשרת',
        syncing: 'שומר נתונים לשרת...',
        synced: 'הנתונים מסונכרנים מול השרת.',
        error: 'לא ניתן לסנכרן מול השרת, השינויים נשמרים מקומית עד לרענון.',
        disabled: 'לא הוגדר חיבור לשרת, השינויים נשמרים רק בזמן העבודה.'
      },
      sections: {
        invitationTypes: {
          title: 'ניהול סוגי הזמנות',
          description: 'הוסיפו שמות סוגים בעברית, יידיש ואנגלית כדי להשתמש בהם בעורך.'
        },
        styles: {
          title: 'הוספת סגנונות עיצוב',
          description: 'נהלו קטלוג של סגנונות עיצוב והוסיפו כותרות ותיאורים חדשים.'
        },
        galleryInvitations: {
          title: 'הוספת הזמנות אמיתיות לגלריה',
          description: 'הזינו הזמנות אמיתיות עם תמונות, בעלי שמחה ותאריך כדי להציג אותן ללקוחות.'
        },
        fonts: {
          title: 'הוספת פונטים',
          description: 'העלו קבצי פונטים חדשים כדי להשתמש בהם בעיצובים, ללא קישורים חיצוניים.'
        },
        backgrounds: {
          title: 'ניהול רקעים',
          description: 'העלו קבצי רקע חדשים במקום להשתמש בקישורים חיצוניים.'
        },
        videoBackgrounds: {
          title: 'וידאו כרקע',
          description: 'העלו קובצי וידאו כרקע כך שכל המדיה תהיה מאוחסנת בקבצים.'
        },
        dimensions: {
          title: 'הגדרות גודל',
          description: 'קבעו רוחב ואורך ברירת מחדל להזמנות שלכם.'
        }
      },
      fields: {
        name: 'שם',
        description: 'תיאור',
        url: 'קובץ שהועלה',
        preview: 'תצוגה מקדימה שהועלתה',
        file: 'קובץ להעלאה',
        width: 'רוחב',
        height: 'גובה',
        unit: 'יחידת מידה',
        yiddishName: 'שם ביידיש',
        englishName: 'שם באנגלית',
        imageUrl: 'תמונת אירוע שהועלתה',
        hosts: 'מארחים',
        eventDate: 'תאריך אירוע',
        videoUrl: 'וידאו שהועלה'
      },
      buttons: {
        add: 'הוספה',
        save: 'שמירה',
        reset: 'איפוס',
        delete: 'מחיקה'
      },
      messages: {
        empty: 'אין פריטים להצגה כרגע',
        saved: 'ההגדרות נשמרו',
        uploading: 'מעלה קובץ...',
        uploadError: 'העלאה נכשלה, נסו שוב'
      }
    },
    templateEditor: {
      title: 'עורך תבנית הזמנה',
      subtitle: 'מקמו תיבות טקסט חופשיות על גבי התבנית',
      textBoxes: 'תיבת טקסט',
      instructions: 'לחצו על התצוגה המקדימה כדי למקם תיבת טקסט בכל מקום',
      background: 'רקע',
      addTextBox: 'הוספת תיבת טקסט',
      backgroundUrl: 'קישור לרקע',
      preview: 'תצוגה מקדימה',
      selectionHint: 'בחרו תיבה ולחצו בתצוגה כדי למקם אותה',
      clickToPlace: 'לחצו בתצוגה כדי להציב את התיבה הנבחרת',
      dimensions: {
        title: 'מידות התבנית',
        width: 'רוחב',
        height: 'גובה',
        unit: 'פיקסלים'
      },
      placeholders: {
        text: 'הקלידו טקסט להזמנה'
      },
      typography: {
        font: 'פונט',
        fontSize: 'גודל פונט'
      },
      position: {
        x: 'מיקום אופקי',
        y: 'מיקום אנכי'
      }
    }
  },
  en: {
    header: {
      title: 'Designed Invitations',
      home: 'Home',
      gallery: 'Gallery',
      pricing: 'Pricing',
      contact: 'Contact',
      admin: 'Admin',
      startNow: 'Start Now'
    },
    footer: {
      subtitle: 'Creating unique invitations that tell your story',
      quickLinks: 'Quick Links',
      contactUs: 'Contact Us',
      rights: 'All rights reserved © 2025 Designed Invitations'
    },
    home: {
      hero: {
        title: 'Create Designed Invitations for Your Events',
        subtitle: 'Unique and personalized designs for weddings, bar/bat mitzvahs, birthdays, and more',
        cta: 'Start Designing'
      },
      features: {
        title: 'Why Choose Us?',
        items: [
          {
            title: 'Personalized Design',
            description: 'Choose from various templates and match your style'
          },
          {
            title: 'Easy to Use',
            description: 'Simple and intuitive interface to create invitations in minutes'
          },
          {
            title: 'Professional Quality',
            description: 'High-quality designs suitable for printing and digital sharing'
          }
        ]
      },
      howItWorks: {
        title: 'How It Works?',
        steps: [
          {
            title: 'Choose Event Type',
            description: 'Wedding, bar/bat mitzvah, birthday or engagement'
          },
          {
            title: 'Customize Design',
            description: 'Select colors, backgrounds, and animations'
          },
          {
            title: 'Download and Print',
            description: 'Save your invitation and share or print it'
          }
        ]
      }
    },
    gallery: {
      title: 'Real Invitation Gallery',
      subtitle: 'Inspiration and examples from real invitations designed in our system',
      realInvitation: 'Real invitation',
      categories: {
        all: 'All',
        wedding: 'Weddings',
        barMitzvah: 'Bar Mitzvah',
        batMitzvah: 'Bat Mitzvah',
        birthday: 'Birthdays',
        engagement: 'Engagements',
        thankYou: 'Thank You Cards'
      }
    },
    designer: {
      title: 'Invitation Designer',
      subtitle: 'Create your perfect invitation in a few simple steps',
      steps: {
        eventType: 'Event Type',
        designStyle: 'Design Style',
        background: 'Choose Background',
        details: 'Fill Details',
        colors: 'Choose Colors',
        animation: 'Add Animation'
      },
      eventTypes: {
        wedding: 'Wedding',
        barMitzvah: 'Bar Mitzvah',
        batMitzvah: 'Bat Mitzvah',
        birthday: 'Birthday',
        engagement: 'Engagement'
      },
      designStyles: {
        modern: 'Modern',
        religious: 'Religious',
        classic: 'Classic'
      },
      backgrounds: {
        title: 'Choose Background'
      },
      form: {
        groomName: "Groom's Name",
        brideName: "Bride's Name",
        boyName: "Bar Mitzvah's Name",
        girlName: "Bat Mitzvah's Name",
        personName: "Celebrant's Name",
        groomParents: "Groom's Parents",
        brideParents: "Bride's Parents",
        parentsNames: "Parents' Names",
        hebrewDate: 'Hebrew Date',
        gregorianDate: 'Date',
        date: 'Date',
        venue: 'Venue',
        time: 'Time',
        age: 'Age',
        eventTitle: 'Event Name',
        hosts: 'Hosts'
      },
      colors: {
        title: 'Choose Color Scheme',
        schemes: {
          gold: 'Gold',
          blue: 'Blue',
          rose: 'Rose',
          sage: 'Sage',
          lavender: 'Lavender',
          coral: 'Coral'
        }
      },
      animation: {
        title: 'Choose Animation',
        types: {
          fade: 'Fade',
          slide: 'Slide',
          zoom: 'Zoom',
          bounce: 'Bounce'
        }
      },
      preview: {
        title: 'Preview',
        download: 'Download Invitation'
      },
      phrases: {
        wedding: {
          modern: 'Getting Married!',
          religious: 'With joy and happiness we invite you to celebrate with us'
        },
        barMitzvah: {
          modern: 'Bar Mitzvah',
          religious: 'With joy and happiness we invite you to celebrate with us'
        },
        batMitzvah: {
          modern: 'Bat Mitzvah',
          religious: 'With joy and happiness we invite you to celebrate with us'
        },
        birthday: 'Birthday',
        engagement: {
          modern: 'Getting Engaged!',
          religious: 'With joy and happiness we invite you to celebrate with us'
        }
      },
      blessings: {
        wedding: "B'H",
        barMitzvah: "B'H",
        batMitzvah: "B'H",
        engagement: "B'H"
      }
    },
    admin: {
      title: 'Admin Console',
      subtitle: 'Dedicated workspace for managing design styles, fonts, and backgrounds',
      stats: {
        invitations: 'Gallery Invitations',
        styles: 'Design Styles',
        fonts: 'Available Fonts',
        backgrounds: 'Active Backgrounds',
        videoBackgrounds: 'Video Backgrounds',
        dimensions: 'Dimension Preset'
      },
      server: {
        title: 'Server Sync',
        syncing: 'Saving data to the server...',
        synced: 'Data is synchronized with the server.',
        error: 'Could not sync with the server, keeping session-only changes.',
        disabled: 'No server connection configured; changes persist only during this session.'
      },
      sections: {
        invitationTypes: {
          title: 'Invitation Types',
          description: 'Add invitation type names in Hebrew, Yiddish, and English for the designer.'
        },
        styles: {
          title: 'Add Design Styles',
          description: 'Maintain your catalog of styles with titles and descriptions.'
        },
        galleryInvitations: {
          title: 'Add Real Invitations to Gallery',
          description: 'Enter real invitations with images, hosts, and event dates to showcase to visitors.'
        },
        fonts: {
          title: 'Add Fonts',
          description: 'Upload new font files to use in designs instead of external links.'
        },
        backgrounds: {
          title: 'Manage Backgrounds',
          description: 'Upload new background files instead of relying on external links.'
        },
        videoBackgrounds: {
          title: 'Video Backgrounds',
          description: 'Upload video files that can be used behind invitation designs.'
        },
        dimensions: {
          title: 'Size Settings',
          description: 'Define default invitation width and height for downloads.'
        }
      },
      fields: {
        name: 'Name',
        description: 'Description',
        url: 'Uploaded file URL',
        preview: 'Uploaded preview',
        file: 'File to upload',
        width: 'Width',
        height: 'Height',
        unit: 'Unit',
        yiddishName: 'Yiddish Name',
        englishName: 'English Name',
        imageUrl: 'Uploaded image',
        hosts: 'Hosts',
        eventDate: 'Event Date',
        videoUrl: 'Uploaded video'
      },
      buttons: {
        add: 'Add',
        save: 'Save',
        reset: 'Reset',
        delete: 'Delete'
      },
      messages: {
        empty: 'No items to display yet',
        saved: 'Settings saved',
        uploading: 'Uploading file...',
        uploadError: 'Upload failed, please try again.'
      }
    },
    templateEditor: {
      title: 'Invitation Template Editor',
      subtitle: 'Place free-floating text boxes anywhere on your template',
      textBoxes: 'Text Box',
      instructions: 'Click the preview to position any text box exactly where you want it',
      background: 'Background',
      addTextBox: 'Add Text Box',
      backgroundUrl: 'Background URL',
      preview: 'Preview',
      selectionHint: 'Select a box, then click the preview to place it',
      clickToPlace: 'Click the preview to place the selected box',
      dimensions: {
        title: 'Template Size',
        width: 'Width',
        height: 'Height',
        unit: 'pixels'
      },
      placeholders: {
        text: 'Enter invitation text'
      },
      typography: {
        font: 'Font',
        fontSize: 'Font Size'
      },
      position: {
        x: 'Horizontal Position',
        y: 'Vertical Position'
      }
    }
  }
}

export function getTranslation(lang: Language): Translations {
  return translations[lang]
}
