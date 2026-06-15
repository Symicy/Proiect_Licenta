export type DashboardLanguage = "en" | "ro";

export const LANGUAGE_STORAGE_KEY = "wattwise-language";

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "EN", name: "English" },
  { value: "ro", label: "RO", name: "Romana" },
] as const satisfies Array<{ value: DashboardLanguage; label: string; name: string }>;

const ro = {
  bootPreparing: "Se pregateste sesiunea dashboard...",
  authHeroTitle: "Controleaza inteligent consumul de utilitati.",
  authHeroCopy:
    "Analiza avansata pentru contoare inteligente LoRaWAN. Monitorizeaza flota, tendintele de consum si costurile estimate intr-un singur centru operational.",
  authHeroFootnote: "Nivel enterprise | Analiza precisa",
  welcomeBack: "Bine ai revenit",
  createAccount: "Creeaza cont",
  loginSubtitle: "Autentifica-te pentru a accesa dashboard-ul operational.",
  registerSubtitle: "Inregistreaza-te pentru a monitoriza flota de contoare inteligente.",
  firstName: "Prenume",
  lastName: "Nume",
  accountType: "Tip cont",
  individual: "Individual",
  company: "Companie",
  claimCode: "Cod revendicare",
  optional: "OPTIONAL",
  emailAddress: "Adresa email",
  password: "Parola",
  showPassword: "Afiseaza parola",
  hidePassword: "Ascunde parola",
  pleaseWait: "Te rugam asteapta...",
  signIn: "Autentificare",
  signUp: "Inregistrare",
  noAccountYet: "Nu ai cont?",
  alreadyRegistered: "Ai deja cont?",
  premiumTier: "Nivel premium",
  addDevice: "Adauga dispozitiv",
  signingOut: "Se iese din cont...",
  logout: "Iesire",
  stream: "Flux",
  refresh: "Reimprospatare",
  language: "Limba",
  loadingInventory: "Se incarca inventarul dispozitivelor...",
  nav: {
    overview: { label: "Prezentare", subtitle: "Rezumat flota" },
    devices: { label: "Dispozitive", subtitle: "Inventar" },
    meter: { label: "Contor", subtitle: "Detalii live" },
    billing: { label: "Facturare", subtitle: "Rezumat costuri" },
  },
  account: {
    administrator: "Administrator",
    individualCustomer: "Client individual",
    companyCustomer: "Client companie",
  },
  customer: {
    individual: "Individual",
    company: "Companie",
  },
  status: {
    connected: "Conectat",
    error: "Eroare",
    inactive: "Inactiv",
    heartbeat: "Heartbeat",
  },
  relative: {
    noReading: "Fara citire",
    justNow: "Acum",
    minAgo: "min in urma",
    hourAgo: "h in urma",
    dayAgo: "z in urma",
  },
} as const;

const en = {
  bootPreparing: "Preparing dashboard session...",
  authHeroTitle: "Illuminate your utility insights.",
  authHeroCopy:
    "High-fidelity analytics for LoRaWAN smart utility meters. Monitor fleet status, consumption trends, and estimated billing in one decisive control center.",
  authHeroFootnote: "Enterprise Grade | Precision Analytics",
  welcomeBack: "Welcome back",
  createAccount: "Create your account",
  loginSubtitle: "Sign in to access your operational dashboard.",
  registerSubtitle: "Register to start monitoring your smart utility fleet.",
  firstName: "First Name",
  lastName: "Last Name",
  accountType: "Account Type",
  individual: "Individual",
  company: "Company",
  claimCode: "Claim Code",
  optional: "OPTIONAL",
  emailAddress: "Email Address",
  password: "Password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  pleaseWait: "Please wait...",
  signIn: "Sign In",
  signUp: "Sign up",
  noAccountYet: "No account yet?",
  alreadyRegistered: "Already registered?",
  premiumTier: "Premium Tier",
  addDevice: "Add Device",
  signingOut: "Signing out...",
  logout: "Logout",
  stream: "Stream",
  refresh: "Refresh",
  language: "Language",
  loadingInventory: "Loading device inventory...",
  nav: {
    overview: { label: "Overview", subtitle: "Fleet snapshot" },
    devices: { label: "Devices", subtitle: "Inventory" },
    meter: { label: "Meter", subtitle: "Live details" },
    billing: { label: "Billing", subtitle: "Cost summary" },
  },
  account: {
    administrator: "Administrator",
    individualCustomer: "Individual Customer",
    companyCustomer: "Company Customer",
  },
  customer: {
    individual: "Individual",
    company: "Company",
  },
  status: {
    connected: "Connected",
    error: "Error",
    inactive: "Inactive",
    heartbeat: "Heartbeat",
  },
  relative: {
    noReading: "No reading",
    justNow: "Just now",
    minAgo: "min ago",
    hourAgo: "h ago",
    dayAgo: "d ago",
  },
} as const;

export const DASHBOARD_TEXT = {
  en,
  ro,
} as const;

export function dashboardText(language: DashboardLanguage) {
  return DASHBOARD_TEXT[language];
}

