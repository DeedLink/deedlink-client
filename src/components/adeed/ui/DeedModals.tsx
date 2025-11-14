import type { IDeed } from "../../../types/responseDeed";
import AddToMarketPopup from "../tnxPopups/AddToMarketPopup";
import { DirectTransferPopup } from "../tnxPopups/DirectTransferPopup";
import GetRentPopup from "../tnxPopups/GetRentPopup";
import GiveRentPopup from "../tnxPopups/GiveRentPopup";
import SaleEscrowPopup from "../tnxPopups/SaleEscrowPopup";
import SetLastWillPopup from "../tnxPopups/SetLastWillPopup";
import TransactPopup from "../transactPopup";

interface DeedModalsProps {
  deed: IDeed;
  openTransact: boolean;
  openDirectTransfer: boolean;
  openSaleEscrow: boolean;
  openGiveRent: boolean;
  openGetRent: boolean;
  openMarket: boolean;
  openLastWill: boolean;
  onCloseTransact: () => void;
  onCloseDirectTransfer: () => void;
  onCloseSaleEscrow: () => void;
  onCloseGiveRent: () => void;
  onCloseGetRent: () => void;
  onCloseMarket: () => void;
  onCloseLastWill: () => void;
}

const DeedModals = ({
  deed,
  openTransact,
  openDirectTransfer,
  openSaleEscrow,
  openGiveRent,
  openGetRent,
  openMarket,
  openLastWill,
  onCloseTransact,
  onCloseDirectTransfer,
  onCloseSaleEscrow,
  onCloseGiveRent,
  onCloseGetRent,
  onCloseMarket,
  onCloseLastWill
}: DeedModalsProps) => {
  return (
    <>
      {openTransact && deed.tokenId && (
        <TransactPopup deedId={deed._id} tokenId={deed.tokenId} isOpen={openTransact} onClose={onCloseTransact} />
      )}
      {openDirectTransfer && deed.tokenId && (
        <DirectTransferPopup deedId={deed._id} tokenId={deed.tokenId} isOpen={openDirectTransfer} onClose={onCloseDirectTransfer} />
      )}
      {openSaleEscrow && deed.tokenId && (
        <SaleEscrowPopup deedId={deed._id} tokenId={deed.tokenId} isOpen={openSaleEscrow} onClose={onCloseSaleEscrow} />
      )}
      {openGiveRent && deed.tokenId && (
        <GiveRentPopup isOpen={openGiveRent} tokenId={deed.tokenId} onClose={onCloseGiveRent} />
      )}
      {openGetRent && deed.tokenId && (
        <GetRentPopup isOpen={openGetRent} tokenId={deed.tokenId} onClose={onCloseGetRent} />
      )}
      {openMarket && deed.tokenId && (
        <AddToMarketPopup deed={deed} isOpen={openMarket} tokenId={deed.tokenId} onClose={onCloseMarket} />
      )}
      {openLastWill && deed.tokenId && deed.deedNumber && (
        <SetLastWillPopup isOpen={openLastWill} onClose={onCloseLastWill} tokenId={deed.tokenId} deedNumber={deed.deedNumber} />
      )}
    </>
  );
};

export default DeedModals;