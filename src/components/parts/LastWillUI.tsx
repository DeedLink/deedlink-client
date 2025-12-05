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

  if (loading) return <div>{t("adeedPage.loadingCertificate")}</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!certificate) return <div className="text-gray-500">{t("adeedPage.noLastWillCertificate")}</div>;

  return (
    <div className="p-4 text-black">
      <h2 className="text-xl font-bold">{t("adeedPage.lastWillCertificate")}</h2>

      <div className="mt-4">
        {certificate.title ? <p><strong>{t("adeedPage.title")}:</strong> {certificate.title}</p> : null}
        {certificate.description ? <p><strong>{t("adeedPage.description")}:</strong> {certificate.description}</p> : null}
        {certificate.type ? <p><strong>{t("adeedPage.type")}:</strong> {certificate.type}</p> : null}

        <h3 className="text-lg font-semibold mt-4">{t("adeedPage.parties")}</h3>
        {certificate.parties?.length ? (
          certificate.parties.map((p, i) => (
            <div key={i} className="border p-2 mt-2 rounded">
              <p><strong>{t("adeedPage.name")}:</strong> {p.name}</p>
              <p><strong>{t("adeedPage.role")}:</strong> {p.role}</p>
              <p><strong>{t("adeedPage.contact")}:</strong> {shortAddress(p.contact)}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">{t("adeedPage.noPartiesListed")}</p>
        )}

        <h3 className="text-lg font-semibold mt-4">{t("adeedPage.data")}</h3>
        {certificate.data && typeof certificate.data === 'object' && Object.keys(certificate.data).length > 0 ? (
          <pre className="bg-gray-100 p-2 rounded mt-1">
            {JSON.stringify(certificate.data, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">{t("adeedPage.noAdditionalData")}</p>
        )}
      </div>
    </div>
  );
};

export default LastWillUI;
