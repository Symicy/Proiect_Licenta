import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Cpu,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  HeartPulse,
  Info,
  KeyRound,
  Languages,
  LayoutDashboard,
  LineChart,
  Lock,
  LogOut,
  Mail,
  Map as MapIcon,
  Network,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SquarePlus,
  TriangleAlert,
  User,
  Wifi,
  X,
  Zap,
} from "lucide-react";

import { NAV_ITEMS } from "./constants";
import type { DashboardController } from "./hooks/useDashboardController";
import { dashboardText, LANGUAGE_OPTIONS, type DashboardLanguage } from "./i18n";

type UIIconProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

type AuthScreenProps = {
  controller: DashboardController;
};

type DashboardShellProps = {
  controller: DashboardController;
  children: ReactNode;
};

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  bolt: Zap,
  insights: LineChart,
  payments: CreditCard,
  mail: Mail,
  lock: Lock,
  visibility: Eye,
  visibility_off: EyeOff,
  arrow_forward: ArrowRight,
  add: Plus,
  account_circle: User,
  logout: LogOut,
  wifi_tethering: Wifi,
  refresh: RefreshCw,
  router: Network,
  attach_money: DollarSign,
  monitor_heart: HeartPulse,
  warning: TriangleAlert,
  info: Info,
  search: Search,
  aod: Cpu,
  add_box: SquarePlus,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  expand_less: ChevronUp,
  download: Download,
  edit: Pencil,
  map: MapIcon,
  business: Building2,
  key: KeyRound,
  languages: Languages,
  close: X,
};

const CUSTOMER_TYPE_OPTIONS = [
  { value: "INDIVIDUAL", labelKey: "individual", icon: "account_circle" },
  { value: "COMPANY", labelKey: "company", icon: "business" },
] as const;

function localizedAccountTypeLabel(controller: DashboardController) {
  const text = dashboardText(controller.language);
  const user = controller.user;

  if (!user) {
    return "";
  }

  if (user.role === "ADMIN") {
    return text.account.administrator;
  }

  if (user.customerType === "COMPANY") {
    return text.account.companyCustomer;
  }

  return text.account.individualCustomer;
}

