import { NextResponse } from "next/server";
import { findManifest, listManifestItems, googleErrorMessage, updateManifestPdf } from "@/lib/google/data";
import { generateManifestPdf } from "@/lib/manifest/pdf";
import { uploadManifestPdf } from "@/lib/google/drive";

export const runtime = "nodejs";

type Context = { params: Promise<{ manifestId: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const { manifestId } = await context.params;
    const manifest = await findManifest(manifestId);
    if (!manifest) return NextResponse.json({ ok: false, error: "Manifest tidak ditemukan." }, { status: 404 });

    const items = await listManifestItems(manifestId);
    if (items.length === 0) {
      return NextResponse.json({ ok: false, error: "Manifest belum memiliki AWB." }, { status: 409 });
    }

    const pdf = await generateManifestPdf(manifest, items);
    const fileName = `${manifest.manifest_number}.pdf`;
    const stored = await uploadManifestPdf(fileName, pdf);
    await updateManifestPdf(manifestId, stored.fileId, stored.url);

    return new NextResponse(pdf as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "X-Manifest-Pdf-File-Id": stored.fileId,
        "X-Manifest-Pdf-Url": stored.url,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: googleErrorMessage(error) }, { status: 500 });
  }
}
