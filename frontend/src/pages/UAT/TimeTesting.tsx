/**
 * UAT Time Testing (MODULE RAHASIA)
 * Diakses lewat URL /uat/time-testing (tidak ada di menu), khusus admin.
 * Menguji fitur "feedback tak dibalas 5 hari -> pengajuan bimbingan gagal"
 * dengan menggeser createdAt bimbingan uji agar jatuh tempo beberapa menit lagi.
 */

import { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errorMessage'

interface MenungguItem {
    _id: string
    mahasiswa: { name: string; nim_nip: string } | null
    dosen: { name: string } | null
    dosenType: string
    judul: string | null
    createdAt: string
    expireAt: string
    sisaDetik: number
}

const fmt = (iso: string) => new Date(iso).toLocaleString('id-ID')

const fmtSisa = (detik: number) => {
    if (detik <= 0) return '00:00'
    const m = Math.floor(detik / 60)
    const s = detik % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const TimeTesting = () => {
    const [list, setList] = useState<MenungguItem[]>([])
    const [selectedId, setSelectedId] = useState('')
    const [minutes, setMinutes] = useState('3')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)

    // Target jatuh tempo aktif (ms) untuk countdown, + penanda sudah dicek.
    const [countdownTarget, setCountdownTarget] = useState<number | null>(null)
    const [now, setNow] = useState(Date.now())
    const checkedRef = useRef(false)

    const fetchList = async () => {
        try {
            setError(null)
            const res = await api.get('/uat/bimbingan-menunggu')
            setList(res.data.data || [])
        } catch (e) {
            setError(getApiErrorMessage(e, 'Gagal memuat daftar (pastikan ENABLE_UAT_MODULE=true & login admin).'))
        }
    }

    useEffect(() => { fetchList() }, [])

    // Ticker 1 detik untuk countdown.
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(t)
    }, [])

    const remaining = countdownTarget ? Math.max(0, Math.round((countdownTarget - now) / 1000)) : null

    // Saat countdown habis: jalankan pengecekan deadline sekali.
    useEffect(() => {
        if (countdownTarget && remaining === 0 && !checkedRef.current) {
            checkedRef.current = true
            runCheck(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remaining, countdownTarget])

    const startCountdown = async () => {
        if (!selectedId) { setError('Pilih bimbingan uji dulu.'); return }
        setLoading(true); setError(null); setInfo(null)
        try {
            const res = await api.post('/uat/timeskip', { bimbinganId: selectedId, minutes: Number(minutes) })
            const item = res.data.data as MenungguItem
            checkedRef.current = false
            setCountdownTarget(new Date(item.expireAt).getTime())
            setInfo(`Countdown dimulai. Jatuh tempo: ${fmt(item.expireAt)}`)
            fetchList()
        } catch (e) {
            setError(getApiErrorMessage(e, 'Gagal memulai countdown.'))
        } finally {
            setLoading(false)
        }
    }

    const resetTs = async () => {
        if (!selectedId) { setError('Pilih bimbingan uji dulu.'); return }
        setLoading(true); setError(null); setInfo(null)
        try {
            await api.post('/uat/reset', { bimbinganId: selectedId })
            setCountdownTarget(null)
            checkedRef.current = false
            setInfo('createdAt direset ke sekarang. Countdown dibatalkan.')
            fetchList()
        } catch (e) {
            setError(getApiErrorMessage(e, 'Gagal reset.'))
        } finally {
            setLoading(false)
        }
    }

    const runCheck = async (auto = false) => {
        try {
            const res = await api.post('/uat/run-check')
            const dihapus = res.data.data?.dihapus ?? 0
            setInfo(`${auto ? '⏰ Countdown habis. ' : ''}Pengecekan dijalankan — ${dihapus} bimbingan kedaluwarsa dihapus.`)
            if (dihapus > 0) setCountdownTarget(null)
            fetchList()
        } catch (e) {
            setError(getApiErrorMessage(e, 'Gagal menjalankan pengecekan.'))
        }
    }

    const selected = list.find(i => i._id === selectedId)

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <header className="border-b border-slate-700 pb-4">
                    <h1 className="text-2xl font-bold">🧪 UAT · Time Testing</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Uji fitur "feedback tak dibalas 5 hari → pengajuan gagal" tanpa menunggu 5 hari.
                        Module rahasia (admin only). Hanya mengubah <code>createdAt</code> record uji.
                    </p>
                </header>

                {error && <div className="rounded-lg bg-red-500/15 border border-red-500/40 p-3 text-sm text-red-300">{error}</div>}
                {info && <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 p-3 text-sm text-emerald-300">{info}</div>}

                {/* Countdown besar */}
                {countdownTarget && (
                    <div className="rounded-xl bg-slate-800 border border-slate-700 p-6 text-center">
                        <p className="text-xs uppercase tracking-widest text-slate-400">Sisa waktu jatuh tempo</p>
                        <p className="text-5xl font-mono font-bold mt-2 tabular-nums">{fmtSisa(remaining ?? 0)}</p>
                        <p className="text-xs text-slate-500 mt-2">Saat 00:00, pengecekan deadline dijalankan otomatis.</p>
                    </div>
                )}

                {/* Kontrol */}
                <div className="rounded-xl bg-slate-800 border border-slate-700 p-5 space-y-4">
                    <div>
                        <label className="text-sm text-slate-300">Bimbingan uji (status menunggu)</label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm"
                        >
                            <option value="">— pilih —</option>
                            {list.map((i) => (
                                <option key={i._id} value={i._id}>
                                    {i.mahasiswa?.name || '?'} → {i.dosen?.name || '?'} · dibuat {fmt(i.createdAt)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selected && (
                        <div className="text-xs text-slate-400 bg-slate-900/60 rounded-lg p-3 space-y-1">
                            <p>Mahasiswa: <span className="text-slate-200">{selected.mahasiswa?.name} ({selected.mahasiswa?.nim_nip})</span></p>
                            <p>createdAt saat ini: <span className="text-slate-200">{fmt(selected.createdAt)}</span></p>
                            <p>Jatuh tempo (createdAt + 5 hari): <span className="text-slate-200">{fmt(selected.expireAt)}</span></p>
                        </div>
                    )}

                    <div className="flex items-end gap-3">
                        <div className="w-28">
                            <label className="text-sm text-slate-300">Menit</label>
                            <input
                                type="number" min={0} value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm"
                            />
                        </div>
                        <button
                            onClick={startCountdown} disabled={loading || !selectedId}
                            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-4 py-2 text-sm font-semibold"
                        >
                            Mulai Countdown
                        </button>
                        <button
                            onClick={resetTs} disabled={loading || !selectedId}
                            className="rounded-lg bg-slate-600 hover:bg-slate-500 disabled:opacity-40 px-4 py-2 text-sm font-semibold"
                        >
                            Reset ke Sekarang
                        </button>
                        <button
                            onClick={() => runCheck(false)} disabled={loading}
                            className="rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 px-4 py-2 text-sm font-semibold"
                        >
                            Jalankan Cek Sekarang
                        </button>
                    </div>
                </div>

                <button onClick={fetchList} className="text-xs text-slate-400 hover:text-slate-200 underline">Muat ulang daftar</button>
            </div>
        </div>
    )
}

export default TimeTesting
