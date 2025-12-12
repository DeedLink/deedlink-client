import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useToast } from "../contexts/ToastContext";
import { useLoader } from "../contexts/LoaderContext";
import { useLanguage } from "../contexts/LanguageContext";
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
import QRManagement from "../components/adeed/QRManagement";
import type { Certificate } from "../types/certificate";
import { cancelListing } from "../web3.0/marketService";
import { generateDeedPDF } from "../utils/generateDeedPDF";
import { normalizeCertificateResponse } from "../utils/certificateHelpers";
import { revokeWill } from "../web3.0/lastWillIntegration";

const PROPERTY_NFT_ADDRESS = import.meta.env.VITE_PROPERTY_NFT_ADDRESS as string;

const ADeedPage = () => {
  const { deedNumber } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

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
  const [hasActiveLastWill, setHasActiveLastWill] = useState(false);
  const [ownershipRefreshTrigger, setOwnershipRefreshTrigger] = useState(0);
  const [selectedEscrowAddress, setSelectedEscrowAddress] = useState<string | undefined>(undefined);
  const [openQRManagement, setOpenQRManagement] = useState(false);
  const openMarketplaceListings = Array.isArray(marketPlaceData)
    ? marketPlaceData.filter((listing) => listing.status === "open_to_sale")
    : [];
  const hasOpenMarketplaceListings = openMarketplaceListings.length > 0;

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "escrow" && deed) {
      setOpenSaleEscrow(true);
      navigate(`/deed/${deed.deedNumber}`, { replace: true });
    }
  }, [searchParams, deed, navigate]);

  useEffect(() => {
    const loadCertificate = async () => {
      if (!deed?.tokenId) {
        setCertificate(null);
        setHasActiveLastWill(false);
        return;
      }
      try {
        const res = await getCertificatesByTokenId(deed.tokenId);
        const cert = normalizeCertificateResponse(res);
        setCertificate(cert);
        
        // Check if there's an active last will on blockchain
        try {
          const { hasActiveWill, getWill } = await import("../web3.0/lastWillIntegration");
          const willExists = await hasActiveWill(deed.tokenId);
          if (willExists) {
            const willData = await getWill(deed.tokenId);
            setHasActiveLastWill(willData.isActive && !willData.isExecuted);
          } else {
            setHasActiveLastWill(false);
          }
        } catch (error) {
          console.error("Error checking active last will:", error);
          setHasActiveLastWill(false);
        }
      } catch {
        setCertificate(null);
        setHasActiveLastWill(false);
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
      showToast(t("messages.deedInfoNotAvailable"), "error");
      return;
    }
    try {
      showLoader();
      await generateDeedPDF(deed, plan, signatures, tnx);
      showToast(t("messages.pdfDownloadedSuccessfully"), "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast(t("messages.failedToGeneratePDF"), "error");
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
        showToast(t("messages.sharingCancelled"), "info");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(t("messages.linkCopiedToClipboard"), "success");
    }
  };

  const handleViewBlockchain = () => {
    showToast(t("messages.blockchainExplorerComingSoon"), "info");
  };

  const handleRemoveMarketListing = async (marketId: string, listingId: string) => {
    try {
      showLoader();
      
      const cancelResult = await cancelListing(Number(listingId));
      
      if (cancelResult.success) {
        await deleteMarketPlacesById(marketId);
        showToast(t("messages.listingRemovedSuccessfully"), "success");
        await getMarketPlaceData();
        
        if (openDefractionalize) {
          setOpenDefractionalize(false);
          setTimeout(() => setOpenDefractionalize(true), 500);
        }
      } else {
        showToast(t("messages.failedToCancelListing"), "error");
      }
    } catch (error: any) {
      console.error("Error removing marketplace listing:", error);
      showToast(error.message || t("messages.failedToRemoveListing"), "error");
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
      showToast(t("messages.cannotCreateListing"), "error");
      return;
    }
    if (hasActiveLastWill) {
      showToast(t("messages.cannotSellWithActiveLastWill") || "Cannot sell property with an active Last Will. Please revoke the Last Will first.", "error");
      return;
    }
    setShowCreateListing(true);
  };

  const handleCreateListingSuccess = () => {
    getMarketPlaceData();
    setOwnershipRefreshTrigger(prev => prev + 1);
  };

  const handleCancelLastWill = async () => {
    if (!deed?.tokenId) {
      showToast("Token ID not found", "error");
      return;
    }
    try {
      showLoader();
      
      // First revoke from blockchain
      const revokeResult = await revokeWill(deed.tokenId);
      
      if (!revokeResult.success) {
        throw new Error("Failed to revoke will on blockchain");
      }
      
      // Then delete certificate from API if it exists
      if (certificate?._id) {
        try {
          await deleteCertificate(certificate._id);
        } catch (apiError) {
          console.warn("Failed to delete certificate from API:", apiError);
          // Continue even if API deletion fails, blockchain revocation is more important
        }
      }
      
      setCertificate(null);
      setHasActiveLastWill(false);
      showToast(t("messages.lastWillCancelledSuccessfully"), "success");
      setOpenLastWill(false);
      
      // Refresh the page to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Error cancelling last will:", error);
      const errorMessage = error?.message || error?.reason || t("messages.failedToCancelLastWill");
      showToast(errorMessage, "error");
    } finally {
      hideLoader();
    }
  };

  if (!deed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-semibold text-gray-700">{t("messages.loadingDeedInformation")}</p>
          <p className="text-gray-500">{t("messages.deedMayNotExist")}</p>
          <button
            onClick={() => navigate("/deeds")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {t("messages.goToDeedsPage")}
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
            <span>{t("common.back")}</span>
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
                onQRCode={() => setOpenQRManagement(true)}
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
              onDirectTransfer={() => {
                if (hasActiveLastWill) {
                  showToast(t("messages.cannotSellWithActiveLastWill") || "Cannot transfer property with an active Last Will. Please revoke the Last Will first.", "error");
                  return;
                }
                setOpenDirectTransfer(true);
              }}
              onSaleEscrow={() => {
                if (hasActiveLastWill) {
                  showToast(t("messages.cannotSellWithActiveLastWill") || "Cannot sell property with an active Last Will. Please revoke the Last Will first.", "error");
                  return;
                }
                setOpenSaleEscrow(true);
              }}
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
                hasActiveLastWill={hasActiveLastWill}
                onQRCode={() => setOpenQRManagement(true)}
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

      {deed && (
        <QRManagement
          deed={deed}
          isOpen={openQRManagement}
          onClose={() => setOpenQRManagement(false)}
        />
      )}
    </div>
  );
};

export default ADeedPage;