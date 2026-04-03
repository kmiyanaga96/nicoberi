import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // セッション更新は各ページのサーバーコンポーネントで実施
  // (supabase.auth.getUser() が自動でトークンをリフレッシュする)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
