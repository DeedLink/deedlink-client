import jsPDF from "jspdf";
import type { IDeed } from "../types/responseDeed";
import type { Plan } from "../types/plan";
import type { Title } from "../types/title";

export const generateDeedPDF = (
  deed: IDeed,
  plan?: Plan,
  signatures?: { surveyor: boolean; notary: boolean; ivsl: boolean; fully: boolean } | null,
  transactions?: Title[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  const addHeader = () => {
    doc.setFillColor(34, 139, 34);
    doc.rect(0, 0, pageWidth, 30, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PROPERTY DEED CERTIFICATE", pageWidth / 2, 18, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Blockchain-Based Property Registry System", pageWidth / 2, 25, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    yPosition = 40;
  };

  const addSectionHeader = (title: string) => {
    checkNewPage(15);
    yPosition += 5;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition - 5, contentWidth, 8, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 139, 34);
    doc.text(title, margin + 2, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
  };

  const addTwoColumnField = (label1: string, value1: string | number | undefined, label2: string, value2: string | number | undefined) => {
    checkNewPage(12);
    const colWidth = (contentWidth - 10) / 2;
    const leftX = margin;
    const rightX = margin + colWidth + 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${label1}:`, leftX, yPosition);
    doc.text(`${label2}:`, rightX, yPosition);
    
    doc.setFont("helvetica", "normal");
    const value1Text = value1 !== undefined && value1 !== null ? String(value1) : "N/A";
    const value2Text = value2 !== undefined && value2 !== null ? String(value2) : "N/A";
    
    const lines1 = doc.splitTextToSize(value1Text, colWidth - 15);
    const lines2 = doc.splitTextToSize(value2Text, colWidth - 15);
    
    doc.text(lines1, leftX + 35, yPosition);
    doc.text(lines2, rightX + 35, yPosition);
    
    yPosition += Math.max(lines1.length, lines2.length) * 5 + 3;
  };

  const addField = (label: string, value: string | number | undefined) => {
    checkNewPage(10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, yPosition);
    
    doc.setFont("helvetica", "normal");
    const valueText = value !== undefined && value !== null ? String(value) : "N/A";
    const maxWidth = contentWidth - 40;
    const lines = doc.splitTextToSize(valueText, maxWidth);
    doc.text(lines, margin + 40, yPosition);
    yPosition += lines.length * 5 + 4;
  };

  const addTableRow = (col1: string, col2: string, col3?: string) => {
    checkNewPage(8);
    const colWidth = col3 ? (contentWidth - 20) / 3 : (contentWidth - 10) / 2;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(col1, margin, yPosition);
    doc.text(col2, margin + colWidth, yPosition);
    if (col3) {
      doc.text(col3, margin + colWidth * 2, yPosition);
    }
    yPosition += 6;
  };

  addHeader();

  addSectionHeader("DEED INFORMATION");
  addTwoColumnField("Deed Number", deed.deedNumber, "Deed Type", deed.deedType?.deedType || "N/A");
  addTwoColumnField("Registration Date", deed.registrationDate ? new Date(deed.registrationDate).toLocaleDateString() : "N/A", "Token ID", deed.tokenId ? `#${deed.tokenId}` : "Not Minted");

  addSectionHeader("OWNER INFORMATION");
  addField("Full Name", deed.ownerFullName);
  addTwoColumnField("NIC Number", deed.ownerNIC, "Phone", deed.ownerPhone);
  addField("Address", deed.ownerAddress);

  addSectionHeader("LAND DETAILS");
  addTwoColumnField("Land Title Number", deed.landTitleNumber, "Land Type", deed.landType);
  addField("Land Address", deed.landAddress);
  addTwoColumnField("Land Area", `${deed.landArea} ${deed.landSizeUnit || ""}`, "Survey Plan Number", deed.surveyPlanNumber || "N/A");
  if (deed.boundaries) {
    addField("Boundaries Description", deed.boundaries);
  }

  addSectionHeader("LOCATION");
  addTwoColumnField("District", deed.district, "Division", deed.division);
  if (deed.location && deed.location.length > 0) {
    const firstLoc = deed.location[0];
    addTwoColumnField("Latitude", firstLoc.latitude.toFixed(6), "Longitude", firstLoc.longitude.toFixed(6));
  }

  if (plan) {
    addSectionHeader("SURVEY PLAN DETAILS");
    if (plan.planId) addField("Plan ID", plan.planId);
    if (plan.areaSize > 0) {
      addTwoColumnField("Plan Area", `${plan.areaSize} ${plan.areaType}`, "Status", plan.status || "N/A");
    }
    if (plan.createdBy) addField("Created By", plan.createdBy);
    if (plan.signedBy) addField("Signed By", plan.signedBy);
    if (plan.details) addField("Plan Details", plan.details);
    if (plan.createdAt) {
      addField("Plan Created Date", new Date(plan.createdAt).toLocaleDateString());
    }

    if (plan.coordinates && plan.coordinates.length > 0) {
      checkNewPage(15);
      yPosition += 3;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Plan Coordinates:", margin, yPosition);
      yPosition += 6;
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      addTableRow("Point", "Latitude", "Longitude");
      doc.setFont("helvetica", "normal");
      plan.coordinates.forEach((coord, idx) => {
        addTableRow(`Point ${idx + 1}`, coord.latitude.toFixed(6), coord.longitude.toFixed(6));
      });
    }

    if (plan.sides && (plan.sides.North || plan.sides.South || plan.sides.East || plan.sides.West)) {
      checkNewPage(15);
      yPosition += 3;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Boundary Deeds:", margin, yPosition);
      yPosition += 6;
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      addTableRow("Direction", "Deed Number");
      doc.setFont("helvetica", "normal");
      if (plan.sides.North) addTableRow("North", plan.sides.North);
      if (plan.sides.South) addTableRow("South", plan.sides.South);
      if (plan.sides.East) addTableRow("East", plan.sides.East);
      if (plan.sides.West) addTableRow("West", plan.sides.West);
    }
  } else if (deed.sides && (deed.sides.North || deed.sides.South || deed.sides.East || deed.sides.West)) {
    addSectionHeader("BOUNDARY DEEDS");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    addTableRow("Direction", "Deed Number");
    doc.setFont("helvetica", "normal");
    if (deed.sides.North) addTableRow("North", deed.sides.North);
    if (deed.sides.South) addTableRow("South", deed.sides.South);
    if (deed.sides.East) addTableRow("East", deed.sides.East);
    if (deed.sides.West) addTableRow("West", deed.sides.West);
  }

  if (deed.owners && deed.owners.length > 0) {
    addSectionHeader("OWNERSHIP DETAILS");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    addTableRow("Owner Address", "Ownership Share");
    doc.setFont("helvetica", "normal");
    deed.owners.forEach((owner) => {
      const addressLines = doc.splitTextToSize(owner.address, contentWidth / 2 - 10);
      addressLines.forEach((line: string, idx: number) => {
        if (idx === 0) {
          addTableRow(line, `${owner.share}%`);
        } else {
          checkNewPage(6);
          doc.text(line, margin, yPosition);
          yPosition += 5;
        }
      });
    });
  }

  if (signatures) {
    addSectionHeader("VERIFICATION STATUS");
    addTwoColumnField("Surveyor Verified", signatures.surveyor ? "✓ Verified" : "✗ Not Verified", "Notary Verified", signatures.notary ? "✓ Verified" : "✗ Not Verified");
    addTwoColumnField("IVSL Verified", signatures.ivsl ? "✓ Verified" : "✗ Not Verified", "Fully Verified", signatures.fully ? "✓ Verified" : "✗ Not Verified");
  }

  if (deed.surveyAssigned || deed.notaryAssigned || deed.ivslAssigned) {
    addSectionHeader("ASSIGNED PERSONNEL");
    if (deed.surveyAssigned) addField("Surveyor", deed.surveyAssigned);
    if (deed.notaryAssigned) addField("Notary", deed.notaryAssigned);
    if (deed.ivslAssigned) addField("IVSL Officer", deed.ivslAssigned);
  }

  if (transactions && transactions.length > 0) {
    addSectionHeader("TRANSACTION HISTORY");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    addTableRow("Date", "Type", "From → To");
    doc.setFont("helvetica", "normal");
    
    const sortedTxs = [...transactions].sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    sortedTxs.forEach((tx) => {
      checkNewPage(8);
      const dateStr = tx.date ? new Date(tx.date).toLocaleDateString() : "N/A";
      const typeStr = tx.type || "N/A";
      const fromTo = `${(tx.from || "N/A").substring(0, 6)}... → ${(tx.to || "N/A").substring(0, 6)}...`;
      addTableRow(dateStr, typeStr, fromTo);
    });
  }

  const footerY = pageHeight - 12;
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleString()} | Blockchain Property Registry System`, pageWidth / 2, footerY, { align: "center" });

  const fileName = `Deed_${deed.deedNumber}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

