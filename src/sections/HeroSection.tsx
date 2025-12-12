import background from "../assets/images/backgrounds/home.webp";
import { useLogin } from "../contexts/LoginContext";
import { useSignup } from "../contexts/SignupContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useMemo, useState } from "react";
import DeedQRScanner from "../components/qr/DeedQRScanner";
import { FaQrcode } from "react-icons/fa";

const HeroSection = () => {
  const { openLogin, user, logout } = useLogin();
  const { openSignup } = useSignup();
  const { t } = useLanguage();
  const [showQRScanner, setShowQRScanner] = useState(false);

  const heroHighlights = useMemo(() => [
    t("hero.highlight1"),
    t("hero.highlight2"),
    t("hero.highlight3"),
  ], [t]);

  const platformFeatures = useMemo(() => [
    { 
      icon: "🔐", 
      title: t("hero.blockchainSecurity"), 
      desc: t("hero.blockchainSecurityDesc")
    },
    { 
      icon: "📋", 
      title: t("hero.digitalWorkflow"), 
      desc: t("hero.digitalWorkflowDesc")
    },
    { 
      icon: "💼", 
      title: t("hero.transactionReady"), 
      desc: t("hero.transactionReadyDesc")
    },
  ], [t]);

  return (
    <section
      className="relative w-full min-h-[90vh] sm:min-h-screen bg-cover bg-center flex flex-col justify-center text-white pt-24 pb-12 sm:pb-16 md:py-24 px-4 sm:px-6 md:px-10"
      style={{
        backgroundImage: `linear-gradient(rgba(0,60,10,0.9), rgba(0,60,10,0.92)), url(${background})`,
        backgroundPosition: "center 25%",
      }}
    >
      <div className="max-w-boundary mx-auto w-full px-4 sm:px-6 md:px-16">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm uppercase tracking-widest text-emerald-200 mb-6">
          <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">
            {t("hero.badge1")}
          </span>
          <span className="break-words">{t("hero.badge2")}</span>
        </div>

        <div className="grid gap-8 md:gap-12 lg:gap-16 lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)] items-start lg:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6">
              {t("hero.title")}
            </h1>
            <p className="mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base opacity-90">
              {t("hero.description")}
            </p>

            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-sm sm:text-base">
              {heroHighlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-2 sm:gap-3 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-white/10"
                >
                  <span className="mt-1.5 inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-300 flex-shrink-0" />
                  <span className="opacity-95 text-xs sm:text-sm">{highlight}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setShowQRScanner(true)}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow hover:bg-emerald-500 transition cursor-pointer font-medium text-sm sm:text-base w-full sm:w-auto border border-white/30"
              >
                <FaQrcode className="w-4 h-4" />
                Scan Deed QR
              </button>
              {!user ? (
                <>
                  <button
                    onClick={openLogin}
                    className="text-[#00420A] bg-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow hover:bg-green-100 transition cursor-pointer font-medium text-sm sm:text-base w-full sm:w-auto"
                  >
                    {t("hero.loginButton")}
                  </button>
                  <button
                    onClick={openSignup}
                    className="bg-green-500 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow hover:bg-green-400 transition cursor-pointer font-medium border border-white/30 text-sm sm:text-base w-full sm:w-auto"
                  >
                    {t("hero.createAccountButton")}
                  </button>
                </>
              ) : (
                <button
                  onClick={logout}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow bg-red-600 hover:bg-red-500 transition cursor-pointer text-white font-medium text-sm sm:text-base w-full sm:w-auto"
                >
                  {t("hero.logoutButton")}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/15 rounded-2xl p-4 sm:p-6 backdrop-blur mt-8 lg:mt-0">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-emerald-100 mb-2">
              {t("hero.platformCapabilities")}
            </p>
            <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              {t("hero.whatPlatformDelivers")}
            </h3>
            <p className="text-xs sm:text-sm opacity-90 mb-4 sm:mb-6">
              {t("hero.platformDescription")}
            </p>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {platformFeatures.map((feature) => (
                <div
                  className="bg-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-white/10"
                  key={feature.title}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl flex-shrink-0">{feature.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs sm:text-sm mb-1">{feature.title}</p>
                      <p className="text-xs opacity-90 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white text-[#00420A] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm shadow">
              <p className="font-semibold mb-1">{t("hero.needInstantClarity")}</p>
              <p>
                {t("hero.instantClarityText")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showQRScanner && (
        <DeedQRScanner onClose={() => setShowQRScanner(false)} />
      )}
    </section>
  );
};

export default HeroSection;
