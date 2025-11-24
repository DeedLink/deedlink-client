import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Encryting } from "../../utils/encryption";

interface TnxQRProps {
  deedId: string;
  escrowAddress: string;
  seller: string;
  hash: string;
  size?: number;
}

const TnxQR: React.FC<TnxQRProps> = ({
  deedId,
  escrowAddress,
  seller,
  hash,
  size = 200,
}) => {
  const payload = { deedId, escrowAddress, seller, hash };
  const encryptedData = Encryting(payload);

  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-md">
      <QRCodeCanvas
        id="tnx-qr-canvas"
        value={encryptedData}
        size={size}
        includeMargin={true}
      />
      <p className="text-xs text-gray-600 mt-2 break-words text-center">
        {deedId ? `QR for Deed: ${deedId}` : "QR Payload"}
      </p>
    </div>
  );
};

export default TnxQR;
