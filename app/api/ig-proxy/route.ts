export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy para imagens externas (ex: CDN do Instagram) que bloqueiam CORS.
 * O cliente chama /api/ig-proxy?url=... e recebe a imagem em bytes.
 * Usamos esse proxy para poder fazer upload da foto de perfil para o Supabase.
 */
export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get('url')
  if (!imageUrl) {
    return NextResponse.json({ error: 'Parâmetro url ausente.' }, { status: 400 })
  }

  try {
    const imageRes = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://www.instagram.com/',
      },
      cache: 'no-store',
    })

    if (!imageRes.ok) {
      return NextResponse.json({ error: 'Imagem não acessível.' }, { status: 502 })
    }

    const buffer = await imageRes.arrayBuffer()
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao buscar imagem.' }, { status: 500 })
  }
}