function LanguageSwitch({
  language,
  onChange,
  compact = false,
}: {
  language: DashboardLanguage;
  onChange: (language: DashboardLanguage) => void;
  compact?: boolean;
}) {
  const text = dashboardText(language);

  return (
    <div className={`inline-flex items-center gap-1 rounded-full bg-surface-container-high p-1 ${compact ? "" : "px-2"}`}>
      {!compact ? <UIIcon name="languages" className="text-[16px] text-on-surface-variant" /> : null}
      <span className="sr-only">{text.language}</span>
      {LANGUAGE_OPTIONS.map((option) => {
        const isSelected = option.value === language;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            title={option.name}
            className={`min-h-8 rounded-full px-3 text-xs font-black uppercase tracking-[0.08em] transition ${
              isSelected
                ? "bg-primary text-[#1a1766]"
                : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function UIIcon({ name, className = "", filled = false }: UIIconProps) {
  const IconComponent = ICON_COMPONENTS[name] ?? CircleHelp;

  return <IconComponent aria-hidden="true" className={`inline-block shrink-0 align-middle ${className}`.trim()} size="1em" strokeWidth={filled ? 2.25 : 2} />;
}

export function BootLoadingScreen({ language = "en" }: { language?: DashboardLanguage }) {
  const text = dashboardText(language);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <div className="rounded-2xl bg-surface-container-low px-8 py-6 ambient-panel-shadow">
        <p className="text-sm uppercase tracking-[0.12em] text-on-surface-variant">WattWise</p>
        <p className="mt-2 text-lg font-semibold">{text.bootPreparing}</p>
      </div>
    </div>
  );
}

export function AuthScreen({ controller }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    authMode,
    authSubmitting,
    authError,
    authForm,
    setAuthMode,
    setAuthError,
    setAuthForm,
    handleAuthSubmit,
    language,
    setLanguage,
  } = controller;
  const text = dashboardText(language);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-[-120px] h-[420px] w-[420px] rounded-full bg-primary/10 blur-[90px]" />
        <div className="absolute -right-24 bottom-[-120px] h-[420px] w-[420px] rounded-full bg-primary-container/10 blur-[90px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl overflow-hidden rounded-[1.5rem] bg-surface-container-low ambient-panel-shadow">
        <section className="hidden w-1/2 flex-col justify-between bg-surface p-12 lg:flex">
          <div className="flex items-center justify-between gap-4">
            <p className="inline-flex items-center gap-3 brand-gradient-text text-3xl font-black tracking-tight">
              <UIIcon name="bolt" className="text-primary" filled />
              WattWise
            </p>
            <LanguageSwitch language={language} onChange={setLanguage} compact />
          </div>
          <div className="max-w-md space-y-5">
            <h1 className="text-5xl font-bold leading-tight tracking-tight">{text.authHeroTitle}</h1>
            <p className="text-lg text-on-surface-variant">{text.authHeroCopy}</p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            {text.authHeroFootnote}
          </p>
        </section>

        <section className="w-full px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <p className="brand-gradient-text flex items-center gap-2 text-center text-3xl font-black tracking-tight">
                <UIIcon name="bolt" className="text-primary" filled />
                WattWise
              </p>
              <LanguageSwitch language={language} onChange={setLanguage} compact />
            </div>
            <h2 className="mt-8 text-3xl font-bold tracking-tight">
              {authMode === "login" ? text.welcomeBack : text.createAccount}
            </h2>
            <p className="mt-2 text-on-surface-variant">
              {authMode === "login"
                ? text.loginSubtitle
                : text.registerSubtitle}
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleAuthSubmit}>
              {authMode === "register" ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                        {text.firstName}
                      </span>
                      <input
                        className="w-full rounded-t-lg border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary"
                        value={authForm.firstName}
                        autoComplete="given-name"
                        onChange={(event) =>
                          setAuthForm((previous) => ({
                            ...previous,
                            firstName: event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                        {text.lastName}
                      </span>
                      <input
                        className="w-full rounded-t-lg border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary"
                        value={authForm.lastName}
                        autoComplete="family-name"
                        onChange={(event) =>
                          setAuthForm((previous) => ({
                            ...previous,
                            lastName: event.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                  </div>

                  <div>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                      {text.accountType}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {CUSTOMER_TYPE_OPTIONS.map((option) => {
                        const isSelected = authForm.customerType === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={isSelected}
                            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                              isSelected
                                ? "border-primary bg-primary text-[#1a1766]"
                                : "border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-on-surface"
                            }`}
                            onClick={() =>
                              setAuthForm((previous) => ({
                                ...previous,
                                customerType: option.value,
                              }))
                            }
                          >
                            <UIIcon name={option.icon} className="text-[18px]" filled={isSelected} />
                            {text.customer[option.labelKey]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                      {text.claimCode}
                    </span>
                    <div className="relative">
                      <UIIcon name="key" className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant" />
                      <input
                        className="w-full rounded-t-lg border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 pl-12 font-mono text-sm uppercase outline-none transition focus:border-primary"
                        placeholder={text.optional}
                        value={authForm.claimCode}
                        onChange={(event) =>
                          setAuthForm((previous) => ({
                            ...previous,
                            claimCode: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </label>
                </>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  {text.emailAddress}
                </span>
                <div className="relative">
                  <UIIcon name="mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant" />
                  <input
                    type="email"
                    className="w-full rounded-t-lg border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 pl-12 outline-none transition focus:border-primary"
                    value={authForm.email}
                    autoComplete="email"
                    onChange={(event) =>
                      setAuthForm((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  {text.password}
                </span>
                <div className="relative">
                  <UIIcon name="lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-t-lg border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 pl-12 pr-11 outline-none transition focus:border-primary"
                    value={authForm.password}
                    autoComplete={authMode === "login" ? "current-password" : "new-password"}
                    onChange={(event) =>
                      setAuthForm((previous) => ({
                        ...previous,
                        password: event.target.value,
                      }))
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 rounded-full p-1 text-on-surface-variant transition hover:bg-surface-container-highest hover:text-primary"
                    aria-label={showPassword ? text.hidePassword : text.showPassword}
                    title={showPassword ? text.hidePassword : text.showPassword}
                    onClick={() => setShowPassword((previous) => !previous)}
                  >
                    <UIIcon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
                  </button>
                </div>
              </label>

              {authError ? <p className="text-sm text-error">{authError}</p> : null}

              <button
                type="submit"
                className="primary-gradient-bg mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#1a1766] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={authSubmitting}
              >
                {authSubmitting
                  ? text.pleaseWait
                  : authMode === "login"
                    ? text.signIn
                    : text.createAccount}
                {!authSubmitting ? <UIIcon name="arrow_forward" className="text-[18px]" /> : null}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-on-surface-variant">
              {authMode === "login" ? text.noAccountYet : text.alreadyRegistered}{" "}
              <button
                type="button"
                className="font-semibold text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  setAuthMode((previous) => (previous === "login" ? "register" : "login"));
                  setAuthError(null);
                }}
              >
                {authMode === "login" ? text.signUp : text.signIn}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function DashboardShell({ controller, children }: DashboardShellProps) {
  const {
    user,
    activeView,
    streamStatus,
    logoutSubmitting,
    logoutError,
    selectedDevEui,
    setActiveViewWithRoute,
    loadDevices,
    loadFleetSummary,
    loadSelectedDeviceData,
    handleLogout,
    language,
    setLanguage,
  } = controller;
  const text = dashboardText(language);
  const accountLabel = localizedAccountTypeLabel(controller);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-y-auto bg-surface px-5 py-8 lg:flex">
        <div>
          <p className="brand-gradient-text text-3xl font-black tracking-tight">WattWise</p>
          <div className="mt-5">
            <LanguageSwitch language={language} onChange={setLanguage} />
          </div>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeView;

            return (
              <button
                key={item.key}
                type="button"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-surface-container-high text-primary shadow-[0_12px_24px_rgba(6,14,32,0.25)]"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
                onClick={() => setActiveViewWithRoute(item.key)}
              >
                <UIIcon
                  name={item.icon}
                  className={`text-[20px] ${isActive ? "text-primary" : "text-on-surface-variant"}`}
                  filled={isActive}
                />
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.08em]">{text.nav[item.key].label}</p>
                  <p className="mt-1 text-xs opacity-75">{text.nav[item.key].subtitle}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="space-y-4">
          <div className="rounded-xl bg-surface-container-low p-4">
            <div className="flex items-center gap-2">
              <UIIcon name="account_circle" className="text-on-surface text-[20px]" />
              <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-on-surface-variant">{accountLabel}</p>
            <p className="mt-2 truncate text-xs text-on-surface-variant">{user.email}</p>

            <button
              type="button"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-high px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-on-surface transition hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                void handleLogout();
              }}
              disabled={logoutSubmitting}
            >
              <UIIcon name="logout" className="text-[16px]" />
              {logoutSubmitting ? text.signingOut : text.logout}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col bg-surface-container-low">
        <header className="sticky top-0 z-30 border-b border-outline-variant/20 bg-surface/70 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                {new Date().toLocaleDateString(language === "ro" ? "ro-RO" : undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{text.nav[activeView].label}</h1>
            </div>

            <div className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:items-center sm:justify-end">
              <div
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] sm:px-4 ${
                  streamStatus === "open"
                    ? "bg-tertiary/10 text-tertiary"
                    : streamStatus === "error"
                      ? "bg-error/10 text-error"
                      : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                <UIIcon name="wifi_tethering" className="text-[15px]" />
                <span>{text.stream}: </span>
                {streamStatus}
              </div>

              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-surface-container-high px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary transition hover:bg-surface-container-highest sm:px-4"
                onClick={() => {
                  void loadDevices();
                  void loadFleetSummary();
                  if (selectedDevEui) {
                    void loadSelectedDeviceData(selectedDevEui);
                  }
                }}
              >
                <UIIcon name="refresh" className="text-[15px]" />
                <span>{text.refresh}</span>
              </button>

              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-surface-container-high px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-on-surface transition hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-60 lg:hidden"
                onClick={() => {
                  void handleLogout();
                }}
                disabled={logoutSubmitting}
                aria-label={text.logout}
              >
                <UIIcon name="logout" className="text-[15px]" />
                <span>{logoutSubmitting ? text.signingOut : text.logout}</span>
              </button>
            </div>
          </div>

          {logoutError ? (
            <div className="mt-4 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{logoutError}</div>
          ) : null}

        </header>

        <main className="flex-1 px-4 pb-28 pt-6 md:px-8 md:py-8">{children}</main>

        <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-1 rounded-2xl border border-outline-variant/20 bg-surface/95 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeView;
            return (
              <button
                key={item.key}
                type="button"
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[0.65rem] font-bold uppercase tracking-[0.05em] transition ${
                  isActive ? "bg-primary text-[#1a1766]" : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
                onClick={() => setActiveViewWithRoute(item.key)}
              >
                <UIIcon name={item.icon} className="text-[18px]" filled={isActive} />
                <span className="max-w-full truncate">{text.nav[item.key].label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
