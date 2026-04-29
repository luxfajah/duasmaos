import { NextRequest, NextResponse } from 'next/server'

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
}

function parseCount(raw: string | undefined): string {
  if (!raw) return '0'
  return raw.replace(/,/g, '.').trim()
}

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')
  if (!handle) {
    return NextResponse.json({ error: 'Informe um @usuario.' }, { status: 400 })
  }

  // Normalize: remove @, extract from URL if needed
  const username = handle
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .split('?')[0]
    .split('/')[0]
    .trim()

  if (!username) {
    return NextResponse.json({ error: 'Handle inválido.' }, { status: 400 })
  }

  const url = `https://www.instagram.com/${username}/`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Perfil @${username} não encontrado ou privado (HTTP ${res.status}).` },
        { status: 404 }
      )
    }

    const html = await res.text()

    // ── Helper: extract <meta> content ───────────────────────────────────────
    const getMeta = (prop: string): string => {
      // property="…" content="…" or name="…" content="…"
      const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']*?)["']`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'),
      ]
      for (const re of patterns) {
        const m = html.match(re)
        if (m?.[1]) return decodeHTMLEntities(m[1])
      }
      return ''
    }

    // ── og:title → "Name (@username) • Instagram photos and videos" ──────────
    const ogTitle = getMeta('og:title')
    // og:description → "X Followers, Y Following, Z Posts - See Instagram…"
    const ogDesc = getMeta('og:description')
    // og:image → profile picture CDN URL
    const ogImage = getMeta('og:image')

    // ── Parse name ────────────────────────────────────────────────────────────
    const nameMatch = ogTitle.match(/^(.+?)\s*\(@/)
    const name = nameMatch?.[1]?.trim() || ogTitle.split('•')[0].split('(')[0].trim() || username

    // ── Parse stats from og:description ──────────────────────────────────────
    // pt-BR format: "1.234 seguidores, 456 seguindo, 78 publicações"
    // en format:    "1,234 Followers, 456 Following, 78 Posts"
    const followersMatch =
      ogDesc.match(/([\d.,]+[KMkm]?)\s*(?:seguidores|[Ff]ollowers?)/) ||
      ogDesc.match(/([\d.,]+[KMkm]?)/)
    const followingMatch =
      ogDesc.match(/([\d.,]+[KMkm]?)\s*(?:seguindo|[Ff]ollowing)/)
    const postsMatch =
      ogDesc.match(/([\d.,]+[KMkm]?)\s*(?:publicações?|[Pp]osts?)/)

    // ── Bio from JSON-LD ──────────────────────────────────────────────────────
    let bio = ''
    const ldMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
    if (ldMatch) {
      try {
        const ld = JSON.parse(ldMatch[1])
        bio = ld?.description || ld?.mainEntity?.description || ''
      } catch { /* ignore parse errors */ }
    }

    // Fallback: extract bio from "description" meta
    if (!bio) {
      bio = getMeta('description')
        .replace(/^[\d.,]+[KMkm]?\s*(?:seguidores?|[Ff]ollowers?)[^-]*-\s*/i, '')
        .replace(/^See.*?photos.*?videos[^.]*\.\s*/i, '')
        .trim()
    }

    // ── Highlights ────────────────────────────────────────────────────────────
    // Instagram doesn't expose highlights in public HTML — return empty
    const highlights: { title: string; image_url: string }[] = []

    // Extract highlight covers from structured data if available
    const hlMatches = html.matchAll(/"highlight_title":"([^"]+)"[^}]*"thumbnail_src":"([^"]+)"/g)
    for (const m of hlMatches) {
      highlights.push({ title: m[1], image_url: m[2].replace(/\\u0026/g, '&') })
    }

    return NextResponse.json({
      username,
      name,
      bio,
      avatar_url: ogImage,
      followers: parseCount(followersMatch?.[1]),
      following: parseCount(followingMatch?.[1]),
      posts: parseCount(postsMatch?.[1]),
      highlights,
    })
  } catch (err: any) {
    console.error('[ig-scrape] Error:', err)
    return NextResponse.json({ error: err.message || 'Erro interno ao buscar perfil.' }, { status: 500 })
  }
}
