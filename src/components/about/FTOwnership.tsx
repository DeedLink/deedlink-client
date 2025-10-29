import React from "react";
import { FaCubes, FaCheckCircle, FaCoins, FaChartLine, FaUsers, FaClock } from "react-icons/fa";

const FTOwnership: React.FC = () => {
  const benefits = [
    'Lower investment barriers',
    'Enhanced market liquidity',
    'Portfolio diversification',
    'Proportional rental income',
    'Collaborative ownership',
    'Automated dividend distribution'
  ];

  const fractions = [
    { share: '25%', tokens: '2,500', price: '$125K' },
    { share: '40%', tokens: '4,000', price: '$200K' },
    { share: '10%', tokens: '1,000', price: '$50K' }
  ];

  const investmentBenefits = [
    { icon: FaCoins, title: 'Micro-Investment', desc: 'Start with as little as $1,000' },
    { icon: FaChartLine, title: 'High Liquidity', desc: 'Trade tokens on marketplace' },
    { icon: FaUsers, title: 'Shared Risk', desc: 'Distribute investment risk' },
    { icon: FaClock, title: 'Passive Income', desc: 'Automatic rental dividends' }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-600 p-3 rounded-lg">
            <FaCubes className="text-white text-2xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-green-900">Fractional Token Investment</h3>
            <p className="text-green-600">Democratized Ownership</p>
          </div>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-6">
          Fractional Tokens (FTs) enable property ownership to be divided into multiple shares, democratizing real estate investment. Each token represents a percentage stake with proportional rights and returns.
        </p>

        <div className="space-y-4 mb-6">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <FaCheckCircle className="text-green-600 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {fractions.map((fraction, idx) => (
            <div 
              key={idx} 
              className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl p-4 text-center hover:shadow-lg transition group cursor-pointer"
            >
              <div className="bg-white rounded-lg p-4 mb-3 group-hover:scale-110 transition">
                <FaCoins className="text-green-600 text-3xl mx-auto" />
              </div>
              <h4 className="font-bold text-green-900 text-lg mb-1">{fraction.share}</h4>
              <p className="text-gray-600 text-xs mb-1">{fraction.tokens} tokens</p>
              <p className="text-green-600 font-bold text-xs">{fraction.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl p-8 text-white shadow-xl">
        <h4 className="text-2xl font-bold mb-6">Investment Benefits</h4>
        <div className="space-y-6">
          {investmentBenefits.map((benefit, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition"
            >
              <benefit.icon className="text-3xl flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-lg mb-1">{benefit.title}</h5>
                <p className="text-green-100 text-sm">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FTOwnership;