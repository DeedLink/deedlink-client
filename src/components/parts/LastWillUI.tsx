import { useEffect, useState } from "react";
import type { Certificate } from "../../types/certificate";
import { getCertificatesByTokenId } from "../../api/api";
import { shortAddress } from "../../utils/format";

type Props = {
  tokenId: number;
};

const LastWillUI = ({ tokenId }: Props) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        setLoading(true);
        const res = await getCertificatesByTokenId(tokenId);
        //console.log("Fetched certificate:", res);
        setCertificate(res);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [tokenId]);

  if (loading) return <div>Loading certificate...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!certificate) return <div>No certificate found</div>;

  return (
    <div className="p-4 text-black">
      <h2 className="text-xl font-bold">Last Will Certificate</h2>

      <div className="mt-4">
        <p><strong>Title:</strong> {certificate.title}</p>
        <p><strong>Description:</strong> {certificate.description}</p>
        <p><strong>Type:</strong> {certificate.type}</p>

        <h3 className="text-lg font-semibold mt-4">Parties</h3>
        {certificate.parties?.length ? (
          certificate.parties.map((p, i) => (
            <div key={i} className="border p-2 mt-2 rounded">
              <p><strong>Name:</strong> {p.name}</p>
              <p><strong>Role:</strong> {p.role}</p>
              <p><strong>Contact:</strong> {shortAddress(p.contact)}</p>
            </div>
          ))
        ) : (
          <p>No parties listed</p>
        )}

        <h3 className="text-lg font-semibold mt-4">Data</h3>
        <pre className="bg-gray-100 p-2 rounded mt-1">
          {JSON.stringify(certificate.data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default LastWillUI;