const ROMANIAN_PHRASES: Record<string, string> = {
  Home: "Acasa",
  Summary: "Rezumat",
  Map: "Harta",
  "Fleet Overview": "Prezentare flota",
  "Operational health, live telemetry, and utility cost distribution.":
    "Stare operationala, telemetrie live si distributia costurilor pe utilitati.",
  "Fleet Devices": "Dispozitive flota",
  "Utility Categories": "Categorii utilitati",
  "Fleet Cost (30d)": "Cost flota (30z)",
  "Fleet Health": "Sanatate flota",
  "Electricity, water, gas, heating, cooling": "Electricitate, apa, gaz, incalzire, racire",
  "Utility Consumption": "Consum pe utilitati",
  "Aggregated consumption for today, week, and the last 30 days.":
    "Consum agregat pentru azi, saptamana si ultimele 30 de zile.",
  "Cost Mix": "Mix costuri",
  "30-day estimated cost by utility category.": "Cost estimat pe 30 de zile pe categorie de utilitate.",
  "Fleet cost": "Cost flota",
  "Live Snapshot": "Instantaneu live",
  "Current usage and cost across each utility.": "Consum si cost curent pentru fiecare utilitate.",
  Stream: "Flux",
  Utility: "Utilitate",
  Devices: "Dispozitive",
  Latest: "Ultima valoare",
  Cost: "Cost",
  "Waiting for live telemetry to build category snapshot.":
    "Se asteapta telemetrie live pentru construirea rezumatului pe categorii.",
  "Recent Alerts": "Alerte recente",
  "Live operational notices and stream state.": "Notificari operationale live si starea fluxului.",
  Live: "Live",
  "No active alerts. Stream heartbeat is stable.": "Nu exista alerte active. Heartbeat-ul fluxului este stabil.",
  "Top Devices By Latest Usage": "Dispozitive cu cel mai mare consum curent",
  "Fast ranking of the current highest consumers.": "Clasament rapid al celor mai mari consumatori curenti.",
  "Live ranking": "Clasament live",
  "Device Inventory": "Inventar dispozitive",
  "Search, filter, claim, and maintain your utility meters.":
    "Cauta, filtreaza, revendica si administreaza contoarele de utilitati.",
  "Total Fleet": "Total flota",
  "Critical Errors": "Erori critice",
  "Claim Code": "Cod revendicare",
  "Search by devEui or device name": "Cauta dupa devEUI sau numele dispozitivului",
  Device: "Dispozitiv",
  Tariff: "Tarif",
  Status: "Stare",
  "Last Seen": "Ultima citire",
  Load: "Sarcina",
  Actions: "Actiuni",
  Claim: "Revendica",
  "Add Device": "Adauga dispozitiv",
  All: "Toate",
  Connected: "Conectat",
  Heartbeat: "Heartbeat",
  Error: "Eroare",
  Inactive: "Inactiv",
  "Select or register a device to open meter details.":
    "Selecteaza sau inregistreaza un dispozitiv pentru a vedea detaliile contorului.",
  "Live Readings": "Citiri live",
  "Current meter state": "Starea curenta a contorului",
  Consumption: "Consum",
  Voltage: "Tensiune",
  Current: "Curent",
  "Stream Health": "Stare flux",
  Excellent: "Excelent",
  "Cost Estimation": "Estimare cost",
  Today: "Azi",
  "This Week": "Saptamana aceasta",
  "This Month": "Luna aceasta",
  "Consumption Profile": "Profil consum",
  "Recent consumption trend for the selected meter.": "Tendinta recenta de consum pentru contorul selectat.",
  "Daily aggregated consumption for the selected meter.": "Consum zilnic agregat pentru contorul selectat.",
  "30-day telemetry": "Telemetrie 30 zile",
  "30-day daily totals": "Totaluri zilnice 30 zile",
  "ARIMA Forecast": "Prognoza ARIMA",
  "Observed history against the predicted short-term consumption index.":
    "Istoric observat comparat cu indicele de consum prognozat pe termen scurt.",
  "Observed interval consumption against the predicted short-term consumption.":
    "Consum observat pe interval comparat cu prognoza de consum pe termen scurt.",
  "Next 24 hours": "Urmatoarele 24 ore",
  "Last 72 hours / next 24 hours": "Ultimele 72 ore / urmatoarele 24 ore",
  Horizon: "Orizont",
  Step: "Pas",
  "ARIMA Order": "Ordin ARIMA",
  "Projected Cost": "Cost prognozat",
  "Today / Week / 30d": "Azi / Saptamana / 30z",
  "Fleet billing": "Facturare flota",
  "Cost By Utility": "Cost pe utilitate",
  "Estimated cumulative cost from the latest readings.": "Cost cumulativ estimat din ultimele citiri.",
  "Top Cost Drivers": "Cele mai mari costuri",
  "Highest estimated cumulative costs.": "Cele mai mari costuri cumulative estimate.",
  Ranking: "Clasament",
  "Fleet Billing Projection": "Proiectie facturare flota",
  "Instant estimate using latest cumulative consumption and configured tariff per unit.":
    "Estimare instantanee folosind consumul cumulativ recent si tariful configurat pe unitate.",
  Usage: "Consum",
};

export function translateText(language: DashboardLanguage, phrase: string) {
  if (language !== "ro") {
    return phrase;
  }

  return ROMANIAN_PHRASES[phrase] ?? phrase;
}
