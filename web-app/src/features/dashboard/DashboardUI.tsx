import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  ChevronUp,
  CircleHelp,
  Cpu,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  HeartPulse,
  Info,
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
  Zap,
} from "lucide-react";

import { NAV_ITEMS } from "./constants";
import type { DashboardController } from "./hooks/useDashboardController";
import { accountTypeLabel } from "./utils";

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
  expand_less: ChevronUp,
  download: Download,
  edit: Pencil,
  map: MapIcon,
  business: Building2,
};

const CUSTOMER_TYPE_OPTIONS = [
  { value: "INDIVIDUAL", label: "Individual", icon: "account_circle" },
  { value: "COMPANY", label: "Company", icon: "business" },
] as const;

export function UIIcon({ name, className = "", filled = false }: UIIconProps) {
  const IconComponent = ICON_COMPONENTS[name] ?? CircleHelp;

  return <IconComponent aria-hidden="true" className={`inline-block shrink-0 align-middle ${className}`.trim()} size="1em" strokeWidth={filled ? 2.25 : 2} />;
}

export function BootLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <div className="rounded-2xl bg-surface-container-low px-8 py-6 ambient-panel-shadow">
        <p className="text-sm uppercase tracking-[0.12em] text-on-surface-variant">WattWise</p>
        <p className="mt-2 text-lg font-semibold">Preparing dashboard session...</p>
      </div>
    </div>
  );
}

