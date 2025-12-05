import { useEffect, useMemo } from "react";
import { useLoader } from "../contexts/LoaderContext";
import HeroSection from "../sections/HeroSection";
import WhyChooseSection from "../sections/WhyChooseSection";
import { useLogin } from "../contexts/LoginContext";
import UserDetailsCard from "../components/ui/UserDetailsCard";
import { useLanguage } from "../contexts/LanguageContext";
import mergedVideo from "../assets/video/v0_merged.mp4";

const HomePage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { user } = useLogin();
  const { t } = useLanguage();

  const clarityPillars = useMemo(() => [
    {
      title: t("whyItMatters.pillar1Title"),
      desc: t("whyItMatters.pillar1Desc"),
    },
    {
      title: t("whyItMatters.pillar2Title"),
      desc: t("whyItMatters.pillar2Desc"),
    },
    {
      title: t("whyItMatters.pillar3Title"),
      desc: t("whyItMatters.pillar3Desc"),
    },
  ], [t]);

  const peopleCards = useMemo(() => [
    {
      label: t("builtForEveryone.citizensLabel"),
      detail: t("builtForEveryone.citizensDetail"),
    },
    {
      label: t("builtForEveryone.surveyorsLabel"),
      detail: t("builtForEveryone.surveyorsDetail"),
    },
    {
      label: t("builtForEveryone.notariesLabel"),
      detail: t("builtForEveryone.notariesDetail"),
    },
    {
      label: t("builtForEveryone.ivslLabel"),
      detail: t("builtForEveryone.ivslDetail"),
    },
  ], [t]);

  const registrationFlow = useMemo(() => [
    {
      title: t("registrationFlow.step1Title"),
      desc: t("registrationFlow.step1Desc"),
    },
    {
      title: t("registrationFlow.step2Title"),
      desc: t("registrationFlow.step2Desc"),
    },
    {
      title: t("registrationFlow.step3Title"),
      desc: t("registrationFlow.step3Desc"),
    },
    {
      title: t("registrationFlow.step4Title"),
      desc: t("registrationFlow.step4Desc"),
    },
    {
      title: t("registrationFlow.step5Title"),
      desc: t("registrationFlow.step5Desc"),
    },
  ], [t]);

  const transactionFlows = useMemo(() => [
    {
      title: t("transactionPaths.escrowTitle"),
      desc: t("transactionPaths.escrowDesc"),
      steps: [
        t("transactionPaths.escrowStep1"),
        t("transactionPaths.escrowStep2"),
        t("transactionPaths.escrowStep3"),
        t("transactionPaths.escrowStep4"),
        t("transactionPaths.escrowStep5"),
      ],
    },
    {
      title: t("transactionPaths.giftTitle"),
      desc: t("transactionPaths.giftDesc"),
      steps: [
        t("transactionPaths.giftStep1"),
        t("transactionPaths.giftStep2"),
        t("transactionPaths.giftStep3"),
      ],
    },
    {
      title: t("transactionPaths.fractionalTitle"),
      desc: t("transactionPaths.fractionalDesc"),
      steps: [
        t("transactionPaths.fractionalStep1"),
        t("transactionPaths.fractionalStep2"),
        t("transactionPaths.fractionalStep3"),
        t("transactionPaths.fractionalStep4"),
      ],
    },
  ], [t]);

  const certificateTypes = useMemo(() => [
    {
      icon: "🏠",
      title: t("certificateTypes.rentTitle"),
      desc: t("certificateTypes.rentDesc"),
    },
    {
      icon: "🔑",
      title: t("certificateTypes.poaTitle"),
      desc: t("certificateTypes.poaDesc"),
    },
    {
      icon: "📜",
      title: t("certificateTypes.willTitle"),
      desc: t("certificateTypes.willDesc"),
    },
  ], [t]);

  useEffect(() => {
    showLoader();
    const timer = setTimeout(() => {
      hideLoader();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="bg-white text-gray-900">
      <HeroSection />

      <section className="bg-[#01240f] text-white">
        <div className="max-w-boundary mx-auto px-4 sm:px-6 md:px-16 py-8 sm:py-12 md:py-16 grid gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200 mb-2 sm:mb-3">
              {t("whyItMatters.label")}
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 sm:mb-6 text-white">
              {t("whyItMatters.title")}
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
              {t("whyItMatters.description")}
            </p>
          </div>
          <div className="grid gap-3 sm:gap-4">
            {clarityPillars.map((card) => (
              <div
                key={card.title}
                className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5"
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">{card.title}</h3>
                <p className="text-xs sm:text-sm text-emerald-100">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-50">
        <div className="max-w-boundary mx-auto px-4 sm:px-6 md:px-16 py-8 sm:py-12 md:py-16">
          <div className="mb-8 sm:mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700 mb-2">
              {t("builtForEveryone.label")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-emerald-900 mb-3 sm:mb-4">
              {t("builtForEveryone.title")}
            </h2>
            <p className="text-sm sm:text-base text-emerald-800 leading-relaxed max-w-3xl">
              {t("builtForEveryone.description")}
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
            {/* Stakeholder Cards */}
            <div className="grid gap-3 sm:gap-4">
              {peopleCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-sm"
                >
                  <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-emerald-600 mb-2">
                    {card.label}
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-800">{card.detail}</p>
                </div>
              ))}
            </div>

            {/* Video Section */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 sm:p-6 shadow-sm">           
              <div className="relative rounded-lg overflow-hidden bg-emerald-100 border border-emerald-200 aspect-video">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  loop
                >
                  <source src={mergedVideo} type="video/mp4" />
                  {t("video.browserNotSupported")}
                </video>
                {/* DeedLink Branding Overlay */}
                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg px-6 py-2 sm:py-4 shadow-lg backdrop-blur-sm border border-emerald-400/30 min-w-[140px] max-w-[200px] md:max-w-[300px] w-full">
                  <div className="flex items-center gap-2.5 justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
                    <span className="text-white font-bold text-base tracking-wide">DeedLink</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-boundary mx-auto px-4 sm:px-6 md:px-16 py-8 sm:py-12 md:py-16">
          <div className="mb-6 sm:mb-10 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-600 mb-2">
              {t("registrationFlow.label")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 sm:mb-3">
              {t("registrationFlow.title")}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto md:mx-0">
              {t("registrationFlow.description")}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-stretch overflow-x-auto md:overflow-visible pb-4 md:pb-0 mb-8 sm:mb-12">
            {registrationFlow.map((step, index) => (
              <div
                key={step.title}
                className="relative flex-1 min-w-[280px] sm:min-w-0 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-6 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-emerald-700 font-semibold mb-3 sm:mb-4 border border-emerald-200 text-sm sm:text-base">
                  {index + 1}
                </span>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-emerald-900">{step.title}</h3>
                <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">{step.desc}</p>
                {index < registrationFlow.length - 1 && (
                  <span className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 w-10 border-t-2 border-dashed border-emerald-200"></span>
                )}
              </div>
            ))}
          </div>

          {/* Flowchart and Certificate Types - Two Column Layout */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
            {/* Detailed Signing Flowchart - Left Side */}
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700 mb-4 sm:mb-6 font-semibold text-center">
                {t("registrationFlow.signingFlowTitle")}
              </p>
              
              <div className="space-y-0">
                {/* Step 1: Owner Submission */}
                <div className="flex items-start gap-3 pb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-300 mt-0.5">
                    <span className="text-emerald-700 font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg flex-shrink-0">👤</span>
                      <p className="text-sm font-semibold text-emerald-900">{t("registrationFlow.ownerSubmits")}</p>
                    </div>
                    <p className="text-xs text-emerald-700">{t("registrationFlow.ownerSubmitsDesc")}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center pl-[22px] py-1">
                  <div className="w-0.5 h-5 bg-emerald-300"></div>
                </div>

                {/* Step 2: Surveyor */}
                <div className="flex items-start gap-3 pb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-300 mt-0.5">
                    <span className="text-emerald-700 font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg flex-shrink-0">📐</span>
                      <p className="text-sm font-semibold text-emerald-900">{t("registrationFlow.surveyorSigns")}</p>
                    </div>
                    <p className="text-xs text-emerald-700">{t("registrationFlow.surveyorSignsDesc")}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center pl-[22px] py-1">
                  <div className="w-0.5 h-5 bg-emerald-300"></div>
                </div>

                {/* Step 3: Notary */}
                <div className="flex items-start gap-3 pb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-300 mt-0.5">
                    <span className="text-emerald-700 font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg flex-shrink-0">✍️</span>
                      <p className="text-sm font-semibold text-emerald-900">{t("registrationFlow.notarySigns")}</p>
                    </div>
                    <p className="text-xs text-emerald-700">{t("registrationFlow.notarySignsDesc")}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center pl-[22px] py-1">
                  <div className="w-0.5 h-5 bg-emerald-300"></div>
                </div>

                {/* Step 4: IVSL Valuator */}
                <div className="flex items-start gap-3 pb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-300 mt-0.5">
                    <span className="text-emerald-700 font-bold text-sm">4</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg flex-shrink-0">💰</span>
                      <p className="text-sm font-semibold text-emerald-900">{t("registrationFlow.ivslSigns")}</p>
                    </div>
                    <p className="text-xs text-emerald-700">{t("registrationFlow.ivslSignsDesc")}</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center pl-[22px] py-1">
                  <div className="w-0.5 h-5 bg-emerald-300"></div>
                </div>

                {/* Step 5: Registry Complete */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-emerald-600 mt-0.5">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg flex-shrink-0">🔒</span>
                      <p className="text-sm font-semibold text-emerald-900">{t("registrationFlow.registryComplete")}</p>
                    </div>
                    <p className="text-xs text-emerald-700">{t("registrationFlow.registryCompleteDesc")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Types - Right Side */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 sm:p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700 mb-4 sm:mb-6 font-semibold text-center">
                {t("certificateTypes.title")}
              </p>
              <div className="space-y-4 sm:space-y-5">
                {certificateTypes.map((cert) => (
                  <div
                    key={cert.title}
                    className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 text-2xl sm:text-3xl">{cert.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-emerald-900 mb-1.5 sm:mb-2">
                          {cert.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
                          {cert.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-100">
        <div className="max-w-boundary mx-auto px-4 sm:px-6 md:px-16 py-8 sm:py-12 md:py-16">
          <div className="mb-6 sm:mb-10 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700 mb-2">
              {t("transactionPaths.label")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 sm:mb-3">
              {t("transactionPaths.title")}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto md:mx-0">
              {t("transactionPaths.description")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {transactionFlows.map((type) => (
              <div
                key={type.title}
                className="bg-white rounded-2xl border border-emerald-200 p-4 sm:p-6 shadow-sm"
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">{type.title}</h3>
                <p className="text-xs sm:text-sm text-emerald-800 mb-3 sm:mb-4">{type.desc}</p>
                <ol className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-emerald-900 list-decimal list-inside">
                  {type.steps.map((item, index) => (
                    <li key={`${type.title}-step-${index}`} className="leading-relaxed">{item}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {user && (
        <section className="w-full py-8 md:py-12">
          <UserDetailsCard user={user}/>
        </section>
      )}

      <section className="bg-emerald-900 text-white">
        <div className="max-w-boundary mx-auto px-4 sm:px-6 md:px-16 py-8 sm:py-12 md:py-16">
          <WhyChooseSection />
        </div>
      </section>
    </main>
  );
};

export default HomePage;