import React from "react";
import { FaLock, FaShieldAlt, FaGlobe } from "react-icons/fa";

const TechnicalArchitecture: React.FC = () => {
  const layers = [
    {
      title: 'Blockchain Layer',
      icon: FaLock,
      color: 'from-green-500 to-emerald-600',
      features: ['Ethereum Compatible', 'Smart Contracts', 'Consensus Protocol', 'Immutable Ledger']
    },
    {
      title: 'Security Layer',
      icon: FaShieldAlt,
      color: 'from-emerald-500 to-green-600',
      features: ['End-to-End Encryption', 'Multi-Sig Wallets', 'Audit Trail', 'KYC/AML Compliance']
    },
    {
      title: 'Application Layer',
      icon: FaGlobe,
      color: 'from-green-600 to-emerald-700',
      features: ['Web3 Integration', 'RESTful APIs', 'Real-time Updates', 'Mobile Support']
    }
  ];

  return (
    <section className="py-20 px-6 md:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">Technical Architecture</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Built on enterprise-grade blockchain infrastructure</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {layers.map((layer, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl border-2 border-green-100 hover:border-green-300 transition shadow-lg hover:shadow-2xl p-8"
            >
              <div className={`bg-gradient-to-br ${layer.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                <layer.icon className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-4">{layer.title}</h3>
              <ul className="space-y-3">
                {layer.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnicalArchitecture;