/* ============================================
   ARABIC TRANSLATIONS
   ============================================ */

export const ar = {
  // ---------- App ----------
  app: {
    name: "StudentHub",
    tagline: "منصة الطالب الجامعي"
  },

  // ---------- Sidebar ----------
  sidebar: {
  home: "الرئيسية",
  courses: "المواد",
  exams: "الامتحانات",
  gpa: "المعدل",
  timer: "جلسات الدراسة",
  ai: "المساعد الذكي",
  notes: "الملاحظات",
  settings: "الإعدادات",
  logout: "تسجيل خروج"
},

  // ---------- Header ----------
  header: {
    search: "ابحث...",
    notifications: "الإشعارات",
    theme: "تبديل الثيم",
    menu: "القائمة"
  },

  // ---------- Dashboard ----------
  dashboard: {
    welcomeTitle: "أهلاً بك في StudentHub 👋",
    welcomeSubtitle: "تابع مهامك وموادك الدراسية من مكان واحد",
    greeting: "مرحباً، {name} 👋",
    subtitle: "هنا نظرة عامة على يومك الدراسي",
    loading: "جار التحميل...",
    
    stats: {
      courses: "المواد",
      exams: "الامتحانات القادمة",
      gpa: "المعدل الحالي",
      tasks: "المهام",
      notes: "الملاحظات"
    },
    
    changes: {
      coursesAdded: "+1 هذا الفصل",
      nearestExam: "الأقرب بعد {days} أيام",
      gpaChange: "+0.15 عن الفصل الماضي",
      tasksLate: "{count} متأخرة",
      noCourses: "لا توجد مواد بعد",
      coursesCount: "مادة مسجلة",
      noExams: "لا توجد امتحانات قادمة",
      noGrades: "أضف علاماتك لحساب المعدل",
      noNotes: "لا توجد ملاحظات",
      pinned: "مثبتة",
      notesTotal: "ملاحظة"
    },
    
    widgets: {
      upcomingExams: "الامتحانات القادمة",
      quickNotes: "ملاحظات سريعة",
      viewAll: "عرض الكل",
      noUpcomingExams: "لا توجد امتحانات قادمة",
      noNotes: "لا توجد ملاحظات بعد"
    },
    
    exams: {
      mathFinal: "رياضيات - نهائي",
      physicsMidterm: "فيزياء - نصفي",
      programmingLab: "برمجة - عملي",
      days: "أيام",
      day: "يوم"
    },
    
    notes: {
      submitMath: "لا تنسى تسليم واجب الرياضيات",
      meetingDr: "موعد مع الدكتور سامر الساعة 10",
      today: "اليوم",
      tomorrow: "غداً"
    }
  },

  // ---------- Search ----------
  search: {
    noResults: "لا توجد نتائج",
    placeholder: "ابحث في كل شيء...",
    shortcut: "اضغط Ctrl+K للبحث السريع",
    sections: {
      courses: "المواد",
      exams: "الامتحانات",
      grades: "العلامات",
      notes: "الملاحظات"
    }
  },

  // ---------- Courses ----------
  courses: {
    title: "المواد الدراسية",
    subtitle: "إدارة كل موادك الدراسية في مكان واحد",
    addNew: "إضافة مادة",
    editTitle: "تعديل مادة",
    deleteTitle: "حذف المادة",
    deleteText: "هل أنت متأكد من حذف هذه المادة؟ لا يمكن التراجع.",
    searchPlaceholder: "ابحث عن مادة...",
    allDays: "كل الأيام",
    noResults: "لا توجد نتائج",
    noResultsText: "جرب بحث مختلف",
    emptyTitle: "لا توجد مواد بعد",
    emptyText: "ابدأ بإضافة أول مادة دراسية",
    creditsLabel: "ساعات",
    fields: {
      name: "اسم المادة",
      namePlaceholder: "مثال: رياضيات 1",
      professor: "اسم الدكتور",
      professorPlaceholder: "مثال: د. أحمد",
      credits: "عدد الساعات",
      day: "اليوم",
      time: "الوقت",
      room: "القاعة",
      roomPlaceholder: "مثال: قاعة A",
      notes: "ملاحظات",
      notesPlaceholder: "أي ملاحظات إضافية...",
      color: "اللون"
    }
  },

  // ---------- Exams ----------
  exams: {
    title: "الامتحانات",
    subtitle: "تابع كل امتحاناتك القادمة",
    addNew: "إضافة امتحان",
    editTitle: "تعديل امتحان",
    deleteTitle: "حذف الامتحان",
    deleteText: "هل أنت متأكد من حذف هذا الامتحان؟ لا يمكن التراجع.",
    searchPlaceholder: "ابحث عن امتحان...",
    allTypes: "كل الأنواع",
    noResults: "لا توجد نتائج",
    noResultsText: "جرب بحث مختلف",
    emptyTitle: "لا توجد امتحانات بعد",
    emptyText: "ابدأ بإضافة أول امتحان",
    countdown: "الوقت المتبقي",
    types: {
      midterm: "نصفي",
      final: "نهائي",
      lab: "عملي",
      oral: "شفهي"
    },
    status: {
      upcoming: "القادمة",
      past: "السابقة",
      all: "الكل"
    },
    fields: {
      name: "اسم المادة",
      namePlaceholder: "مثال: رياضيات 1",
      type: "النوع",
      room: "القاعة",
      roomPlaceholder: "مثال: قاعة A",
      date: "التاريخ",
      time: "الوقت",
      notes: "ملاحظات",
      notesPlaceholder: "أي ملاحظات إضافية..."
    }
  },

  // ---------- GPA ----------
  gpa: {
  title: "حساب المعدل",
  subtitle: "تابع معدلك التراكمي واحسب توقعك",
  addNew: "إضافة علامة",
  editTitle: "تعديل علامة",
  deleteTitle: "حذف العلامة",
  deleteText: "هل أنت متأكد من حذف هذه العلامة؟ لا يمكن التراجع.",
  searchPlaceholder: "ابحث عن مادة...",
  listView: "قائمة",
  chartView: "رسم بياني",
  chartTitle: "توزيع العلامات",
  currentGpa: "المعدل الحالي",
  cumulativeGpa: "المعدل التراكمي",
  semesterGpa: "المعدل الفصلي",
  coursesCount: "عدد المواد",
  totalCredits: "إجمالي الساعات",
  highestGrade: "أعلى علامة",
  lowestGrade: "أقل علامة",
  creditsLabel: "ساعات",
  noCredits: "بدون ساعات",
  optional: "(اختياري)",
  creditsHint: "اتركه فارغاً إذا كانت جامعتك بدون نظام ساعات",
  max: "الحد الأقصى",
  emptyTitle: "لا توجد علامات بعد",
  emptyText: "ابدأ بإضافة أول علامة لحساب معدلك",
  noResults: "لا توجد نتائج",
  noDataForChart: "لا توجد بيانات للعرض",
  whatIf: "ماذا لو؟",
  whatIfText: "اكتشف العلامات التي تحتاجها للوصول إلى معدل معين",
  targetGpa: "المعدل المستهدف",
  remainingCredits: "عدد المواد المتبقية",
  calculate: "احسب",

  clearAll: "حذف الكل",
  clearAllTitle: "حذف جميع العلامات",
  clearAllConfirmText: "للتأكيد، اكتب:",
  clearAllMessage: "هذا الإجراء لا يمكن التراجع عنه.",

  semester: {
    label: "الفصل الحالي",
    all: "الكل (التراكمي)",
    fall: "🍂 الفصل الأول",
    spring: "🌸 الفصل الثاني",
    summer: "☀️ الفصل الصيفي"
  },

  fields: {
    name: "اسم المادة",
    namePlaceholder: "مثال: رياضيات 1",
    grade: "العلامة",
    credits: "عدد الساعات",
    creditsPlaceholder: "اتركه فارغاً للنظام الحكومي",
    semester: "🎓 الفصل الدراسي"
  },

  chart: {
    donutLabel: "المعدل",
    target: "🎯 الهدف",
    diff: "📈 الفرق",
    excellent: "ممتاز (90+)",
    good: "جيد (80-89)",
    average: "متوسط (70-79)",
    weak: "ضعيف (<70)",
    topTitle: "أعلى المواد",
    bottomTitle: "تحتاج تحسين"
  },
  comparison: {
  title: "تطور المعدل عبر الفصول"
},
},
  // ---------- Notes ----------
  notes: {
    title: "الملاحظات",
    subtitle: "احفظ أفكارك وملاحظاتك في مكان واحد",
    addNew: "إضافة ملاحظة",
    editTitle: "تعديل ملاحظة",
    deleteTitle: "حذف الملاحظة",
    deleteText: "هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع.",
    searchPlaceholder: "ابحث في الملاحظات...",
    allNotes: "كل الملاحظات",
    pinnedOnly: "المثبتة فقط",
    pin: "تثبيت",
    noResults: "لا توجد نتائج",
    noResultsText: "جرب بحث مختلف",
    emptyTitle: "لا توجد ملاحظات بعد",
    emptyText: "ابدأ بإضافة أول ملاحظة",
    fields: {
      title: "العنوان",
      titlePlaceholder: "عنوان الملاحظة",
      content: "المحتوى",
      contentPlaceholder: "اكتب ملاحظتك هنا...",
      course: "المادة (اختياري)",
      noCourse: "بدون مادة",
      tags: "الوسوم (اختياري)",
      tagsPlaceholder: "مثال: مهم, مراجعة",
      color: "اللون",
      pin: "تثبيت"
    }
  },

  // ---------- Settings ----------
  settings: {
    title: "الإعدادات",
    subtitle: "خصص تجربتك في StudentHub",
    
    profile: {
      title: "الملف الشخصي",
      name: "الاسم",
      university: "الجامعة",
      major: "الاختصاص",
      year: "السنة الدراسية",
      avatar: "الصورة الشخصية",
      changePhoto: "تغيير الصورة",
      removePhoto: "حذف الصورة",
      photoUploaded: "✅ تم تحديث الصورة",
      photoRemoved: "✅ تم حذف الصورة",
      invalidImage: "❌ الملف غير صالح"
    },
    
    language: {
      title: "اللغة",
      arabic: "العربية",
      english: "الإنجليزية"
    },
    
    appearance: {
      title: "المظهر",
      theme: "الثيم",
      light: "فاتح",
      dark: "داكن",
      auto: "تلقائي",
      primaryColor: "اللون الأساسي",
      fontSize: "حجم الخط",
      small: "صغير",
      medium: "متوسط",
      large: "كبير"
    },
    
    academic: {
      title: "إعدادات أكاديمية",
      gpaSystem: "نظام المعدل",
      gpa100: "من 100 (حكومي)",
      gpa4: "من 4 (خاص)",
      currentSemester: "الفصل الحالي",
      studyHours: "ساعات الدراسة المستهدفة يومياً"
    },
    
    notifications: {
      title: "الإشعارات",
      examNotifications: "إشعارات الامتحانات",
      taskNotifications: "إشعارات المهام",
      reminderBefore: "تذكير قبل الامتحان بـ",
      oneDay: "يوم",
      threeDays: "3 أيام",
      oneWeek: "أسبوع",
      enable: "تفعيل الإشعارات",
      test: "إرسال إشعار تجريبي",
      enabled: "✅ تم تفعيل الإشعارات",
      denied: "❌ تم رفض الإشعارات",
      unsupported: "⚠️ الإشعارات غير مدعومة",
      testSent: "✅ تم إرسال الإشعار",
      testFailed: "❌ فشل إرسال الإشعار"
    },
    
    calendar: {
      title: "إعدادات التقويم",
      weekStart: "بداية الأسبوع",
      saturday: "السبت",
      sunday: "الأحد",
      showHolidays: "إظهار العطل الرسمية"
    },
    
    data: {
      title: "البيانات",
      export: "تصدير البيانات",
      import: "استيراد البيانات",
      delete: "حذف جميع البيانات",
      deleteDialogTitle: "حذف جميع البيانات",
      deleteDialogText: "هذا الإجراء لا يمكن التراجع عنه. كل بياناتك راح تروح للأبد.",
      deleteDialogConfirmText: "للتأكيد، اكتب:",
      deleteSuccess: "✅ تم حذف جميع البيانات",
      exportSuccess: "✅ تم تصدير البيانات",
      importSuccess: "✅ تم استيراد البيانات",
      importError: "❌ ملف غير صالح",
      importDialogTitle: "استيراد البيانات",
      importDialogText: "سيتم استبدال بياناتك الحالية بالبيانات الجديدة. هل أنت متأكد؟",
      importConfirm: "استيراد"
    },
    
    about: {
      title: "عن التطبيق",
      version: "الإصدار",
      madeWith: "صنع بـ ❤️ في سوريا",
      tagline: "تم تطوير StudentHub بهدف تبسيط الحياة الجامعية وجمع الأدوات والخدمات التي يحتاجها الطالب في مكان واحد.",
      developer: "تطوير",
      developerName: "علي الفوزو",
      developerRole: "Frontend Developer",
      linkedinName: "Ali Alfozo"
    },
    
    save: "حفظ التغييرات",
    saved: "تم الحفظ بنجاح",
    cancel: "إلغاء",
    unsavedChanges: "لديك تغييرات غير محفوظة",
    discard: "تجاهل",
    saveAll: "حفظ الكل"
  },

  // ---------- Timer ----------
  timer: {
    title: "جلسات الدراسة",
  subtitle: "نظّم وقتك باستخدام تقنية Pomodoro",
    start: "ابدأ",
    pause: "إيقاف",
    resume: "استئناف",
    reset: "إعادة",
    minutes: "د",
    modes: {
      study: "دراسة",
      deep: "دراسة عميقة",
      review: "مراجعة سريعة",
      break: "راحة"
    },
    session: {
      study: "جلسة دراسة",
      deep: "دراسة عميقة",
      review: "مراجعة سريعة",
      break: "جلسة راحة"
    },
    settings: {
      title: "اضبط المدة"
    },
    stats: {
      totalMinutes: "إجمالي الدقائق",
      sessionsToday: "جلسات اليوم",
      streak: "أيام متتالية"
    },
    sessions: {
      title: "آخر الجلسات",
      clear: "مسح الكل",
      empty: "لا توجد جلسات بعد",
      confirmClear: "هل أنت متأكد من مسح جميع الجلسات؟"
    },
    notification: {
      title: "🎉 انتهت الجلسة!",
      body: "أحسنت! خذ راحة قصيرة."
    }
  },
// ---------- AI Assistant ----------
// ---------- AI Assistant ----------
ai: {
  title: "المساعد الذكي",
  subtitle: "اسألني أي شيء عن دراستك",
  clearChat: "محادثة جديدة",
  inputPlaceholder: "اكتب سؤالك هنا...",
  inputHint: "💡 نصيحة: كن محدداً في سؤالك للحصول على إجابة أفضل",
  vpnNotice: {
    title: "للحصول على ردود من المساعد",
    text: "تأكد من تشغيل VPN قبل إرسال سؤالك"
  },
  welcome: {
    title: "مرحباً! كيف أساعدك اليوم؟",
    text: "أنا مساعدك الدراسي. اسألني عن تنظيم الوقت، طرق المراجعة، أو أي شيء يساعدك على التفوق."
  },
  suggestions: {
    timeManagement: "كيف أنظم وقتي قبل الامتحان؟",
    studyPlan: "أعطني خطة دراسة لمادة البرمجة خلال أسبوع",
    raiseGpa: "كيف أرفع معدلي؟",
    procrastination: "كيف أتجنب التسويف؟"
  },
  analyze: {
    title: "تحليل وضعي الدراسي",
    desc: "احصل على نصائح مخصصة بناءً على بياناتك"
  }
},
  // ---------- Common ----------
  common: {
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    confirm: "تأكيد",
    close: "إغلاق",
    search: "بحث",
    filter: "تصفية",
    loading: "جار التحميل...",
    error: "حدث خطأ",
    success: "تم بنجاح",
    empty: "لا توجد بيانات",
    yes: "نعم",
    no: "لا"
  },

  // ---------- Days ----------
  days: {
    sunday: "الأحد",
    monday: "الاثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت"
  },

  // ---------- Months ----------
  months: {
    january: "يناير",
    february: "فبراير",
    march: "مارس",
    april: "أبريل",
    may: "مايو",
    june: "يونيو",
    july: "يوليو",
    august: "أغسطس",
    september: "سبتمبر",
    october: "أكتوبر",
    november: "نوفمبر",
    december: "ديسمبر"
  }
};
