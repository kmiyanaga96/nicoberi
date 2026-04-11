// 時刻フォーマット用のヘルパー関数
export function formatTime(isoString: string | null, fallback = '--:--') {
  if (!isoString) return fallback
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }).format(date)
}
