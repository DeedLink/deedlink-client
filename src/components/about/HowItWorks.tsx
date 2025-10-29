import React from "react";
import {
  FaFileSignature,
  FaCubes,
  FaChartPie,
  FaShieldAlt,
  FaUserCheck,
  FaExchangeAlt,
} from "react-icons/fa";

const steps = [
  {
    icon: FaUserCheck,
    title: "Secure Authentication & KYC",
    description:
      "Connect your digital wallet and complete comprehensive KYC verification to ensure secure and verified participation in the property registry ecosystem.",
    features: [
      "Multi-factor Authentication",
      "Government ID Verification",
      "Biometric Security",
    ],
  },
  {
    icon: FaFileSignature,
    title: "Digital Deed Registration",
    description:
      "Register property deeds on the blockchain with multi-signature verification from government departments including surveyors, notaries, and IVSL officials.",
    features: [
      "Multi-Signature Approval",
      "Document Encryption",
      "Instant Verification",
    ],
  },
  {
    icon: FaCubes,
    title: "Property Tokenization",
    description:
      "Convert deeds into NFTs for complete ownership or create fractional tokens (FTs) to enable shared investment and improved liquidity.",
    features: ["NFT Minting", "Fractional Ownership", "Smart Contract Creation"],
  },
  {
    icon: FaShieldAlt,
    title: "Escrow-Based Transactions",
    description:
      "All property transfers are secured through smart contract escrows, ensuring safe and transparent transactions with QR code verification.",
    features: ["Automated Escrow", "Fund Protection", "QR Verification"],
  },
  {
    icon: FaExchangeAlt,
    title: "Marketplace Trading",
    description:
      "Buy, sell, or trade tokenized property deeds in a secure marketplace with real-time transaction monitoring and status updates.",
    features: ["Real-time Trading", "Price Discovery", "Liquidity Pools"],
  },
  {
    icon: FaChartPie,
    title: "Portfolio Management",
    description:
      "Track your property portfolio, view ownership history, manage fractional investments, and access interactive location mapping.",
    features: ["Analytics Dashboard", "ROI Tracking", "Performance Reports"],
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="relative py-16 px-4 md:px-10 bg-gradient-to-b from-green-50 via-white to-emerald-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-wall.png')] opacity-30 pointer-events-none"></div>

      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-green-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-emerald-300/40 rounded-full blur-3xl"></div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-3">
            How DeedLink Works
          </h2>
          <p className="text-gray-700 text-lg max-w-xl mx-auto">
            A seamless six-step process to revolutionize property ownership
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-green-200 via-green-400 to-green-600"></div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative flex items-center mb-8 ${
                idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              <div
                className={`w-full md:w-5/12 ${
                  idx % 2 === 0 ? "md:text-right md:pr-8" : "md:pl-8"
                }`}
              >
                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-green-100 shadow-sm hover:shadow-lg transition">
                  <div
                    className={`flex items-center gap-2 mb-3 ${
                      idx % 2 === 0 ? "md:justify-end" : ""
                    }`}
                  >
                    <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-base">
                      {idx + 1}
                    </div>
                    <step.icon className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 mb-3 leading-relaxed text-sm md:text-base">
                    {step.description}
                  </p>
                  <div
                    className={`flex flex-wrap gap-2 ${
                      idx % 2 === 0 ? "md:justify-end" : ""
                    }`}
                  >
                    {step.features.map((feature, fidx) => (
                      <span
                        key={fidx}
                        className="bg-green-50 px-2.5 py-0.5 rounded-full text-xs font-medium text-green-700 border border-green-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white border-4 border-green-600 rounded-full items-center justify-center z-10 shadow-md">
                <step.icon className="text-green-600 text-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
