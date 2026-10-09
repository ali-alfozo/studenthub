/* ============================================
   ENGLISH TRANSLATIONS
   ============================================ */

export const en = {
  // ---------- App ----------
  app: {
    name: "StudentHub",
    tagline: "University Student Platform"
  },

  // ---------- Sidebar ----------
  sidebar: {
  home: "Home",
  courses: "Courses",
  exams: "Exams",
  gpa: "GPA",
  timer: "Study Sessions",
  ai: "AI Assistant",
  notes: "Notes",
  settings: "Settings",
  logout: "Logout"
},

  // ---------- Header ----------
  header: {
    search: "Search...",
    notifications: "Notifications",
    theme: "Toggle Theme",
    menu: "Menu"
  },

  // ---------- Dashboard ----------
  dashboard: {
    welcomeTitle: "Welcome to StudentHub 👋",
    welcomeSubtitle: "Track your tasks and courses from one place",
    greeting: "Welcome, {name} 👋",
    subtitle: "Here's an overview of your study day",
    loading: "Loading...",
    
    stats: {
      courses: "Courses",
      exams: "Upcoming Exams",
      gpa: "Current GPA",
      tasks: "Tasks",
      notes: "Notes"
    },
    
    changes: {
      coursesAdded: "+1 this semester",
      nearestExam: "Nearest in {days} days",
      gpaChange: "+0.15 from last semester",
      tasksLate: "{count} late",
      noCourses: "No courses yet",
      coursesCount: "courses registered",
      noExams: "No upcoming exams",
      noGrades: "Add grades to calculate GPA",
      noNotes: "No notes yet",
      pinned: "pinned",
      notesTotal: "note"
    },
    
    widgets: {
      upcomingExams: "Upcoming Exams",
      quickNotes: "Quick Notes",
      viewAll: "View All",
      noUpcomingExams: "No upcoming exams",
      noNotes: "No notes yet"
    },
    
    exams: {
      mathFinal: "Math - Final",
      physicsMidterm: "Physics - Midterm",
      programmingLab: "Programming - Lab",
      days: "days",
      day: "day"
    },
    
    notes: {
      submitMath: "Don't forget to submit Math assignment",
      meetingDr: "Meeting with Dr. Samer at 10",
      today: "Today",
      tomorrow: "Tomorrow"
    }
  },

  // ---------- Search ----------
  search: {
    noResults: "No results found",
    placeholder: "Search everything...",
    shortcut: "Press Ctrl+K for quick search",
    sections: {
      courses: "Courses",
      exams: "Exams",
      grades: "Grades",
      notes: "Notes"
    }
  },

  // ---------- Courses ----------
  courses: {
    title: "Courses",
    subtitle: "Manage all your courses in one place",
    addNew: "Add Course",
    editTitle: "Edit Course",
    deleteTitle: "Delete Course",
    deleteText: "Are you sure you want to delete this course? This cannot be undone.",
    searchPlaceholder: "Search for a course...",
    allDays: "All Days",
    noResults: "No results found",
    noResultsText: "Try a different search",
    emptyTitle: "No courses yet",
    emptyText: "Start by adding your first course",
    creditsLabel: "credits",
    fields: {
      name: "Course Name",
      namePlaceholder: "Example: Math 1",
      professor: "Professor Name",
      professorPlaceholder: "Example: Dr. Ahmed",
      credits: "Credits",
      day: "Day",
      time: "Time",
      room: "Room",
      roomPlaceholder: "Example: Room A",
      notes: "Notes",
      notesPlaceholder: "Any additional notes...",
      color: "Color"
    }
  },

  // ---------- Exams ----------
  exams: {
    title: "Exams",
    subtitle: "Track all your upcoming exams",
    addNew: "Add Exam",
    editTitle: "Edit Exam",
    deleteTitle: "Delete Exam",
    deleteText: "Are you sure you want to delete this exam? This cannot be undone.",
    searchPlaceholder: "Search for an exam...",
    allTypes: "All Types",
    noResults: "No results found",
    noResultsText: "Try a different search",
    emptyTitle: "No exams yet",
    emptyText: "Start by adding your first exam",
    countdown: "Time Remaining",
    types: {
      midterm: "Midterm",
      final: "Final",
      lab: "Lab",
      oral: "Oral"
    },
    status: {
      upcoming: "Upcoming",
      past: "Past",
      all: "All"
    },
    fields: {
      name: "Course Name",
      namePlaceholder: "Example: Math 1",
      type: "Type",
      room: "Room",
      roomPlaceholder: "Example: Room A",
      date: "Date",
      time: "Time",
      notes: "Notes",
      notesPlaceholder: "Any additional notes..."
    }
  },

  // ---------- GPA ----------
  gpa: {
  title: "GPA Calculator",
  subtitle: "Track your GPA and calculate your target",
  addNew: "Add Grade",
  editTitle: "Edit Grade",
  deleteTitle: "Delete Grade",
  deleteText: "Are you sure you want to delete this grade? This cannot be undone.",
  searchPlaceholder: "Search for a course...",
  listView: "List",
  chartView: "Chart",
  chartTitle: "Grades Distribution",
  currentGpa: "Current GPA",
  cumulativeGpa: "Cumulative GPA",
  semesterGpa: "Semester GPA",
  coursesCount: "Courses",
  totalCredits: "Total Credits",
  highestGrade: "Highest Grade",
  lowestGrade: "Lowest Grade",
  creditsLabel: "credits",
  noCredits: "No credits",
  optional: "(optional)",
  creditsHint: "Leave empty if your university has no credit system",
  max: "Max",
  emptyTitle: "No grades yet",
  emptyText: "Start by adding your first grade to calculate your GPA",
  noResults: "No results found",
  noDataForChart: "No data to display",
  whatIf: "What If?",
  whatIfText: "Discover the grades you need to reach a specific GPA",
  targetGpa: "Target GPA",
  remainingCredits: "Remaining Courses",
  calculate: "Calculate",

  clearAll: "Clear All",
  clearAllTitle: "Delete All Grades",
  clearAllConfirmText: "To confirm, type:",
  clearAllMessage: "This action cannot be undone.",

  semester: {
    label: "Current Semester",
    all: "All (Cumulative)",
    fall: "🍂 Fall Semester",
    spring: "🌸 Spring Semester",
    summer: "☀️ Summer Semester"
  },

  fields: {
    name: "Course Name",
    namePlaceholder: "Example: Math 1",
    grade: "Grade",
    credits: "Credits",
    creditsPlaceholder: "Leave empty for public universities",
    semester: "🎓 Semester"
  },

  chart: {
    donutLabel: "GPA",
    target: "🎯 Target",
    diff: "📈 Diff",
    excellent: "Excellent (90+)",
    good: "Good (80-89)",
    average: "Average (70-79)",
    weak: "Weak (<70)",
    topTitle: "Top Courses",
    bottomTitle: "Needs Improvement"
  },comparison: {
  title: "GPA Progress Over Semesters"
},
},

  // ---------- Settings ----------
  settings: {
    title: "Settings",
    subtitle: "Customize your StudentHub experience",
    
    profile: {
      title: "Profile",
      name: "Name",
      university: "University",
      major: "Major",
      year: "Academic Year",
      avatar: "Profile Picture",
      changePhoto: "Change Photo",
      removePhoto: "Remove Photo",
      photoUploaded: "✅ Photo updated",
      photoRemoved: "✅ Photo removed",
      invalidImage: "❌ Invalid image"
    },
    
    language: {
      title: "Language",
      arabic: "Arabic",
      english: "English"
    },
    
    appearance: {
      title: "Appearance",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      auto: "Auto",
      primaryColor: "Primary Color",
      fontSize: "Font Size",
      small: "Small",
      medium: "Medium",
      large: "Large"
    },
    
    academic: {
      title: "Academic Settings",
      gpaSystem: "GPA System",
      gpa100: "Out of 100 (Public)",
      gpa4: "Out of 4 (Private)",
      currentSemester: "Current Semester",
      studyHours: "Daily Study Hours Target"
    },
    
    notifications: {
      title: "Notifications",
      examNotifications: "Exam Notifications",
      taskNotifications: "Task Notifications",
      reminderBefore: "Remind Before Exam",
      oneDay: "1 day",
      threeDays: "3 days",
      oneWeek: "1 week",
      enable: "Enable Notifications",
      test: "Send Test Notification",
      enabled: "✅ Notifications enabled",
      denied: "❌ Notifications denied",
      unsupported: "⚠️ Notifications not supported",
      testSent: "✅ Notification sent",
      testFailed: "❌ Failed to send notification"
    },
    
    calendar: {
      title: "Calendar Settings",
      weekStart: "Week Starts On",
      saturday: "Saturday",
      sunday: "Sunday",
      showHolidays: "Show Official Holidays"
    },
    
    data: {
      title: "Data",
      export: "Export Data",
      import: "Import Data",
      delete: "Delete All Data",
      deleteDialogTitle: "Delete All Data",
      deleteDialogText: "This action cannot be undone. All your data will be lost forever.",
      deleteDialogConfirmText: "To confirm, type:",
      deleteSuccess: "✅ All data deleted",
      exportSuccess: "✅ Data exported",
      importSuccess: "✅ Data imported",
      importError: "❌ Invalid file",
      importDialogTitle: "Import Data",
      importDialogText: "Your current data will be replaced. Are you sure?",
      importConfirm: "Import"
    },
    
    about: {
      title: "About",
      version: "Version",
      madeWith: "Made with ❤️ in Syria",
      tagline: "StudentHub was built to simplify university life and bring all the tools and services a student needs into one place.",
      developer: "Developer",
      developerName: "Ali Alfozo",
      developerRole: "Frontend Developer",
      linkedinName: "Ali Alfozo"
    },
    
    save: "Save Changes",
    saved: "Saved successfully",
    cancel: "Cancel",
    unsavedChanges: "You have unsaved changes",
    discard: "Discard",
    saveAll: "Save All"
  },

  // ---------- Timer ----------
  timer: {
    title: "Study Sessions",
  subtitle: "Organize your time with Pomodoro technique",
    start: "Start",
    pause: "Pause",
    resume: "Resume",
    reset: "Reset",
    minutes: "min",
    modes: {
      study: "Study",
      deep: "Deep Study",
      review: "Quick Review",
      break: "Break"
    },
    session: {
      study: "Study Session",
      deep: "Deep Study Session",
      review: "Quick Review",
      break: "Break Session"
    },
    settings: {
      title: "Adjust Duration"
    },
    stats: {
      totalMinutes: "Total Minutes",
      sessionsToday: "Sessions Today",
      streak: "Day Streak"
    },
    sessions: {
      title: "Recent Sessions",
      clear: "Clear All",
      empty: "No sessions yet",
      confirmClear: "Are you sure you want to clear all sessions?"
    },
    notification: {
      title: "🎉 Session Complete!",
      body: "Great job! Take a short break."
    }
  },
// ---------- AI Assistant ----------
// ---------- AI Assistant ----------
ai: {
  title: "AI Assistant",
  subtitle: "Ask me anything about your studies",
  clearChat: "New Chat",
  inputPlaceholder: "Type your question here...",
  inputHint: "💡 Tip: Be specific to get better answers",
  vpnNotice: {
    title: "To receive responses from the assistant",
    text: "Make sure VPN is enabled before sending your question"
  },
  welcome: {
    title: "Hello! How can I help today?",
    text: "I'm your study assistant. Ask me about time management, study techniques, or anything to help you succeed."
  },
  suggestions: {
    timeManagement: "How do I organize my time before exams?",
    studyPlan: "Give me a study plan for programming in a week",
    raiseGpa: "How can I raise my GPA?",
    procrastination: "How do I avoid procrastination?"
  },
  analyze: {
    title: "Analyze my study situation",
    desc: "Get personalized advice based on your data"
  }
},
  // ---------- Common ----------
  common: {
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    search: "Search",
    filter: "Filter",
    loading: "Loading...",
    error: "An error occurred",
    success: "Success",
    empty: "No data",
    yes: "Yes",
    no: "No"
  },

  // ---------- Days ----------
  days: {
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday"
  },

  // ---------- Months ----------
  months: {
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December"
  }
};
