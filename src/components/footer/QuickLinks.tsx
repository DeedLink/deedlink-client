import { useLanguage } from "../../contexts/LanguageContext";
import { useMemo } from "react";

const QuickLinks = () => {
  const { t } = useLanguage();
  
  const links = useMemo(() => [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.deedsRegistration"), href: "/deeds-registration" },
    { label: t("footer.myDeeds"), href: "/deeds" },
    { label: t("footer.marketplace"), href: "/market" },
  ], [t]);

  return (
    <div className="flex flex-col gap-4 text-white">
      <h3 className="font-semibold text-lg">{t("footer.quickLinks")}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-sm opacity-90 hover:text-emerald-300 hover:opacity-100 transition-colors inline-block"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickLinks;

