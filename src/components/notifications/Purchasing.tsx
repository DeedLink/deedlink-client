import { useEffect, useState } from 'react';
import BuyerEscrowPopup from '../adeed/tnxPopups/BuyerEscrowPopup';

function PurchancePanel() {
  const [selectedEscrow, setSelectedEscrow] = useState<string | null>(null);
  const [deedId, setDeedId] = useState<string>("");

  useEffect(() => {
      if (selectedEscrow) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    }, [selectedEscrow]);

  const notifications = [
    {
      id: 1,
      message: "John wants to sell you property #5",
      escrowAddress: "0xA437aF2154303182D563877b215Fac7853258981",
      seller: "John Doe",
      deedId: "68ee3f81d9277e0ee7f77c89"
    }
  ];

  return (
    <div>
      {notifications.map((notif) => (
        <div key={notif.id} className="w-full flex justify-between items-center">
          <p>{notif.message}</p>
          <button
            onClick={() => {
              setSelectedEscrow(notif.escrowAddress);
              setDeedId(notif.deedId);
            }}
            className="text-blue-600"
          >
            View Purchase
          </button>
        </div>
      ))}

      {selectedEscrow && (
        <div className='fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm'>
            <BuyerEscrowPopup
              isOpen={!!selectedEscrow}
              escrowAddress={selectedEscrow}
              deedId={deedId}
              onClose={() => setSelectedEscrow(null)}
            />
        </div>
      )}
    </div>
  );
}

export default PurchancePanel;