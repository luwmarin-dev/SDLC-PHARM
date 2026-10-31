import {
  Bell,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../lib/hooks/useAuth";
import useNotifications from "../../lib/hooks/useNotifications";
import usePermissions from "../../lib/hooks/usePermissions";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "../../store/notificationStore";
import Button from "../ui/button";
import LanguageSwitcher from "./LanguageSwitcher";
import StyledContainer from "./StyledContainer";

const NAVIGATION = [
  { id: 1, key: "academy", url: "/academy" },
  { id: 2, key: "community", url: "/community" },
  { id: 3, key: "sessions", url: "/sessions" },
  { id: 4, key: "resources", url: "/resources" },
];

const Header = () => {
  const user = useAuth();
  const { clearAuth } = useAuthStore();
  const { can } = usePermissions();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();
  const resetNotifications = useNotificationStore((state) => state.reset);

  const [isOpen, setOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const accountMenu = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Close the mobile drawer once the viewport reaches the desktop breakpoint.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!accountMenu.current?.contains(event.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isMenuOpen]);

  const baseStyles = "text-[#414844] font-semibold text-sm cursor-pointer";

  const linkClass = (url: string) =>
    pathname.startsWith(url) ? `${baseStyles} opacity-80` : baseStyles;

  const logOut = () => {
    clearAuth();
    // The inbox is per-account: drop it so the next user never sees it.
    resetNotifications();
    setOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  const unreadLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  const avatar =
    user && user.avatar && !avatarFailed ? (
      <img
        src={user.avatar}
        alt={t("nav.myProfile")}
        className="h-9 w-9 shrink-0 rounded-full object-cover outline-2 outline-[#012D1D]"
        onError={() => setAvatarFailed(true)}
      />
    ) : (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#012D1D] font-semibold text-white">
        {user?.displayName?.charAt(0) ?? "?"}
      </span>
    );

  const accountLinks = [
    {
      key: "profile",
      to: "/profile/me",
      label: t("nav.myProfile"),
      Icon: UserIcon,
    },
    {
      key: "settings",
      to: "/settings",
      label: t("settings.title"),
      Icon: Settings,
    },
  ];

  // Staff-only entry; the route itself is guarded by AdminRoutes.
  if (can("manageUsers")) {
    accountLinks.push({
      key: "admin",
      to: "/admin",
      label: t("admin.title"),
      Icon: ShieldCheck,
    });
  }

  return (
    <header className="fixed top-0 left-0 w-full border-b bg-[#F8FAF8] z-999">
      <StyledContainer>
        <div className="flex h-22.5 items-center justify-between gap-2">
          <Link
            to={"/"}
            className="shrink-0 text-xl font-bold text-[#012D1D] sm:text-2xl"
          >
            TES Hub
          </Link>

          <nav className="hidden gap-6 lg:flex xl:gap-10">
            {NAVIGATION.map(({ id, key, url }) => (
              <Link key={id} to={url} className={linkClass(url)}>
                {t(`nav.${key}`)}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center justify-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            {/* The inbox is account-scoped, so it is only offered once signed in. */}
            {user && (
              <Link
                to={"/notifications"}
                aria-label={
                  unreadCount > 0
                    ? t("notifications.unreadCount", { count: unreadCount })
                    : t("nav.notifications")
                }
                className="relative hidden shrink-0 sm:block"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#BA1A1A] px-1 text-[10px] font-bold text-white">
                    {unreadLabel}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative" ref={accountMenu}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  aria-label={t("nav.myProfile")}
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex cursor-pointer items-center rounded-full"
                >
                  {avatar}
                </button>

                {isMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-[1000] mt-2 w-52 overflow-hidden rounded-lg border border-[#C1C8C2] bg-white shadow-lg"
                  >
                    <p className="truncate border-b border-[#ECEEEC] px-4 py-3 text-sm font-semibold text-[#191C1B]">
                      {user.displayName}
                    </p>
                    {accountLinks.map(({ key, to, label, Icon }) => (
                      <Link
                        key={key}
                        to={to}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#414844] hover:bg-[#F2F4F2]"
                      >
                        <Icon size={16} /> {label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={logOut}
                      className="flex w-full cursor-pointer items-center gap-2 border-t border-[#ECEEEC] px-4 py-2.5 text-left text-sm font-semibold text-[#C1292E] hover:bg-[#F2F4F2]"
                    >
                      <LogOut size={16} /> {t("common.logOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                className="px-3 py-2 text-sm whitespace-nowrap sm:px-5"
                onClick={() => navigate("/auth")}
              >
                {t("common.signUp")}
              </Button>
            )}

            <button
              type="button"
              aria-label={t("nav.menu")}
              aria-expanded={isOpen}
              onClick={() => setOpen((value) => !value)}
              className="cursor-pointer lg:hidden"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </StyledContainer>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 top-22.5 z-998 bg-black/30 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <nav className="fixed top-22.5 right-0 bottom-0 z-999 flex w-64 max-w-[80%] flex-col gap-5 overflow-y-auto border-l bg-[#F8FAF8] px-6 pt-8 pb-10 lg:hidden">
            {NAVIGATION.map(({ id, key, url }) => (
              <Link
                key={id}
                to={url}
                className={linkClass(url)}
                onClick={() => setOpen(false)}
              >
                {t(`nav.${key}`)}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/notifications"
                  className={`${baseStyles} flex items-center gap-2 sm:hidden`}
                  onClick={() => setOpen(false)}
                >
                  {t("nav.notifications")}
                  {unreadCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#BA1A1A] px-1 text-[10px] font-bold text-white">
                      {unreadLabel}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile/me"
                  className={baseStyles}
                  onClick={() => setOpen(false)}
                >
                  {t("nav.myProfile")}
                </Link>
                <Link
                  to="/settings"
                  className={baseStyles}
                  onClick={() => setOpen(false)}
                >
                  {t("settings.title")}
                </Link>
                <button
                  type="button"
                  onClick={logOut}
                  className={`${baseStyles} text-left text-[#C1292E]`}
                >
                  {t("common.logOut")}
                </button>
              </>
            )}
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;
