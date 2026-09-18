import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { findManifest, listManifestItems, googleErrorMessage, updateManifestPdf } from "@/lib/google/data";
import { generateManifestPdf } from "@/lib/manifest/pdf";
import { getDriveClient, uploadManifestPdf } from "@/lib/google/drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ manifestId: string }> };

async function pdfResponse(pdf: Buffer, fileName: string, disposition: "inline" | "attachment", fileId?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/pdf",
    "Content-Disposition": `${disposition}; filename="${fileName}"`,
    "Cache-Control": "private, no-store",
  };
  if (fileId) headers["X-Manifest-Pdf-File-Id"] = fileId;
  return new NextResponse(pdf as BodyInit, { status: 200, headers });
}

export async function GET(_request: Request, context: Context) {
  try {
    const { manifestId } = await context.params;
    const manifest = await findManifest(manifestId);
    if (!manifest) return NextResponse.json({ ok: false, error: "Manifest tidak ditemukan." }, { status: 404 });
    if (!manifest.pdf_file_id) {
      return NextResponse.json({ ok: false, error: "Manifest PDF belum dibuat. Silakan Generate Manifest terlebih dahulu." }, { status: 404 });
    }

    const drive = getDriveClient();
    const response = await drive.files.get(
      { fileId: manifest.pdf_file_id, alt: "media" },
      { responseType: "arraybuffer" },
    );
    const pdf = Buffer.from(response.data as ArrayBuffer);
    const fileName = `${manifest.manifest_number}.pdf`;
    return pdfResponse(pdf, fileName, "inline", manifest.pdf_file_id);
  } catch (error) {
    return NextResponse.json({ ok: false, error: googleErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(_request: Request, context: Context) {
  try {
    const { manifestId } = await context.params;
    const manifest = await findManifest(manifestId);
    if (!manifest) return NextResponse.json({ ok: false, error: "Manifest tidak ditemukan." }, { status: 404 });

    const items = await listManifestItems(manifestId);
    if (items.length === 0) {
      return NextResponse.json({ ok: false, error: "Manifest belum memiliki AWB." }, { status: 409 });
    }

    const pdf = await generateManifestPdf({ ...manifest, total_awb: items.length }, items);
    const fileName = `${manifest.manifest_number}.pdf`;

    if (manifest.pdf_file_id) {
      const drive = getDriveClient();
      await drive.files.update({
        fileId: manifest.pdf_file_id,
        media: { mimeType: "application/pdf", body: Readable.from(pdf) },
      });
      return pdfResponse(pdf, fileName, "inline", manifest.pdf_file_id);
    }

    const stored = await uploadManifestPdf(fileName, pdf);
    await updateManifestPdf(manifestId, stored.fileId, stored.url);

    return pdfResponse(pdf, fileName, "inline", stored.fileId);
  } catch (error) {
    return NextResponse.json({ ok: false, error: googleErrorMessage(error) }, { status: 500 });
  }
}
