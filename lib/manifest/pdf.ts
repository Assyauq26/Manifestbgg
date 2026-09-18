import PDFDocument from "pdfkit";
import { Manifest, ManifestItem } from "@/types/domain";

const ROWS_PER_PAGE = 35;

function drawHeader(doc: PDFKit.PDFDocument, manifest: Manifest) {
  doc.fontSize(15).font("Helvetica-Bold").text("FORM RETUR PENGEMBALIAN BARANG SELLER", { align: "center" });
  doc.fontSize(9).font("Helvetica").text("交接单 - 网点跟卖家", { align: "center" });
  doc.moveDown(0.7);

  doc.font("Helvetica-Bold").fontSize(9).text("HARI/TANGGAL / 星期/日期");
  doc.font("Helvetica").text(`${manifest.manifest_date}    |    Shift: ${manifest.shift}`);
  doc.moveDown(0.4);

  const top = doc.y;
  doc.font("Helvetica-Bold").text("DATA DROPPOINT / 网点明细", 50, top);
  doc.font("Helvetica-Bold").text("DATA SELLER / 卖家明细", 315, top);
  doc.font("Helvetica").text(`DROPPOINT: ${manifest.drop_point}`, 50, top + 16);
  doc.text(`NAMA LENGKAP SPRINTER: ${manifest.sprinter_id}`, 50, top + 31);
  doc.text(`NO HP SPRINTER: -`, 50, top + 46);
  doc.text(`NAMA SELLER DI SISTEM: ${manifest.seller_code}`, 315, top + 16);
  doc.text(`NAMA PENERIMA: ${manifest.pic_name || "-"}`, 315, top + 31);
  doc.text(`NO HP: ${manifest.pic_phone || "-"}`, 315, top + 46);
  doc.y = top + 68;

  doc.fontSize(8).text("Keterangan: Paket sudah diserahkan ke PIC Seller", { align: "left" });
  doc.moveDown(0.5);
}

function drawTableHeader(doc: PDFKit.PDFDocument) {
  const y = doc.y;
  doc.rect(50, y, 45, 20).stroke();
  doc.rect(95, y, 450, 20).stroke();
  doc.font("Helvetica-Bold").fontSize(9).text("NO", 50, y + 6, { width: 45, align: "center" });
  doc.text("AWB / 面单号码", 95, y + 6, { width: 450, align: "center" });
  doc.y = y + 20;
}

function drawRow(doc: PDFKit.PDFDocument, sequence: number, awb: string) {
  const y = doc.y;
  doc.rect(50, y, 45, 18).stroke();
  doc.rect(95, y, 450, 18).stroke();
  doc.font("Helvetica").fontSize(9).text(String(sequence), 50, y + 5, { width: 45, align: "center" });
  doc.text(awb, 105, y + 5, { width: 430 });
  doc.y = y + 18;
}

function drawFinalSection(doc: PDFKit.PDFDocument, manifest: Manifest) {
  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fontSize(10).text("TOTAL barang yang telah dikembalikan");
  doc.font("Helvetica-Bold").fontSize(14).text(String(manifest.total_awb), { align: "center" });
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(8).text(
    "Dengan ini menyatakan bahwa paket/AWB yang tercantum di atas telah diserahkan kepada PIC Seller.",
    { align: "left" },
  );
  doc.moveDown(0.4);
  doc.text("Bukti serah-terima disimpan oleh sistem pada saat proses handover.");
  doc.moveDown(1.2);

  const y = doc.y;
  doc.font("Helvetica-Bold").fontSize(9).text("Yang Membuat", 80, y, { width: 150, align: "center" });
  doc.text("Yang Menerima", 365, y, { width: 150, align: "center" });
  doc.font("Helvetica").fontSize(8).text("SPV DP / ADMIN / SPRINTER", 80, y + 16, { width: 150, align: "center" });
  doc.text("PIC Seller", 365, y + 16, { width: 150, align: "center" });
  doc.moveDown(3.2);
  doc.font("Helvetica-Bold").fontSize(9).text("________________________", 80, doc.y, { width: 150, align: "center" });
  doc.text("________________________", 365, doc.y, { width: 150, align: "center" });
}

export function generateManifestPdf(manifest: Manifest, items: ManifestItem[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pages = Math.max(1, Math.ceil(items.length / ROWS_PER_PAGE));
    for (let page = 0; page < pages; page += 1) {
      if (page > 0) doc.addPage();
      drawHeader(doc, manifest);
      drawTableHeader(doc);
      const pageItems = items.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);
      pageItems.forEach((item, index) => drawRow(doc, page * ROWS_PER_PAGE + index + 1, item.awb));
      if (page === pages - 1) drawFinalSection(doc, manifest);
    }

    doc.end();
  });
}
