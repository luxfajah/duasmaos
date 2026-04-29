import { NextRequest, NextResponse } from 'next/server'

// Use Edge Runtime — different IP pool, less likely to be blocked by Instagram
export const runtime = 'edge'

function fmtCount(n: number | undefined | null): string {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + 'K'
  return String(n)
}

// ── Strategy 1: Instagram internal mobile API ─────────────────────────────────
async function fetchViaInternalAPI(username: string) {
  const res = await fetch(
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    {
      headers: {
        'User-Agent': 'Instagram 219.0.0.12.117 Android (28/9; 420dpi; 1080x2148; samsung; SM-A720F; jackpotlte; exynos7880; en_IN; 301084525)',
        'X-IG-App-ID': '936619743392459',
        Accept: '*/*',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) {
    console.warn(`[ig] internal API status ${res.status}`)
    return null
  }
  const json = await res.json() as any
  return json?.data?.user ?? null
}

// ── Strategy 2: ?__a=1 shortcut (mobile UA) ───────────────────────────────────
async function fetchViaA1(username: string) {
  const res = await fetch(
    `https://www.instagram.com/${username}/?__a=1&__d=dis`,
    {
      headers: {
        'User-Agent': 'Instagram 219.0.0.12.117 Android (28/9; 420dpi; 1080x2148; samsung; SM-A720F; jackpotlte; exynos7880; en_IN; 301084525)',
        'X-IG-App-ID': '936619743392459',
        Accept: 'application/json',
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) {
    console.warn(`[ig] __a=1 status ${res.status}`)
    return null
  }
  try {
    const json = await res.json() as any
    return json?.graphql?.user ?? json?.user ?? null
  } catch { return null }
}

// ── Strategy 3: AllOrigins proxy → parse HTML meta tags ───────────────────────
// Uses a public CORS proxy running on different infrastructure
async function fetchViaProxy(username: string) {
  const targetUrl = encodeURIComponent(`https://www.instagram.com/${username}/`)
  const res = await fetch(`https://api.allorigins.win/get?url=${targetUrl}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = await res.json() as any
  const html: string = json?.contents ?? ''
  if (!html || html.includes('accounts/login')) return null

  // Parse og: meta tags from the HTML
  const getMeta = (prop: string) => {
    const m =
      html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']*?)["']`, 'i')) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']*?)["'][^>]+property=["']${prop}["']`, 'i'))
    return m?.[1] ? m[1].replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c))).replace(/&amp;/g, '&') : ''
  }

  const ogTitle = getMeta('og:title')
  const ogDesc  = getMeta('og:description')
  const ogImage = getMeta('og:image')

  if (!ogTitle || ogTitle.includes('Instagram')) {
    // Still the generic page
    return null
  }

  const nameMatch = ogTitle.match(/^(.+?)\s*\(@/)
  const name = nameMatch?.[1]?.trim() || ogTitle.split('•')[0].trim()

  // Parse "1,234 Followers, 56 Following, 78 Posts"
  const followers = ogDesc.match(/([\d,.]+[KMk]?)\s*[Ff]ollowers?/)?.[1]?.replace(/,/g, '') ?? '0'
  const following = ogDesc.match(/([\d,.]+[KMk]?)\s*[Ff]ollowing/)?.[1]?.replace(/,/g, '') ?? '0'
  const posts     = ogDesc.match(/([\d,.]+[KMk]?)\s*[Pp]osts?/)?.[1]?.replace(/,/g, '') ?? '0'

  // Bio: extract from JSON-LD
  let bio = ''
  const ldM = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
  if (ldM) {
    try { const ld = JSON.parse(ldM[1]) as any; bio = ld?.description || '' } catch {}
  }

  return { full_name: name, biography: bio, profile_pic_url: ogImage, follower_count: followers, following_count: following, media_count: posts }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')
  if (!handle) {
    return NextResponse.json({ error: 'Informe um @usuario.' }, { status: 400 })
  }

  const username = handle
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .split('?')[0].split('/')[0].trim()

  if (!username) {
    return NextResponse.json({ error: 'Handle inválido.' }, { status: 400 })
  }

  try {
    let user: any = null

    // Try strategies in order
    user = await fetchViaInternalAPI(username).catch(() => null)
    if (!user) user = await fetchViaA1(username).catch(() => null)
    if (!user) user = await fetchViaProxy(username).catch(() => null)

    if (!user) {
      return NextResponse.json(
        { error: `@${username} não encontrado ou o Instagram está temporariamente bloqueando a requisição. Preencha os campos manualmente.` },
        { status: 404 }
      )
    }

    const name       = user.full_name || username
    const bio        = user.biography || ''
    const avatarUrl  = user.profile_pic_url_hd || user.profile_pic_url || ''
    const followers  = typeof user.follower_count === 'number'
      ? fmtCount(user.follower_count)
      : String(user.follower_count ?? user.edge_followed_by?.count ?? '0')
    const following  = typeof user.following_count === 'number'
      ? fmtCount(user.following_count)
      : String(user.following_count ?? user.edge_follow?.count ?? '0')
    const posts      = typeof user.media_count === 'number'
      ? fmtCount(user.media_count)
      : String(user.media_count ?? user.edge_owner_to_timeline_media?.count ?? '0')

    const highlights: { title: string; image_url: string }[] = []
    const rawHl: any[] = user.edge_highlight_reels?.edges ?? []
    for (const edge of rawHl) {
      const node = edge?.node
      if (node?.title) {
        highlights.push({
          title: node.title,
          image_url: node.cover_media?.thumbnail_src || node.cover_media_cropped_thumbnail?.url || '',
        })
      }
    }

    return NextResponse.json({ username, name, bio, avatar_url: avatarUrl, followers, following, posts, highlights })
  } catch (err: any) {
    console.error('[ig-scrape]', err)
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 })
  }
}
