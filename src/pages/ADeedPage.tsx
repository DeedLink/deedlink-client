import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useToast } from "../contexts/ToastContext";
import { useLoader } from "../contexts/LoaderContext";
import DeedActionBar from "../components/adeed/deedActionBar";
import TitleHistory from "../components/parts/TitleHistory";
import { deleteCertificate, deleteMarketPlacesById, getCertificatesByTokenId } from "../api/api";
import { useDeedData } from "../hooks/useDeedData";
import MarketplaceBanner from "../components/adeed/ui/MarketplaceBanner";
import DeedHeader from "../components/adeed/ui/DeedHeader";
import OwnerInformation from "../components/adeed/ui/OwnerInformation";
import BlockchainOwners from "../components/adeed/ui/BlockchainOwners";
import LandDetails from "../components/adeed/ui/LandDetails";
import BoundaryDeeds from "../components/adeed/ui/BoundaryDeeds";
import DeedSidebar from "../components/adeed/ui/DeedSidebar";
import DeedModals from "../components/adeed/ui/DeedModals";
import CreateListingPopup from "../components/marketplace-components/CreateListingPopup";
import FractionalOwnershipCard from "../components/adeed/ui/FractionalOwnershipCard";
import TransferFractionalTokensPopup from "../components/adeed/tnxPopups/TransferFractionalTokensPopup";
import FractionalizePopup from "../components/adeed/tnxPopups/FractionalizePopup";
import DefractionalizePopup from "../components/adeed/tnxPopups/DefractionalizePopup";
import PendingEscrowBanner from "../components/adeed/ui/PendingEscrowBanner";
import type { Certificate } from "../types/certificate";
import { cancelListing } from "../web3.0/marketService";
import { generateDeedPDF } from "../utils/generateDeedPDF";
import { normalizeCertificateResponse } from "../utils/certificateHelpers";

const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;

