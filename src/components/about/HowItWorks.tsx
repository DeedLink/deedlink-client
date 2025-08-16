import React from "react";
import { FaFileSignature, FaCubes, FaChartPie } from "react-icons/fa";

const steps = [
  {
    icon: <FaFileSignature className="text-green-700 text-4xl mb-4" />,
    title: "Digital Deed Creation",
    description: "Physical property deeds are converted into unique blockchain tokens (NFTs), creating tamper-proof digital ownership records."
  },
  {
    icon: <FaCubes className="text-green-700 text-4xl mb-4" />,
    title: "Fractional Ownership",
    description: "Deeds can be divided into fractional tokens (FTs) allowing multiple stakeholders to own portions of the property, improving liquidity and investment accessibility."
  },
  {
    icon: <FaChartPie className="text-green-700 text-4xl mb-4" />,
    title: "Trading & Transparency",
    description: "NFTs and FTs can be securely traded on-chain. All transactions are transparent, immutable, and verifiable, ensuring complete trust."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 px-6 md:px-16">
      <h2 className="text-4xl font-bold text-[#00420A] text-center mb-12">How Deed Tokenization Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
            <div className="flex justify-center">{step.icon}</div>
            <h3 className="font-semibold text-xl text-center mb-2">{step.title}</h3>
            <p className="text-gray-600 text-center">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
