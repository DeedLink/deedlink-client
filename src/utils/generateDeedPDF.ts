import jsPDF from "jspdf";
import type { IDeed } from "../types/responseDeed";
import type { Plan } from "../types/plan";

export const generateDeedPDF = (deed: IDeed, plan?: Plan, signatures?: { surveyor: boolean; notary: boolean; ivsl: boolean; fully: boolean } | null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  const addTitle = (text: string, fontSize: number = 18, isBold: boolean = true) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, yPosition);
    yPosition += fontSize / 2 + 5;
  };

  const addSection = (title: string, fontSize: number = 14) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, yPosition);
    yPosition += 8;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  };

  const addField = (label: string, value: string | number | undefined, indent: number = 0) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const labelX = margin + indent;
    doc.text(`${label}:`, labelX, yPosition);
    
    doc.setFont("helvetica", "normal");
    const valueText = value !== undefined && value !== null ? String(value) : "N/A";
    const maxWidth = contentWidth - indent - 20;
    const lines = doc.splitTextToSize(valueText, maxWidth);
    doc.text(lines, labelX + 30, yPosition);
    yPosition += lines.length * 5 + 3;
  };

  addTitle("PROPERTY DEED CERTIFICATE", 20);
  yPosition += 5;

  addSection("Deed Information");
  addField("Deed Number", deed.deedNumber);
  addField("Deed Type", deed.deedType?.deedType || "N/A");
  addField("Registration Date", deed.registrationDate ? new Date(deed.registrationDate).toLocaleDateString() : "N/A");
  addField("Token ID", deed.tokenId || "Not Minted");
  yPosition += 5;

  addSection("Owner Information");
  addField("Full Name", deed.ownerFullName);
  addField("NIC Number", deed.ownerNIC);
  addField("Address", deed.ownerAddress);
  addField("Phone", deed.ownerPhone);
  yPosition += 5;

  addSection("Land Details");
  addField("Land Title Number", deed.landTitleNumber);
  addField("Land Address", deed.landAddress);
  addField("Land Type", deed.landType);
  addField("Land Area", `${deed.landArea} ${deed.landSizeUnit || ""}`);
  addField("Survey Plan Number", deed.surveyPlanNumber || "N/A");
  addField("Boundaries", deed.boundaries || "N/A");
  yPosition += 5;

  addSection("Location");
  addField("District", deed.district);
  addField("Division", deed.division);
  if (deed.location && deed.location.length > 0) {
    addField("Coordinates", `Lat: ${deed.location[0]?.latitude}, Long: ${deed.location[0]?.longitude}`);
  }
  yPosition += 5;

  if (deed.sides) {
    addSection("Boundary Deeds");
    if (deed.sides.North) addField("North", deed.sides.North, 10);
    if (deed.sides.South) addField("South", deed.sides.South, 10);
    if (deed.sides.East) addField("East", deed.sides.East, 10);
    if (deed.sides.West) addField("West", deed.sides.West, 10);
    yPosition += 5;
  }

  if (deed.owners && deed.owners.length > 0) {
    addSection("Ownership Details");
    deed.owners.forEach((owner, index) => {
      addField(`Owner ${index + 1} Address`, owner.address);
      addField(`Owner ${index + 1} Share`, `${owner.share}%`);
      yPosition += 2;
    });
    yPosition += 5;
  }

  if (signatures) {
    addSection("Verification Status");
    addField("Surveyor Verified", signatures.surveyor ? "Yes" : "No");
    addField("Notary Verified", signatures.notary ? "Yes" : "No");
    addField("IVSL Verified", signatures.ivsl ? "Yes" : "No");
    addField("Fully Verified", signatures.fully ? "Yes" : "No");
    yPosition += 5;
  }

  if (deed.surveyAssigned || deed.notaryAssigned || deed.ivslAssigned) {
    addSection("Assigned Personnel");
    if (deed.surveyAssigned) addField("Surveyor", deed.surveyAssigned);
    if (deed.notaryAssigned) addField("Notary", deed.notaryAssigned);
    if (deed.ivslAssigned) addField("IVSL", deed.ivslAssigned);
    yPosition += 5;
  }

  if (plan && plan.planNumber) {
    addSection("Survey Plan Details");
    addField("Plan Number", plan.planNumber);
    if (plan.planDate) {
      addField("Plan Date", new Date(plan.planDate).toLocaleDateString());
    }
    if (plan.surveyor) {
      addField("Surveyor", plan.surveyor);
    }
    yPosition += 5;
  }

  if (deed.valuation && deed.valuation.length > 0) {
    addSection("Valuation History");
    deed.valuation.forEach((val, index) => {
      addField(`Valuation ${index + 1} - Requested`, val.requestedValue ? `${val.requestedValue}` : "N/A");
      addField(`Valuation ${index + 1} - Estimated`, val.estimatedValue ? `${val.estimatedValue}` : "N/A");
      addField(`Valuation ${index + 1} - Status`, val.isAccepted ? "Accepted" : "Pending");
      addField(`Valuation ${index + 1} - Date`, new Date(val.timestamp).toLocaleDateString());
      yPosition += 2;
    });
    yPosition += 5;
  }

  addSection("Additional Information");
  addField("Created At", deed.createdAt ? new Date(deed.createdAt).toLocaleString() : "N/A");
  addField("Last Updated", deed.updatedAt ? new Date(deed.updatedAt).toLocaleString() : "N/A");
  addField("Timestamp", new Date(deed.timestamp).toLocaleString());

  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(128, 128, 128);
  doc.text("This document is generated from the blockchain-based property deed registry system.", margin, footerY);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, footerY + 5);

  const fileName = `Deed_${deed.deedNumber}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

