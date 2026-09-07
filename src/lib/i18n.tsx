import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ka";

const dict = {
  appName: { en: "Voyage", ka: "მოგზაურობა" },
  totalSpent: { en: "Total spent", ka: "სულ დახარჯული" },
  byCategory: { en: "By category", ka: "კატეგორიების მიხედვით" },
  noData: { en: "No expenses yet", ka: "ხარჯები ჯერ არ არის" },
  converters: { en: "Currency converter", ka: "ვალუტის კონვერტორი" },
  expenses: { en: "Expenses", ka: "ხარჯები" },
  emptyList: { en: "Your transactions will appear here", ka: "თქვენი ტრანზაქციები აქ გამოჩნდება" },
  addExpense: { en: "Add Expense", ka: "ხარჯის დამატება" },
  amount: { en: "Amount", ka: "თანხა" },
  currency: { en: "Currency", ka: "ვალუტა" },
  category: { en: "Category", ka: "კატეგორია" },
  note: { en: "Note (optional)", ka: "შენიშვნა (არასავალდებულო)" },
  save: { en: "Save", ka: "შენახვა" },
  cancel: { en: "Cancel", ka: "გაუქმება" },
  converted: { en: "Converted", ka: "კონვერტირებული" },
  home: { en: "Home", ka: "მთავარი" },
  myTrips: { en: "My Trips", ka: "მოგზაურობები" },
  settings: { en: "Settings", ka: "პარამეტრები" },
  trips: { en: "My Trips", ka: "ჩემი მოგზაურობები" },
  noTrips: { en: "No trips yet", ka: "მოგზაურობები ჯერ არ არის" },
  tripsHint: {
    en: "Create a trip to group your expenses.",
    ka: "შექმენით მოგზაურობა ხარჯების დასაჯგუფებლად.",
  },
  language: { en: "Language", ka: "ენა" },
  switchToDarkMode: { en: "Switch to dark mode", ka: "მუქ რეჟიმზე გადართვა" },
  switchToLightMode: { en: "Switch to light mode", ka: "ნათელ რეჟიმზე გადართვა" },
  rates: { en: "Exchange rates", ka: "გაცვლითი კურსი" },
  clearData: { en: "Clear all expenses", ka: "ყველა ხარჯის წაშლა" },
  cleared: { en: "All expenses removed", ka: "ყველა ხარჯი წაიშალა" },
  newTrip: { en: "Create New Trip", ka: "ახალი მოგზაურობა" },
  tripName: { en: "Trip Name", ka: "მოგზაურობის სახელი" },
  tripNamePlaceholder: { en: "Agia Napa, Cyprus", ka: "აია ნაპა, კვიპროსი" },
  startDate: { en: "Start Date", ka: "დაწყების თარიღი" },
  endDate: { en: "End Date", ka: "დასრულების თარიღი" },
  create: { en: "Create", ka: "შექმნა" },
  activeTrip: { en: "Active", ka: "აქტიური" },
  setActive: { en: "Set active", ka: "გააქტიურება" },
  deleteTrip: { en: "Delete trip", ka: "მოგზაურობის წაშლა" },
  tripCreated: { en: "Trip created", ka: "მოგზაურობა შეიქმნა" },
  tripDeleted: { en: "Trip deleted", ka: "მოგზაურობა წაიშალა" },
  noActiveTrip: { en: "No active trip", ka: "აქტიური მოგზაურობა არ არის" },
  noActiveTripHint: {
    en: "Create a trip to start tracking expenses.",
    ka: "შექმენით მოგზაურობა ხარჯების აღრიცხვისთვის.",
  },
  ratesHint: {
    en: "Edit rates manually — totals recalculate instantly.",
    ka: "შეასწორეთ კურსი ხელით — ჯამი მაშინვე გადაითვლება.",
  },
  resetRates: { en: "Reset to default rates", ka: "კურსის დაბრუნება" },
  syncError: { en: "Sync failed, please try again", ka: "სინქრონიზაცია ვერ შესრულდა" },
  synced: { en: "Synced across devices", ka: "სინქრონიზებულია მოწყობილობებზე" },
  welcomeTitle: { en: "Welcome to Voyage", ka: "მოგესალმებით Voyage-ში" },
  welcomeHint: {
    en: "Join a trip with its 5-digit PIN or create a new one to share with your family.",
    ka: "შეუერთდით მოგზაურობას 5-ნიშნა კოდით ან შექმენით ახალი ოჯახისთვის.",
  },
  joinTrip: { en: "Join Trip", ka: "შეერთება" },
  createTrip: { en: "Create Trip", ka: "შექმნა" },
  username: { en: "Username", ka: "მომხმარებელი" },
  usernamePlaceholder: { en: "Who is travelling?", ka: "ვინ მოგზაურობს?" },
  pinCode: { en: "5-digit PIN", ka: "5-ნიშნა კოდი" },
  pinHint: {
    en: "Everyone with this PIN shares the same trip data.",
    ka: "ამ კოდის მფლობელები ერთსა და იმავე მონაცემებს ხედავენ.",
  },
  tripNotFound: { en: "No trip found for this PIN", ka: "ამ კოდით მოგზაურობა არ მოიძებნა" },
  pinTaken: { en: "This PIN is already in use", ka: "ეს კოდი უკვე გამოყენებულია" },
  tripAccess: { en: "Trip access", ka: "მოგზაურობის წვდომა" },
  exitTrip: { en: "Exit trip", ka: "მოგზაურობიდან გასვლა" },

  dashboard: { en: "My Trips", ka: "ჩემი მოგზაურობები" },
  backToTrips: { en: "Trips", ka: "მოგზაურობები" },
  logOut: { en: "Log out", ka: "გასვლა" },
  loggedOut: { en: "Logged out", ka: "გამოსვლა შესრულდა" },
  personalPin: { en: "Personal PIN", ka: "პირადი კოდი" },
  personalPinHint: {
    en: "5 digits. Your trips are tied to this PIN on every device.",
    ka: "5 ციფრი. თქვენი მოგზაურობები ამ კოდზეა მიბმული ყველა მოწყობილობაზე.",
  },
  continueBtn: { en: "Continue", ka: "გაგრძელება" },
  helloUser: { en: "Hello", ka: "გამარჯობა" },
  openTrip: { en: "Open trip", ka: "გახსნა" },
  tripMissing: { en: "Trip not found", ka: "მოგზაურობა ვერ მოიძებნა" },

  editTrip: { en: "Edit trip", ka: "მოგზაურობის რედაქტირება" },
  editExpense: { en: "Edit Expense", ka: "ხარჯის რედაქტირება" },
  tripUpdated: { en: "Trip updated", ka: "მოგზაურობა განახლდა" },
  expenseUpdated: { en: "Expense updated", ka: "ხარჯი განახლდა" },
  budget: { en: "Budget (GEL, optional)", ka: "ბიუჯეტი (₾, არასავალდებულო)" },
  budgetProgress: { en: "Budget", ka: "ბიუჯეტი" },
  overBudget: { en: "Over budget", ka: "ბიუჯეტი გადამეტებულია" },
  budgetLeft: { en: "left", ka: "დარჩა" },
  dailyAvg: { en: "Daily average", ka: "დღიური საშუალო" },
  daysLeft: { en: "days left", ka: "დღე დარჩა" },
  allCategories: { en: "All categories", ka: "ყველა კატეგორია" },
  filter: { en: "Filter", ka: "ფილტრი" },
  deleteTripConfirmTitle: { en: "Delete this trip?", ka: "წავშალოთ მოგზაურობა?" },
  deleteTripConfirmBody: {
    en: "The trip and all its expenses will be permanently deleted.",
    ka: "მოგზაურობა და ყველა მისი ხარჯი სამუდამოდ წაიშლება.",
  },
  deleteBtn: { en: "Delete", ka: "წაშლა" },
  exportCsv: { en: "Export CSV", ka: "CSV ექსპორტი" },
  exported: { en: "CSV downloaded", ka: "CSV ჩამოიტვირთა" },
  fetchLiveRates: { en: "Use today's official rates (NBG)", ka: "დღევანდელი ოფიციალური კურსი (სებ)" },
  ratesFetched: { en: "Rates updated from National Bank of Georgia", ka: "კურსი განახლდა სებ-იდან" },
  ratesFetchFailed: { en: "Couldn't fetch live rates", ka: "კურსი ვერ ჩამოიტვირთა" },
  cat_tickets: { en: "Tickets", ka: "ბილეთები" },
  cat_luggage: { en: "Luggage", ka: "ბარგი" },
  cat_hotel: { en: "Hotel", ka: "სასტუმრო" },
  cat_food: { en: "Food", ka: "კვება" },
  cat_internet: { en: "Internet", ka: "ინტერნეტი" },
  cat_transport: { en: "Transport", ka: "ტრანსპორტი" },
  cat_local: { en: "Local Exp.", ka: "ხარჯი ადგილზე" },
  cat_insurance: { en: "Insurance", ka: "დაზღვევა" },
  cat_other: { en: "Other", ka: "სხვა" },

  version: { en: "Version", ka: "ვერსია" },
  whatsNew: { en: "What's new", ka: "რა არის ახალი" },
  gotIt: { en: "Got it", ka: "გასაგებია" },
  aboutFeedback: { en: "About & Feedback", ka: "აპლიკაციის შესახებ და უკუკავშირი" },
  aboutText: {
    en: "Effortlessly track your travel expenses and enjoy every moment. Hope this app makes your journeys smoother and more delightful!",
    ka: "მარტივად მართე სამოგზაურო ხარჯები და ისიამოვნე თითოეული წუთით. იმედი მაქვს, ეს აპლიკაცია მოგზაურობას კიდევ უფრო კომფორტულს გახდის!",
  },
  developerAttribution: {
    en: "Designed by Giorgi Jobava",
    ka: "შექმნილია გიორგი ჯობავას მიერ",
  },
  lastUpdated: { en: "Last updated", ka: "ბოლო განახლება" },
  feedbackTitle: { en: "Submit Feedback", ka: "უკუკავშირის გაგზავნა" },
  feedbackPlaceholder: {
    en: "Ideas, bugs, anything you'd like to see…",
    ka: "იდეები, შენიშვნები, რისი დამატებაც გსურთ…",
  },
  send: { en: "Send", ka: "გაგზავნა" },
  feedbackSent: { en: "Thank you for your feedback!", ka: "გმადლობთ უკუკავშირისთვის!" },

  amountTooBig: { en: "Max 6 digits and 2 decimals", ka: "მაქს. 6 ციფრი და 2 ათწილადი" },
  expenseDate: { en: "Date", ka: "თარიღი" },
  customCategory: { en: "Custom category", ka: "საკუთარი კატეგორია" },
  customCategoryPlaceholder: { en: "e.g. Souvenirs", ka: "მაგ. სუვენირები" },
  tags: { en: "Tags", ka: "თეგები" },
  tag_kids: { en: "Kids", ka: "ბავშვები" },
  tag_family: { en: "Family", ka: "ოჯახი" },
  tag_work: { en: "Work", ka: "სამსახური" },
  tag_fun: { en: "Fun", ka: "გართობა" },
  quickAdd: { en: "Quick add", ka: "სწრაფი დამატება" },
  quick_coffee: { en: "Coffee", ka: "ყავა" },
  quick_tips: { en: "Tips", ka: "ჩაი" },
  quick_supermarket: { en: "Supermarket", ka: "სუპერმარკეტი" },
  quick_taxi: { en: "Taxi", ka: "ტაქსი" },
  quick_water: { en: "Water", ka: "წყალი" },
  quick_snack: { en: "Snack", ka: "სნექი" },

  saveLocation: { en: "Save location", ka: "ადგილმდებარეობის შენახვა" },
  locating: { en: "Getting location…", ka: "ადგილმდებარეობა ისაზღვრება…" },
  locationSaved: { en: "Location added", ka: "ადგილმდებარეობა დაემატა" },
  locationDenied: { en: "Location unavailable", ka: "ადგილმდებარეობა მიუწვდომელია" },
  tripLocation: { en: "Where are you going?", ka: "სად მიემგზავრებით?" },
  mapHint: { en: "Tap the map to drop a pin.", ka: "შეეხეთ რუკას ნიშნულის დასმისთვის." },
  searchLocation: { en: "Search location", ka: "მდებარეობის ძიება" },
  searchLocationPlaceholder: { en: "Search location...", ka: "აირჩიეთ მდებარეობა..." },
  clearSearch: { en: "Clear search", ka: "ძიების გასუფთავება" },
  locationNotFound: { en: "Location not found", ka: "მდებარეობა ვერ მოიძებნა" },
  locationSearchFailed: { en: "Location search failed", ka: "მდებარეობის ძიება ვერ შესრულდა" },
  listView: { en: "List", ka: "სია" },
  mapView: { en: "Map", ka: "რუკა" },
  noGeoExpenses: {
    en: "No expenses with a location yet",
    ka: "ჯერ არ არის ხარჯი ადგილმდებარეობით",
  },
  manageQuick: { en: "Manage quick add", ka: "სწრაფი დამატების მართვა" },
  quickTitle: { en: "Title", ka: "დასახელება" },
  addItem: { en: "Add", ka: "დამატება" },
  newTag: { en: "New tag", ka: "ახალი თეგი" },
  editList: { en: "Edit", ka: "რედაქტირება" },
  doneEditing: { en: "Done", ka: "დასრულება" },
  loadingMap: { en: "Loading map…", ka: "რუკა იტვირთება…" },
  authWelcome: { en: "Welcome to Voyage", ka: "მოგესალმებით Voyage-ში" },
  authHint: { en: "Sign in to keep your trips synced across devices.", ka: "შედით ანგარიშზე, რომ მოგზაურობები მოწყობილობებს შორის დასინქრონდეს." },
  signIn: { en: "Sign In", ka: "შესვლა" },
  signUp: { en: "Sign Up", ka: "რეგისტრაცია" },
  continueGoogle: { en: "Continue with Google", ka: "Google-ით გაგრძელება" },
  or: { en: "or", ka: "ან" },
  email: { en: "Email", ka: "ელფოსტა" },
  emailPlaceholder: { en: "you@example.com", ka: "თქვენი ელფოსტა" },
  password: { en: "Password", ka: "პაროლი" },
  passwordPlaceholder: { en: "At least 6 characters", ka: "მინიმუმ 6 სიმბოლო" },
  passwordTooShort: { en: "Password must be at least 6 characters.", ka: "პაროლი მინიმუმ 6 სიმბოლოსგან უნდა შედგებოდეს." },
  signedIn: { en: "Signed in successfully.", ka: "შესვლა წარმატებით შესრულდა." },
  checkEmail: { en: "Check your email to confirm your account.", ka: "ანგარიშის დასადასტურებლად შეამოწმეთ ელფოსტა." },
  authAction: { en: "Auth / Sign In", ka: "ავტორიზაცია / შესვლა" },
  account: { en: "Account", ka: "ანგარიში" },
  signOut: { en: "Sign Out", ka: "გამოსვლა" },
  authFailed: { en: "Authentication failed. Check your details and try again.", ka: "ავტორიზაცია ვერ შესრულდა. შეამოწმეთ მონაცემები და სცადეთ თავიდან." },
  accountCreated: { en: "Account created successfully.", ka: "ანგარიში წარმატებით შეიქმნა." },
  authLoading: { en: "Completing sign in…", ka: "შესვლა სრულდება…" },
} as const;

export type TKey = keyof typeof dict;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string };

const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => dict[k].en });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("lang");
    if (saved === "en" || saved === "ka") setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lang", lang);
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: (k) => dict[k][lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
