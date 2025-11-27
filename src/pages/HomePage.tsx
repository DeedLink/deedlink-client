import { useEffect } from "react";
import { useLoader } from "../contexts/LoaderContext";
import HeroSection from "../sections/HeroSection";
import WhyChooseSection from "../sections/WhyChooseSection";
import { useLogin } from "../contexts/LoginContext";
import UserDetailsCard from "../components/ui/UserDetailsCard";
import mergedVideo from "../assets/video/v0_merged.mp4";

const clarityPillars = [
  {
    title: "One case, one source",
    desc: "Every deed request keeps the owner details, land data, scans, and valuation notes in the same record.",
  },
  {
    title: "Locked until signed",
    desc: "The NFT is created right away but stays locked until surveyor, notary, and IVSL signatures are done, so nothing moves early.",
  },
  {
    title: "Ready for transfers",
    desc: "Once fully signed, the system links the token ID and unlocks escrow, marketplace, or direct transfer options with built-in proof.",
  },
];

const peopleCards = [
  {
    label: "Citizens and owners",
    detail: "Submit deed requests, track progress, download certificates, and share verified proof with buyers or banks.",
  },
  {
    label: "Surveyors",
    detail: "Upload survey plans, review property boundaries, and sign deeds on-chain to verify land details.",
  },
  {
    label: "Notaries",
    detail: "Review deed documents, verify identities, and provide on-chain signatures to authorize transfers.",
  },
  {
    label: "IVSL valuators",
    detail: "Assess property values, set valuations for stamp fee calculations, and sign to complete the approval process.",
  },
];

const registrationFlow = [
  {
    title: "Submit and mint (locked)",
    desc: "Owners open a case, add land details, choose the surveyor/notary/IVSL team, and the system instantly mints a deed NFT. It stays inactive until signatures arrive.",
  },
  {
    title: "Valuation requested",
    desc: "The system asks IVSL for a valuation (requestValuation) so taxes and stamp fees are based on real value.",
  },
  {
    title: "Officials review & sign",
    desc: "Surveyor, notary, and IVSL review documents and sign on-chain (isSignedBySurveyor / isSignedByNotary / isSignedByIVSL). You can see who is done via the signature tracker.",
  },
  {
    title: "Deed unlocks for transfers",
    desc: "When the final signature lands, the deed is marked fully signed (isFullySigned) and activates for escrow, marketplace, or direct transfers.",
  },
  {
    title: "Ready for handover",
    desc: "Certificates, valuations, and ownership tables stay synced so every future transaction starts from a trusted base.",
  },
];

const transactionFlows = [
  {
    title: "Escrow sale",
    desc: "Used when a buyer and seller want the platform to hold funds and the deed until both sides finish their part.",
    steps: [
      "Seller pays stamp fee and creates an escrow (completeFullOwnershipTransfer).",
      "Seller deposits the NFT into the escrow contract.",
      "Buyer deposits the agreed payment.",
      "Buyer finalizes escrow to release funds and transfer the deed.",
      "System records an escrow_sale + sale_transfer in the title history.",
    ],
  },
  {
    title: "Direct / gift transfer",
    desc: "For transfers where money is not exchanged, such as gifts or administrative corrections.",
    steps: [
      "Current owner opens a transfer request with the new address and share.",
      "A direct_transfer or gift transaction is written, reducing the giver's share.",
      "Deed owners array updates so certificates show the new holder.",
    ],
  },
  {
    title: "Fractional listing",
    desc: "Ideal when many investors need to co-own or trade parts of the property.",
    steps: [
      "Owner fractionalizes the NFT via the factory to mint property tokens.",
      "Tokens or shares are listed in the marketplace (open_market).",
      "Buyers pick up fractions; every fill logs a sale_transfer in the title history.",
      "When one person buys 100% back, they can defractionalize to regain the whole deed.",
    ],
  },
];

const HomePage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { user } = useLogin();

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
              Why it matters
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 sm:mb-6 text-white">
              DeedLink keeps every land request moving even when you cannot visit an office.
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
              People start the request online, officials review from their desks, and buyers or banks can see
              proof without waiting for stamped letters. This means fewer trips, less guesswork, and faster
              access to funds.
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
              Built for every person
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-emerald-900 mb-3 sm:mb-4">
              Everyone sees the same facts, so trust grows and waiting time shrinks.
            </h2>
            <p className="text-sm sm:text-base text-emerald-800 leading-relaxed max-w-3xl">
              From citizens paying school fees to ministries clearing big projects, DeedLink helps people stay
              calm because the real information is always there.
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
                  Your browser does not support the video tag.
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
              Registration & signing flow
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 sm:mb-3">
              Follow the deed from the first form to the final certificate.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto md:mx-0">
              Each box in this flow is connected, so you can see what just happened and what comes next. If
              something is missing, the case highlights it before anyone travels again.
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

          {/* Detailed Signing Flowchart */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 sm:p-6 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700 mb-4 sm:mb-6 font-semibold text-center">
              Signing & Registry Flow
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
                    <p className="text-sm font-semibold text-emerald-900">Owner Submits</p>
                  </div>
                  <p className="text-xs text-emerald-700">Deed request with land details</p>
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
                    <p className="text-sm font-semibold text-emerald-900">Surveyor Signs</p>
                  </div>
                  <p className="text-xs text-emerald-700">Verifies boundaries & uploads plans</p>
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
                    <p className="text-sm font-semibold text-emerald-900">Notary Signs</p>
                  </div>
                  <p className="text-xs text-emerald-700">Reviews documents & verifies identity</p>
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
                    <p className="text-sm font-semibold text-emerald-900">IVSL Valuator Signs</p>
                  </div>
                  <p className="text-xs text-emerald-700">Sets valuation & completes approval</p>
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
                    <p className="text-sm font-semibold text-emerald-900">Registry Complete</p>
                  </div>
                  <p className="text-xs text-emerald-700">Deed activated & ready for transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-100">
        <div className="max-w-boundary mx-auto px-4 sm:px-6 md:px-16 py-8 sm:py-12 md:py-16">
          <div className="mb-6 sm:mb-10 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700 mb-2">
              Transaction paths
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 sm:mb-3">
              See how different deed transactions flow from start to finish.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto md:mx-0">
              Whether it is a sale, a loan, or a family transfer, the steps are simple and well documented.
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

      {user &&  
      <div className="w-full pt-6 sm:pt-8 md:pt-12 px-4 sm:px-6 md:px-16">
        <UserDetailsCard user={user}/>
      </div>
      }

      <section className="bg-emerald-900 text-white">
        <div className="max-w-boundary mx-auto px-4 sm:px-6 md:px-16 py-8 sm:py-12 md:py-16">
          <WhyChooseSection />
        </div>
      </section>
    </main>
  );
};

export default HomePage;