const ADeedPage = () => {
  const { deedNumber } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  const {
    deed,
    plan,
    signatures,
    numberOfFT,
    tnx,
    marketPlaceData,
    getMarketPlaceData
  } = useDeedData(deedNumber);

  const [openTransact, setOpenTransact] = useState(false);
  const [openDirectTransfer, setOpenDirectTransfer] = useState(false);
  const [openSaleEscrow, setOpenSaleEscrow] = useState(false);
  const [openGiveRent, setOpenGiveRent] = useState(false);
  const [openGetRent, setOpenGetRent] = useState(false);
  const [openMarket, setOpenMarket] = useState(false);
  const [openLastWill, setOpenLastWill] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [openTransferFractional, setOpenTransferFractional] = useState(false);
  const [openFractionalize, setOpenFractionalize] = useState(false);
  const [openDefractionalize, setOpenDefractionalize] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [ownershipRefreshTrigger, setOwnershipRefreshTrigger] = useState(0);
  const [selectedEscrowAddress, setSelectedEscrowAddress] = useState<string | undefined>(undefined);
  const openMarketplaceListings = Array.isArray(marketPlaceData)
    ? marketPlaceData.filter((listing) => listing.status === "open_to_sale")
    : [];
  const hasOpenMarketplaceListings = openMarketplaceListings.length > 0;

  useEffect(() => {
    const loadCertificate = async () => {
      if (!deed?.tokenId) return;
      try {
        const res = await getCertificatesByTokenId(deed.tokenId);
        setCertificate(normalizeCertificateResponse(res));
      } catch {
        setCertificate(null);
      }
    };
    loadCertificate();
  }, [deed?.tokenId]);

  useEffect(() => {
    if (openTransact || openDirectTransfer || openSaleEscrow || openGiveRent || openGetRent || openMarket || openLastWill || showCreateListing) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [openTransact, openDirectTransfer, openSaleEscrow, openGiveRent, openGetRent, openMarket, openLastWill, showCreateListing]);

  const handleFractionalize = () => {
    if (!deed?.tokenId || !deed?._id) {
      showToast("Fractionalization failed! No token ID", "error");
      return;
    }
    setOpenFractionalize(true);
  };

  const handleFractionalizeSuccess = () => {
    setOwnershipRefreshTrigger(prev => prev + 1);
    getMarketPlaceData();
  };

  const handleDownload = async () => {
    if (!deed) {
      showToast("Deed information not available", "error");
      return;
    }
    try {
      showLoader();
      await generateDeedPDF(deed, plan, signatures, tnx);
      showToast("PDF downloaded successfully", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Failed to generate PDF", "error");
    } finally {
      hideLoader();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Deed #${deed?.deedNumber}`,
        text: `Check out this property deed`,
        url: window.location.href,
      }).catch(() => {
        showToast("Sharing cancelled", "info");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard", "success");
    }
  };

  const handleViewBlockchain = () => {
    showToast("Blockchain explorer coming soon", "info");
  };

  const handleRemoveMarketListing = async (marketId: string, listingId: string) => {
    try {
      showLoader();
      
      const cancelResult = await cancelListing(Number(listingId));
      
      if (cancelResult.success) {
        await deleteMarketPlacesById(marketId);
        showToast("Listing removed successfully", "success");
        await getMarketPlaceData();
        
        if (openDefractionalize) {
          setOpenDefractionalize(false);
          setTimeout(() => setOpenDefractionalize(true), 500);
        }
      } else {
        showToast("Failed to cancel listing on blockchain", "error");
      }
    } catch (error: any) {
      console.error("Error removing marketplace listing:", error);
      showToast(error.message || "Failed to remove listing", "error");
    } finally {
      hideLoader();
    }
  };

  const handleMarketplaceClose = () => {
    setOpenMarket(false);
    getMarketPlaceData();
  };

  const handleCreateListing = () => {
    if (!deed?.tokenId) {
      showToast("Cannot create listing: No token ID", "error");
      return;
    }
    setShowCreateListing(true);
  };

  const handleCreateListingSuccess = () => {
    getMarketPlaceData();
    setOwnershipRefreshTrigger(prev => prev + 1);
  };

  const handleCancelLastWill = async () => {
    if (!certificate) return;
    try {
      showLoader();
      await deleteCertificate(certificate._id);
      setCertificate(null);
      showToast("Last Will cancelled successfully", "success");
      setOpenLastWill(false);
    } catch (error) {
      console.error("Error cancelling last will:", error);
      showToast("Failed to cancel last will", "error");
    } finally {
      hideLoader();
    }
  };

  if (!deed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-semibold text-gray-700">Loading deed information...</p>
          <p className="text-gray-500">If this takes too long, the deed may not exist or there may be a connection issue.</p>
          <button
            onClick={() => navigate("/deeds")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Go to Deeds Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 relative">
      <div className="flex max-w-boundary mx-auto w-full min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-full w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium mb-6 transition"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          {deed?._id && (
            <div className="lg:hidden mb-6 w-full">
              <PendingEscrowBanner 
                deedId={deed._id}
                onOpenEscrow={(escrowAddress) => {
                  setSelectedEscrowAddress(escrowAddress);
                  setOpenSaleEscrow(true);
                }}
              />
            </div>
          )}
          {hasOpenMarketplaceListings && (
            <div className="lg:hidden mb-6 w-full">
              <MarketplaceBanner 
                marketPlaceData={marketPlaceData} 
                onRemoveListing={handleRemoveMarketListing}
              />
            </div>
          )}
          {!hasOpenMarketplaceListings && (
            <div className="lg:hidden mb-6 w-full flex justify-center">
              <DeedActionBar
                onFractioning={handleFractionalize}
                onDefractionalize={() => setOpenDefractionalize(true)}
                deedNumber={deed.deedNumber}
                deedId={deed._id}
                tokenId={deed.tokenId}
                actionHappened={openDirectTransfer || openSaleEscrow || openTransact}
                onTransfer={() => setOpenTransact(true)}
                onDirectTransfer={() => setOpenDirectTransfer(true)}
                onSaleEscrow={() => setOpenSaleEscrow(true)}
                onDownload={handleDownload}
                onShare={handleShare}
                onViewBlockchain={handleViewBlockchain}
                onOpenMarket={handleCreateListing}
                numberOfFT={numberOfFT}
                onRent={() => setOpenGiveRent(true)}
                onPowerOfAttorney={() => {}}
                certificateExists={!!certificate}
                onCancelCertificate={handleCancelLastWill}
                onLastWill={() => setOpenLastWill(true)}
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <DeedHeader deed={deed} numberOfFT={numberOfFT} />

            <div className="p-6">
              <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  {hasOpenMarketplaceListings && (
                    <MarketplaceBanner 
                      marketPlaceData={marketPlaceData} 
                      onRemoveListing={handleRemoveMarketListing}
                    />
                  )}
                  <OwnerInformation deed={deed} />
                  {deed.tokenId && (
                    <FractionalOwnershipCard
                      tokenId={deed.tokenId}
                      onTransfer={() => setOpenTransferFractional(true)}
                      refreshTrigger={ownershipRefreshTrigger}
                    />
                  )}
                  <BlockchainOwners deed={deed} />
                  <LandDetails deed={deed} />
                  <BoundaryDeeds plan={plan} />
                  <TitleHistory tnx={tnx} />
                </div>

                <DeedSidebar deed={deed} plan={plan} signatures={signatures} />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block py-14 min-h-full pt-20 max-w-full mx-auto lg:sticky lg:top-24 lg:h-fit">
          {deed?._id && (
            <PendingEscrowBanner 
              deedId={deed._id}
              onOpenEscrow={(escrowAddress) => {
                setSelectedEscrowAddress(escrowAddress);
                setOpenSaleEscrow(true);
              }}
            />
          )}
          <MarketplaceBanner 
            marketPlaceData={marketPlaceData} 
            onRemoveListing={handleRemoveMarketListing}
          />
          {!hasOpenMarketplaceListings && (
            <DeedActionBar
              onFractioning={handleFractionalize}
              onDefractionalize={() => setOpenDefractionalize(true)}
              deedNumber={deed.deedNumber}
              deedId={deed._id}
              tokenId={deed.tokenId}
              actionHappened={openDirectTransfer || openSaleEscrow || openTransact}
              onTransfer={() => setOpenTransact(true)}
              onDirectTransfer={() => setOpenDirectTransfer(true)}
              onSaleEscrow={() => setOpenSaleEscrow(true)}
              onDownload={handleDownload}
              onShare={handleShare}
              onViewBlockchain={handleViewBlockchain}
              onOpenMarket={handleCreateListing}
              numberOfFT={numberOfFT}
              onRent={() => setOpenGiveRent(true)}
              onPowerOfAttorney={() => {}}
              certificateExists={!!certificate}
              onCancelCertificate={handleCancelLastWill}
              onLastWill={() => setOpenLastWill(true)}
            />
          )}
        </div>
      </div>

      <DeedModals
        deed={deed}
        openTransact={openTransact}
        openDirectTransfer={openDirectTransfer}
        openSaleEscrow={openSaleEscrow}
        openGiveRent={openGiveRent}
        openGetRent={openGetRent}
        openMarket={openMarket}
        openLastWill={openLastWill}
        onCloseTransact={() => setOpenTransact(false)}
        onCloseDirectTransfer={() => setOpenDirectTransfer(false)}
        onCloseSaleEscrow={() => {
          setOpenSaleEscrow(false);
          setSelectedEscrowAddress(undefined);
        }}
        initialEscrowAddress={selectedEscrowAddress}
        onCloseGiveRent={() => setOpenGiveRent(false)}
        onCloseGetRent={() => setOpenGetRent(false)}
        onCloseMarket={handleMarketplaceClose}
        onCloseLastWill={() => setOpenLastWill(false)}
      />

      {deed.tokenId && (
        <>
          <CreateListingPopup
            isOpen={showCreateListing}
            onClose={() => setShowCreateListing(false)}
            onSuccess={handleCreateListingSuccess}
            deedId={deed._id}
            tokenId={deed.tokenId}
            nftAddress={PROPERTY_NFT_ADDRESS}
          />
          <TransferFractionalTokensPopup
            isOpen={openTransferFractional}
            onClose={() => setOpenTransferFractional(false)}
            tokenId={deed.tokenId}
            deedId={deed._id}
            onSuccess={() => {
              setOpenTransferFractional(false);
              setOwnershipRefreshTrigger(prev => prev + 1);
            }}
          />
          <FractionalizePopup
            isOpen={openFractionalize}
            onClose={() => setOpenFractionalize(false)}
            tokenId={deed.tokenId}
            deedId={deed._id}
            deedNumber={deed.deedNumber}
            onSuccess={handleFractionalizeSuccess}
          />
          <DefractionalizePopup
            isOpen={openDefractionalize}
            onClose={() => setOpenDefractionalize(false)}
            tokenId={deed.tokenId}
            deedId={deed._id}
            onSuccess={() => {
              setOwnershipRefreshTrigger(prev => prev + 1);
              getMarketPlaceData();
            }}
          />
        </>
      )}
    </div>
  );
};

export default ADeedPage;