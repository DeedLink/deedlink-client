import React from "react";
import { FaFileSignature, FaCheckCircle, FaLock, FaGlobe, FaShieldAlt, FaTrophy, FaBuilding, FaIndustry, FaHome } from "react-icons/fa";

const NFTOwnership: React.FC = () => {
  const benefits = [
    'Complete ownership rights',
    'Cryptographic verification',
    'Fraud elimination',
    'Direct peer-to-peer transfers',
    'Immutable ownership history',
    'No intermediaries required'
  ];

  const properties = [
    { name: 'Land Deed', icon: FaBuilding, price: '$450K' },
    { name: 'Commercial', icon: FaIndustry, price: '$1.2M' },
    { name: 'Residential', icon: FaHome, price: '$320K' }
  ];

  const features = [
    { icon: FaLock, title: 'Immutable Records', desc: 'Permanent blockchain storage' },
    { icon: FaGlobe, title: 'Global Access', desc: 'Trade anywhere, anytime' },
    { icon: FaShieldAlt, title: 'Legal Protection', desc: 'Full legal recognition' },
    { icon: FaTrophy, title: 'Asset Proof', desc: 'Verifiable ownership' }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-600 p-3 rounded-lg">
            <FaFileSignature className="text-white text-2xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-green-900">NFT Deed Ownership</h3>
            <p className="text-green-600">Complete & Indivisible</p>
          </div>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-6">
          Each property deed is minted as a unique Non-Fungible Token (NFT) on the blockchain, representing complete and indivisible ownership. These immutable digital certificates provide cryptographic proof of ownership.
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
          {properties.map((property, idx) => (
            <div 
              key={idx} 
              className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 text-center hover:shadow-lg transition group cursor-pointer"
            >
              <div className="bg-white rounded-lg p-4 mb-3 group-hover:scale-110 transition">
                <property.icon className="text-green-600 text-3xl mx-auto" />
              </div>
              <h4 className="font-semibold text-green-900 text-sm mb-1">{property.name}</h4>
              <p className="text-green-600 font-bold text-xs">{property.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 text-white shadow-xl">
        <h4 className="text-2xl font-bold mb-6">Key Features</h4>
        <div className="space-y-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition"
            >
              <feature.icon className="text-3xl flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-lg mb-1">{feature.title}</h5>
                <p className="text-green-100 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NFTOwnership;