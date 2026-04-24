import Link from 'next/link';
import { createFeedback } from './actions';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '../pasien/actions';

export default async function FeedbackPage({ searchParams }: { searchParams?: { [key: string]: string } }) {
  const session = await getUserSession();
  const recent = await prisma.feedback.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { pasien: true } });
  const agg = await prisma.feedback.aggregate({ _avg: { rating: true }, _count: { id: true } });
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  const success = !!searchParams?.success;
  const isPasien = session?.role === 'PASIEN';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-700 text-white px-4 py-5 sticky top-0 z-10 shadow-md">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Link href={isPasien ? '/pasien' : '/'} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </Link>
            <h1 className="text-lg font-bold">Evaluasi Kepuasan</h1>
          </div>
          <p className="text-xs text-green-300 ml-8">
            {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {error && (
          <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Feedback terkirim. Terima kasih atas partisipasi Anda!
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h2 className="text-base font-bold text-gray-800 mb-1">Formulir Survey</h2>
          <p className="text-xs text-gray-400 mb-5">Isi evaluasi ini untuk membantu kami meningkatkan layanan.</p>

          <form action={createFeedback} className="space-y-4">
            {session?.role === 'PASIEN' && (
              <div className="hidden">
                <input name="pasienId" value={session.pasienId || ''} readOnly />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Rating Layanan</label>
              <div className="flex gap-2">
                {[5,4,3,2,1].map(v => (
                  <label key={v} className="cursor-pointer">
                    <input type="radio" name="rating" value={v} defaultChecked={v === 5} className="peer hidden" />
                    <span className="block w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-400 peer-checked:border-yellow-400 peer-checked:bg-yellow-50 peer-checked:text-yellow-500 hover:border-yellow-300 transition-all">
                      {v} ★
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pesan / Saran</label>
              <textarea
                name="message"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={4}
                placeholder="Ceritakan pengalaman Anda selama di RS..."
                required
              />
            </div>
            <button type="submit" className="w-full py-3 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors">
              Kirim Feedback
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Statistik Feedback</h3>
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{agg._count.id}</div>
              <div className="text-xs text-gray-400 mt-0.5">Total Responden</div>
            </div>
            <div className="flex-1 bg-yellow-50 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{agg._avg.rating ? Number(agg._avg.rating).toFixed(1) : '—'}</div>
              <div className="text-xs text-yellow-500 mt-0.5">Rata-rata Rating</div>
            </div>
          </div>
        </div>

        {recent.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Feedback Terbaru</h3>
            <div className="space-y-3">
              {recent.map(f => {
                const pasienName = f.pasien?.namaLengkap;
                const initials = pasienName ? pasienName.split(' ').map(s => s[0]).join('').slice(0,3).toUpperCase() : null;
                return (
                  <div key={f.id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                      {initials || 'AN'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-yellow-500 text-sm font-bold">{Array(f.rating).fill('★').join('')}</span>
                        <span className="text-xs text-gray-400">{f.createdAt.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{f.message}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}