import { prisma } from '@/lib/prisma';
import { getUserSession } from '../../../pasien/actions';
import { redirect } from 'next/navigation';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

export default async function KuitansiPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession();
  
  // Kasir or Admin validation to print
  if (!session || (session.role !== 'KASIR' && session.role !== 'MANAJEMEN')) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const tagihanId = parseInt(resolvedParams.id);

  const tagihan = await prisma.tagihan.findUnique({
    where: { id: tagihanId },
    include: {
      items: true,
      antrean: {
        include: {
          pasien: true,
          poliklinik: true
        }
      }
    }
  });

  if (!tagihan) {
    return <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>Invoice tidak ditemukan!</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px", background: "#fff", color: "#000", fontFamily: "sans-serif" }}>
       {/* CSS for print media */}
       <style dangerouslySetInnerHTML={{__html: `
          @media print {
             body { background: white !important; }
             @page { margin: 0; }
             .no-print { display: none !important; }
          }
       `}} />
       
       <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: "20px", marginBottom: "30px" }}>
           <div>
               <h1 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>RS Tentara P. Siantar</h1>
               <div style={{ fontSize: "14px", color: "#444" }}>Jl. Kesehatan No.1, Pematangsiantar</div>
               <div style={{ fontSize: "14px", color: "#444" }}>Telp: (0622) 123456</div>
           </div>
           <div style={{ textAlign: "right", alignSelf: "flex-end" }}>
               <h2 style={{ margin: "0 0 5px 0", letterSpacing: "2px", color: "#555" }}>KUITANSI / INVOICE</h2>
               <div style={{ fontSize: "14px", fontWeight: "bold" }}>No. INV-{String(tagihan.id).padStart(5, '0')}</div>
           </div>
       </div>

       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
           <div style={{ width: "50%" }}>
               <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666", textTransform: "uppercase" }}>Tagihan Kepada:</h3>
               <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "4px" }}>{tagihan.antrean.pasien.namaLengkap}</div>
               <div style={{ fontSize: "14px" }}>NIK: {tagihan.antrean.pasien.nik}</div>
               <div style={{ fontSize: "14px", marginTop: "10px" }}>Poliklinik: {tagihan.antrean.poliklinik.namaPoli}</div>
           </div>
           <div style={{ width: "30%", textAlign: "left" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                   <span style={{ fontSize: "14px", color: "#666" }}>Tanggal:</span>
                   <span style={{ fontSize: "14px", fontWeight: "600" }}>{new Date().toLocaleDateString('id-ID')}</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                   <span style={{ fontSize: "14px", color: "#666" }}>Status Pembayaran:</span>
                   <span style={{ fontSize: "14px", fontWeight: "bold", color: tagihan.status === 'LUNAS' ? '#2e7d32' : '#d32f2f' }}>{tagihan.status}</span>
               </div>
           </div>
       </div>

       <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
           <thead>
               <tr style={{ background: "#f2f2f2" }}>
                   <th style={{ padding: "12px", borderBottom: "2px solid #ccc", textAlign: "left" }}>Deskripsi / Item Layanan</th>
                   <th style={{ padding: "12px", borderBottom: "2px solid #ccc", textAlign: "center", width: "10%" }}>Qty</th>
                   <th style={{ padding: "12px", borderBottom: "2px solid #ccc", textAlign: "right", width: "25%" }}>Harga</th>
                   <th style={{ padding: "12px", borderBottom: "2px solid #ccc", textAlign: "right", width: "25%" }}>Subtotal</th>
               </tr>
           </thead>
           <tbody>
               {tagihan.items.map((item) => (
                   <tr key={item.id}>
                       <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{item.namaItem}</td>
                       <td style={{ padding: "12px", borderBottom: "1px solid #eee", textAlign: "center" }}>{item.jumlah}</td>
                       <td style={{ padding: "12px", borderBottom: "1px solid #eee", textAlign: "right" }}>{Number(item.harga).toLocaleString('id-ID')}</td>
                       <td style={{ padding: "12px", borderBottom: "1px solid #eee", textAlign: "right" }}>{Number(item.subTotal).toLocaleString('id-ID')}</td>
                   </tr>
               ))}
           </tbody>
           <tfoot>
               <tr>
                   <td colSpan={3} style={{ padding: "15px 12px", textAlign: "right", fontWeight: "bold", fontSize: "18px" }}>TOTAL KESELURUHAN:</td>
                   <td style={{ padding: "15px 12px", textAlign: "right", fontWeight: "bold", fontSize: "18px", color: "#e65100" }}>
                       Rp {Number(tagihan.totalBiaya).toLocaleString('id-ID')}
                   </td>
               </tr>
           </tfoot>
       </table>

       <div style={{ display: "flex", justifyContent: "space-between", marginTop: "50px" }}>
           <div className="no-print">
                <PrintButton />
           </div>
           <div style={{ textAlign: "center", width: "30%" }}>
                <div style={{ marginBottom: "60px", fontSize: "14px" }}>Petugas Kasir</div>
                <div style={{ borderBottom: "1px solid #000", margin: "0 20px 5px 20px" }}></div>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>Nmr. Kasir ID: {session.id}</div>
           </div>
       </div>

    </div>
  );
}
