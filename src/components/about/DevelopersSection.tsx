import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaGlobe, FaUser } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";
import { DEVELOPERS } from "../../constants/const";
import type { Developer } from "../../types/about";

const DevelopersSection: React.FC = () => {
  const { t } = useLanguage();
  const developers: Developer[] = DEVELOPERS;

  if (developers.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-6 md:px-16 bg-gradient-to-br from-gray-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {t("about.developers.title")}
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {t("about.developers.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {developers.map((developer) => (
            <div
              key={developer.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-green-400 transform hover:-translate-y-1 flex flex-col h-full"
            >
              <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-700 p-6 text-center flex-shrink-0">
                <div className="relative inline-block mb-4">
                  {developer.image ? (
                    <img
                      src={developer.image}
                      alt={developer.name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-xl">
                      <FaUser className="text-white text-4xl" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem] flex items-center justify-center px-2">
                  {developer.name}
                </h3>
                <p className="text-green-100 font-medium text-sm min-h-[2.5rem] flex items-center justify-center px-2">
                  {developer.role}
                </p>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <p className="text-gray-700 mb-6 leading-relaxed text-sm text-center flex-grow min-h-[100px] flex items-center">
                  {developer.bio}
                </p>

                <div className="flex justify-center gap-3 mt-auto pt-4 border-t border-gray-200">
                  {developer.github && (
                    <a
                      href={developer.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-green-600 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200"
                      aria-label="GitHub"
                    >
                      <FaGithub />
                    </a>
                  )}
                  {developer.linkedin && (
                    <a
                      href={developer.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-green-600 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200"
                      aria-label="LinkedIn"
                    >
                      <FaLinkedin />
                    </a>
                  )}
                  {developer.email && (
                    <a
                      href={`mailto:${developer.email}`}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-green-600 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200"
                      aria-label="Email"
                    >
                      <FaEnvelope />
                    </a>
                  )}
                  {developer.portfolio && (
                    <a
                      href={developer.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-green-600 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200"
                      aria-label="Portfolio"
                    >
                      <FaGlobe />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DevelopersSection;

