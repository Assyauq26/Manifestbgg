# Official Manifest Retur Template

The web application must reproduce the operational **FORM RETUR PENGEMBALIAN BARANG SELLER / 交接单 - 网点跟卖家** supplied for BGG16.

## Required sections

1. HARI/TANGGAL 星期/日期
2. DATA DROPPOINT 网点明细
   - DROPPOINT 网点名称
   - NAMA LENGKAP SPRINTER
   - NO HP SPRINTER
3. DATA SELLER 卖家明细
   - NAMA SELLER DI SISTEM
   - NAMA PENERIMA
   - NO HP
4. Keterangan: Paket sudah diserahkan ke PIC Seller
5. AWB table with NO and AWB 面单号码
6. TOTAL barang yang telah dikembalikan
7. Statement confirming the AWBs were handed to the Seller PIC
8. Handover proof statement for the DP/sprinter
9. Signature blocks:
   - Yang Membuat — SPV DP/ADMIN/SPRINTER
   - Yang Menerima — PIC Seller

## Rendering rules

- Seller code/initial is used for the generated manifest number.
- AWBs are data records, not fixed database columns.
- The supplied 35-row page layout is a print-page capacity, not a system-wide AWB limit.
- More than 35 AWBs continue onto additional pages.
- Total and handover/signature section appears on the final page.
- Generated PDF must use the operational wording and Indonesian/Mandarin labels from the supplied form.
