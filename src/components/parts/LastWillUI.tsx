import { useEffect, useState } from "react";
import type { Certificate } from "../../types/certificate";
import { getCertificatesByTokenId } from "../../api/api";
import { normalizeCertificateResponse } from "../../utils/certificateHelpers";
import { shortAddress } from "../../utils/format";
import { useLanguage } from "../../contexts/LanguageContext";

type Props = {
  tokenId: number;
};

const LastWillUI = ({ tokenId }: Props) => {
  const { t } = useLanguage();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        setLoading(true);
        const res = await getCertificatesByTokenId(tokenId);
        setCertificate(normalizeCertificateResponse(res));
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [tokenId]);

  if (loading) return <div className="p-4 text-center text-gray-600">{t("messages.loadingCertificate")}</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;
  if (!certificate) return <div className="p-4 text-gray-500 text-center">{t("messages.noLastWillCertificate")}</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-emerald-200">
        {t("messages.lastWillCertificate")}
      </h2>

      <div className="space-y-5">
        {certificate.title && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{t("messages.title")}</p>
            <p className="text-base font-medium text-gray-900">{certificate.title}</p>
          </div>
        )}
        {certificate.description && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{t("messages.description")}</p>
            <p className="text-base text-gray-900 leading-relaxed">{certificate.description}</p>
          </div>
        )}
        {certificate.type && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{t("messages.type")}</p>
            <p className="text-base font-medium text-gray-900">{certificate.type}</p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-200">{t("messages.parties")}</h3>
          {certificate.parties?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificate.parties.map((p, i) => (
                <div key={i} className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">{t("messages.name")}:</strong> 
                    <span className="text-gray-900 font-semibold ml-2">{p.name}</span>
                  </p>
                  <p className="mb-2">
                    <strong className="text-gray-700 text-sm">{t("messages.role")}:</strong> 
                    <span className="text-gray-900 capitalize font-medium ml-2">{p.role}</span>
                  </p>
                  <p>
                    <strong className="text-gray-700 text-sm">{t("messages.contact")}:</strong> 
                    <span className="text-gray-900 font-mono text-sm ml-2">{shortAddress(p.contact)}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-4">{t("messages.noPartiesListed")}</p>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-emerald-200">{t("messages.data")}</h3>
          {certificate.data && typeof certificate.data === 'object' && Object.keys(certificate.data).length > 0 ? (
            <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {JSON.stringify(certificate.data, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-4">{t("messages.noAdditionalData")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LastWillUI;
