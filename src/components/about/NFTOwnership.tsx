import React, { useMemo } from "react";
import { FaFileSignature, FaCheckCircle, FaLock, FaGlobe, FaShieldAlt, FaTrophy, FaBuilding, FaIndustry, FaHome } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const NFTOwnership: React.FC = () => {
  const { t } = useLanguage();
  
  const benefits = useMemo(() => [
    t("about.ownershipModels.nftBenefit1"),
    t("about.ownershipModels.nftBenefit2"),
    t("about.ownershipModels.nftBenefit3"),
    t("about.ownershipModels.nftBenefit4"),
    t("about.ownershipModels.nftBenefit5"),
    t("about.ownershipModels.nftBenefit6")
  ], [t]);

  const properties = useMemo(() => [
    { name: t("about.ownershipModels.landDeed"), icon: FaBuilding, price: '$450K' },
    { name: t("about.ownershipModels.commercial"), icon: FaIndustry, price: '$1.2M' },
    { name: t("about.ownershipModels.residential"), icon: FaHome, price: '$320K' }
  ], [t]);

  const features = useMemo(() => [
    { icon: FaLock, title: t("about.ownershipModels.nftFeature1Title"), desc: t("about.ownershipModels.nftFeature1Desc") },
    { icon: FaGlobe, title: t("about.ownershipModels.nftFeature2Title"), desc: t("about.ownershipModels.nftFeature2Desc") },
    { icon: FaShieldAlt, title: t("about.ownershipModels.nftFeature3Title"), desc: t("about.ownershipModels.nftFeature3Desc") },
    { icon: FaTrophy, title: t("about.ownershipModels.nftFeature4Title"), desc: t("about.ownershipModels.nftFeature4Desc") }
  ], [t]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-600 p-3 rounded-lg">
            <FaFileSignature className="text-white text-2xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-green-900">{t("about.ownershipModels.nftTitle")}</h3>
            <p className="text-green-600">{t("about.ownershipModels.nftSubtitle")}</p>
          </div>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-6">
          {t("about.ownershipModels.nftDescription")}
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
        <h4 className="text-2xl font-bold mb-6">{t("about.ownershipModels.nftKeyFeatures")}</h4>
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