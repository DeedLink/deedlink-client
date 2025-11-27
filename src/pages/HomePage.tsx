import { useEffect } from "react";
import { useLoader } from "../contexts/LoaderContext";
import HeroSection from "../sections/HeroSection";
import WhyChooseSection from "../sections/WhyChooseSection";
import { useLogin } from "../contexts/LoginContext";
import UserDetailsCard from "../components/ui/UserDetailsCard";

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
    detail: "Follow the progress, download certificates, and share clean proof with buyers.",
  },
  {
    label: "Lawyers and survey teams",
    detail: "Upload plans, give feedback, and avoid repeating site visits or paperwork.",
  },
  {
    label: "Officers and ministries",
    detail: "Review, stamp, and release deeds faster because every file is already complete.",
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
    desc: "For family transfers or administrative corrections where money is not exchanged.",
    steps: [
      "Current owner opens a transfer request with the new address and share.",
      "Registrar confirms NIC and relationship documents.",
      "A direct_transfer or gift transaction is written, reducing the giver’s share.",
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
        <div className="max-w-boundary mx-auto px-6 md:px-16 py-12 md:py-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200 mb-3">
              Why it matters
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-white">
              DeedLink keeps every land request moving even when you cannot visit an office.
            </h2>
            <p className="text-sm md:text-base text-emerald-100 leading-relaxed">
              People start the request online, officials review from their desks, and buyers or banks can see
              proof without waiting for stamped letters. This means fewer trips, less guesswork, and faster
              access to funds.
            </p>
          </div>
          <div className="grid gap-4">
            {clarityPillars.map((card) => (
              <div
                key={card.title}
                className="bg-white/10 border border-white/15 rounded-2xl p-5"
              >
                <h3 className="text-xl font-semibold mb-2 text-white">{card.title}</h3>
                <p className="text-sm text-emerald-100">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-50">
        <div className="max-w-boundary mx-auto px-6 md:px-16 py-12 md:py-16 grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700 mb-2">
              Built for every person
            </p>
            <h2 className="text-3xl font-semibold text-emerald-900 mb-4">
              Everyone sees the same facts, so trust grows and waiting time shrinks.
            </h2>
            <p className="text-emerald-800 leading-relaxed">
              From citizens paying school fees to ministries clearing big projects, DeedLink helps people stay
              calm because the real information is always there.
            </p>
          </div>
          <div className="grid gap-4">
            {peopleCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-600 mb-2">
                  {card.label}
                </p>
                <p className="text-emerald-800 text-sm">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-boundary mx-auto px-6 md:px-16 py-12 md:py-16">
          <div className="mb-10 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-600 mb-2">
              Registration & signing flow
            </p>
            <h2 className="text-3xl font-semibold text-gray-900 mb-3">
              Follow the deed from the first form to the final certificate.
            </h2>
            <p className="text-gray-600 max-w-3xl">
              Each box in this flow is connected, so you can see what just happened and what comes next. If
              something is missing, the case highlights it before anyone travels again.
            </p>
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
            {registrationFlow.map((step, index) => (
              <div
                key={step.title}
                className="relative flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-700 font-semibold mb-4 border border-emerald-200">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold mb-2 text-emerald-900">{step.title}</h3>
                <p className="text-sm text-emerald-800 leading-relaxed">{step.desc}</p>
                {index < registrationFlow.length - 1 && (
                  <span className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 w-10 border-t-2 border-dashed border-emerald-200"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-100">
        <div className="max-w-boundary mx-auto px-6 md:px-16 py-12 md:py-16">
          <div className="mb-10 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700 mb-2">
              Transaction paths
            </p>
            <h2 className="text-3xl font-semibold text-gray-900 mb-3">
              See how different deed transactions flow from start to finish.
            </h2>
            <p className="text-gray-600 max-w-3xl">
              Whether it is a sale, a loan, or a family transfer, the steps are simple and well documented.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {transactionFlows.map((type) => (
              <div
                key={type.title}
                className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{type.title}</h3>
                <p className="text-sm text-emerald-800 mb-4">{type.desc}</p>
                <ol className="space-y-2 text-sm text-emerald-900 list-decimal list-inside">
                  {type.steps.map((item, index) => (
                    <li key={`${type.title}-step-${index}`}>{item}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {user &&  
      <div className="w-full pt-8 md:pt-12 px-6 md:px-16">
        <UserDetailsCard user={user}/>
      </div>
      }

      <section className="bg-emerald-900 text-white">
        <div className="max-w-boundary mx-auto px-6 md:px-16 py-12 md:py-16">
          <WhyChooseSection />
        </div>
      </section>
    </main>
  );
};

export default HomePage;