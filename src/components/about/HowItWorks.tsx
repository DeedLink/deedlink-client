import React from "react";
import { FaFileSignature, FaCubes, FaChartPie, FaShieldAlt, FaUserCheck, FaExchangeAlt } from "react-icons/fa";

const steps = [
  {
    icon: <FaUserCheck className="text-green-600 text-3xl mb-3" />,
    title: "Secure Authentication & KYC",
    description: "Connect your digital wallet and complete KYC verification to ensure secure and verified participation in the property registry ecosystem."
  },
  {
    icon: <FaFileSignature className="text-green-600 text-3xl mb-3" />,
    title: "Digital Deed Registration",
    description: "Register property deeds on the blockchain with multi-signature verification from government departments including surveyors, notaries, and IVSL officials."
  },
  {
    icon: <FaCubes className="text-green-600 text-3xl mb-3" />,
    title: "Property Tokenization",
    description: "Convert deeds into NFTs for complete ownership or create fractional tokens (FTs) to enable shared investment and improved liquidity."
  },
  {
    icon: <FaShieldAlt className="text-green-600 text-3xl mb-3" />,
    title: "Escrow-Based Transactions",
    description: "All property transfers are secured through smart contract escrows, ensuring safe and transparent transactions with QR code verification."
  },
  {
    icon: <FaExchangeAlt className="text-green-600 text-3xl mb-3" />,
    title: "Marketplace Trading",
    description: "Buy, sell, or trade tokenized property deeds in a secure marketplace with real-time transaction monitoring and status updates."
  },
  {
    icon: <FaChartPie className="text-green-600 text-3xl mb-3" />,
    title: "Portfolio Management",
    description: "Track your property portfolio, view ownership history, manage fractional investments, and access interactive location mapping."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 px-6 md:px-16 bg-white">
      <h2 className="text-3xl font-bold text-green-900 text-center mb-10">How DeedLink Works</h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100 hover:shadow-lg transition">
            <div className="flex justify-center">{step.icon}</div>
            <h3 className="font-semibold text-lg text-center mb-2 text-green-900">{step.title}</h3>
            <p className="text-gray-700 text-sm text-center leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;