export function AuthScreen({ controller }: AuthScreenProps) {
  const {
    authMode,
    authSubmitting,
    authError,
    authForm,
    setAuthMode,
    setAuthError,
    setAuthForm,
    handleAuthSubmit,
  } = controller;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-[-120px] h-[420px] w-[420px] rounded-full bg-primary/10 blur-[90px]" />
        <div className="absolute -right-24 bottom-[-120px] h-[420px] w-[420px] rounded-full bg-primary-container/10 blur-[90px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl overflow-hidden rounded-[1.5rem] bg-surface-container-low ambient-panel-shadow">
        <section className="hidden w-1/2 flex-col justify-between bg-surface p-12 lg:flex">
          <div>
            <p className="inline-flex items-center gap-3 brand-gradient-text text-3xl font-black tracking-tight">
              <UIIcon name="bolt" className="text-primary" filled />
              WattWise
            </p>
          </div>
          <div className="max-w-md space-y-5">
            <h1 className="text-5xl font-bold leading-tight tracking-tight">Illuminate your utility insights.</h1>
            <p className="text-lg text-on-surface-variant">
              High-fidelity analytics for LoRaWAN smart utility meters. Monitor fleet status, consumption trends,
              and estimated billing in one decisive control center.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            Enterprise Grade • Precision Analytics
          </p>
        </section>

        <section className="w-full px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14">
          <div className="mx-auto max-w-md">
            <p className="brand-gradient-text flex items-center justify-center gap-2 text-center text-3xl font-black tracking-tight lg:hidden">
              <UIIcon name="bolt" className="text-primary" filled />
              WattWise
            </p>
            <h2 className="mt-8 text-3xl font-bold tracking-tight">
              {authMode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-on-surface-variant">
              {authMode === "login"
                ? "Sign in to access your operational dashboard."
                : "Register to start monitoring your smart utility fleet."}
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleAuthSubmit}>
              {authMode === "register" ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                        First Name
                      </span>
                      <input
                        className="w-full rounded-t-lg border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary"
                        value={authForm.firstName}
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
                        Last Name
                      </span>
                      <input
                        className="w-full rounded-t-lg border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary"
                        value={authForm.lastName}
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
                      Account Type
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
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Email Address
                </span>
                <div className="relative">
                  <UIIcon name="mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant" />
                  <input
                    type="email"
                    className="w-full rounded-t-lg border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 pl-12 outline-none transition focus:border-primary"
                    value={authForm.email}
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
                  Password
                </span>
                <div className="relative">
                  <UIIcon name="lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant" />
                  <input
                    type="password"
                    className="w-full rounded-t-lg border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 pl-12 pr-11 outline-none transition focus:border-primary"
                    value={authForm.password}
                    onChange={(event) =>
                      setAuthForm((previous) => ({
                        ...previous,
                        password: event.target.value,
                      }))
                    }
                    required
                  />
                  <UIIcon name="visibility" className="absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant" />
                </div>
              </label>

              {authError ? <p className="text-sm text-error">{authError}</p> : null}

              <button
                type="submit"
                className="primary-gradient-bg mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#1a1766] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={authSubmitting}
              >
                {authSubmitting
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Sign In"
                    : "Create Account"}
                {!authSubmitting ? <UIIcon name="arrow_forward" className="text-[18px]" /> : null}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-on-surface-variant">
              {authMode === "login" ? "No account yet?" : "Already registered?"}{" "}
              <button
                type="button"
                className="font-semibold text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  setAuthMode((previous) => (previous === "login" ? "register" : "login"));
                  setAuthError(null);
                }}
              >
                {authMode === "login" ? "Sign up" : "Sign in"}
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
    setShowCreateDevice,
    setActiveViewWithRoute,
    loadDevices,
    loadSelectedDeviceData,
    handleLogout,
  } = controller;

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <aside className="hidden w-72 shrink-0 flex-col bg-surface px-5 py-8 lg:flex">
        <div>
          <p className="brand-gradient-text text-3xl font-black tracking-tight">WattWise</p>
          <p className="mt-2 text-xs uppercase tracking-[0.15em] text-on-surface-variant">Premium Tier</p>
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
                  <p className="text-sm font-bold uppercase tracking-[0.08em]">{item.label}</p>
                  <p className="mt-1 text-xs opacity-75">{item.subtitle}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="space-y-4">
          <button
            type="button"
            className="primary-gradient-bg inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#1a1766] transition hover:opacity-90"
            onClick={() => {
              setShowCreateDevice(true);
              setActiveViewWithRoute("devices");
            }}
          >
            <UIIcon name="add" className="text-[18px]" />
            Add Device
          </button>

          <div className="rounded-xl bg-surface-container-low p-4">
            <div className="flex items-center gap-2">
              <UIIcon name="account_circle" className="text-on-surface text-[20px]" />
              <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-on-surface-variant">{accountTypeLabel(user)}</p>
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
              {logoutSubmitting ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col bg-surface-container-low">
        <header className="sticky top-0 z-30 border-b border-outline-variant/20 bg-surface/70 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{NAV_ITEMS.find((item) => item.key === activeView)?.label}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] ${
                  streamStatus === "open"
                    ? "bg-tertiary/10 text-tertiary"
                    : streamStatus === "error"
                      ? "bg-error/10 text-error"
                      : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                <UIIcon name="wifi_tethering" className="text-[15px]" />
                Stream: {streamStatus}
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary transition hover:bg-surface-container-highest"
                onClick={() => {
                  void loadDevices();
                  if (selectedDevEui) {
                    void loadSelectedDeviceData(selectedDevEui);
                  }
                }}
              >
                <UIIcon name="refresh" className="text-[15px]" />
                Refresh
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-on-surface transition hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  void handleLogout();
                }}
                disabled={logoutSubmitting}
              >
                <UIIcon name="logout" className="text-[15px]" />
                {logoutSubmitting ? "Signing out..." : "Logout"}
              </button>
            </div>
          </div>

          {logoutError ? (
            <div className="mt-4 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{logoutError}</div>
          ) : null}

          <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === activeView;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] ${
                    isActive ? "bg-primary text-[#1a1766]" : "bg-surface-container-high text-on-surface-variant"
                  }`}
                  onClick={() => setActiveViewWithRoute(item.key)}
                >
                  <UIIcon name={item.icon} className="text-[14px]" filled={isActive} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
