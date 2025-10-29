import React from "react";
import { FaFileSignature, FaCubes, FaChartPie, FaShieldAlt, FaUserCheck, FaExchangeAlt } from "react-icons/fa";

const steps = [
  {
    icon: FaUserCheck,
    title: "Secure Authentication & KYC",
    description: "Connect your digital wallet and complete comprehensive KYC verification to ensure secure and verified participation in the property registry ecosystem.",
    features: ["Multi-factor Authentication", "Government ID Verification", "Biometric Security"]
  },
  {
    icon: FaFileSignature,
    title: "Digital Deed Registration",
    description: "Register property deeds on the blockchain with multi-signature verification from government departments including surveyors, notaries, and IVSL officials.",
    features: ["Multi-Signature Approval", "Document Encryption", "Instant Verification"]
  },
  {
    icon: FaCubes,
    title: "Property Tokenization",
    description: "Convert deeds into NFTs for complete ownership or create fractional tokens (FTs) to enable shared investment and improved liquidity.",
    features: ["NFT Minting", "Fractional Ownership", "Smart Contract Creation"]
  },
  {
    icon: FaShieldAlt,
    title: "Escrow-Based Transactions",
    description: "All property transfers are secured through smart contract escrows, ensuring safe and transparent transactions with QR code verification.",
    features: ["Automated Escrow", "Fund Protection", "QR Verification"]
  },
  {
    icon: FaExchangeAlt,
    title: "Marketplace Trading",
    description: "Buy, sell, or trade tokenized property deeds in a secure marketplace with real-time transaction monitoring and status updates.",
    features: ["Real-time Trading", "Price Discovery", "Liquidity Pools"]
  },
  {
    icon: FaChartPie,
    title: "Portfolio Management",
    description: "Track your property portfolio, view ownership history, manage fractional investments, and access interactive location mapping.",
    features: ["Analytics Dashboard", "ROI Tracking", "Performance Reports"]
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 px-6 md:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">How DeedLink Works</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">A seamless six-step process to revolutionize property ownership</p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-200 via-green-400 to-green-600"></div>

          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className={`relative flex items-center mb-12 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition group">
                  <div className={`flex items-center gap-3 mb-4 ${idx % 2 === 0 ? 'md:justify-end' : ''}`}>
                    <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                      {idx + 1}
                    </div>
                    <step.icon className="text-green-600 text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-3">{step.title}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{step.description}</p>
                  <div className={`flex flex-wrap gap-2 ${idx % 2 === 0 ? 'md:justify-end' : ''}`}>
                    {step.features.map((feature, fidx) => (
                      <span 
                        key={fidx} 
                        className="bg-white px-3 py-1 rounded-full text-xs font-medium text-green-700 border border-green-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white border-4 border-green-600 rounded-full items-center justify-center z-10 shadow-lg">
                <step.icon className="text-green-600 text-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;