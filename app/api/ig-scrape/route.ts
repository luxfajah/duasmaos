import { NextRequest, NextResponse } from 'next/server'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCount(n: number | undefined | null): string {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0', '') + 'K'
  return String(n)
}

// ── Strategy 1: Instagram internal mobile API ─────────────────────────────────
// Uses the same App-ID that the Instagram web app uses (publicly known constant).
// No token required for public profiles.
async function fetchViaInternalAPI(username: string) {
  const res = await fetch(
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    {
      headers: {
        'User-Agent':
          'Instagram 219.0.0.12.117 Android (28/9; 420dpi; 1080x2148; samsung; SM-A720F; jackpotlte; exynos7880; en_IN; 301084525)',
        'X-IG-App-ID': '936619743392459', // Instagram web App-ID (public constant)
        Accept: '*/*',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) return null
  const json = await res.json()
  return json?.data?.user ?? null
}

// ── Strategy 2: GraphQL endpoint (web) ────────────────────────────────────────
async function fetchViaGraphQL(username: string) {
  const variables = JSON.stringify({
    username,
    include_reel: false,
    fetch_mutual: false,
    first: 12,
  })
  const res = await fetch(
    `https://www.instagram.com/graphql/query/?query_hash=c9100bf9110dd6361671f113dd02e7d&variables=${encodeURIComponent(variables)}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: `https://www.instagram.com/${username}/`,
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) return null
  const json = await res.json()
  return json?.data?.user ?? null
}

// ── Strategy 3: ?__a=1 JSON shortcut ─────────────────────────────────────────
async function fetchViaA1(username: string) {
  const res = await fetch(
    `https://www.instagram.com/${username}/?__a=1&__d=dis`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        Accept: 'application/json, text/plain, */*',
        'X-IG-App-ID': '936619743392459',
        Referer: `https://www.instagram.com/${username}/`,
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) return null
  try {
    const json = await res.json()
    return json?.graphql?.user ?? json?.user ?? null
  } catch {
    return null
  }
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
    .split('?')[0]
    .split('/')[0]
    .trim()

  if (!username) {
    return NextResponse.json({ error: 'Handle inválido.' }, { status: 400 })
  }

  try {
    // Try all three strategies, use the first that succeeds
    let user: any = null

    user = await fetchViaInternalAPI(username).catch(() => null)
    if (!user) user = await fetchViaA1(username).catch(() => null)
    if (!user) user = await fetchViaGraphQL(username).catch(() => null)

    if (!user) {
      return NextResponse.json(
        {
          error: `Perfil @${username} não encontrado, privado ou temporariamente indisponível. Preencha os campos manualmente.`,
        },
        { status: 404 }
      )
    }

    // ── Normalize field names across strategies ────────────────────────────
    const name: string =
      user.full_name || user.biography_with_entities?.raw_text || username

    const bio: string =
      user.biography ||
      user.biography_with_entities?.raw_text ||
      ''

    const avatarUrl: string =
      user.profile_pic_url_hd ||
      user.profile_pic_url ||
      ''

    const followers: string = fmtCount(
      user.follower_count ?? user.edge_followed_by?.count
    )
    const following: string = fmtCount(
      user.following_count ?? user.edge_follow?.count
    )
    const posts: string = fmtCount(
      user.media_count ?? user.edge_owner_to_timeline_media?.count
    )

    // ── Highlights ────────────────────────────────────────────────────────
    const highlights: { title: string; image_url: string }[] = []
    const rawHl: any[] =
      user.highlight_reel_count
        ? [] // count only, no data
        : (user.edge_highlight_reels?.edges ?? [])

    for (const edge of rawHl) {
      const node = edge?.node
      if (node?.title) {
        highlights.push({
          title: node.title,
          image_url: node.cover_media?.thumbnail_src || node.cover_media_cropped_thumbnail?.url || '',
        })
      }
    }

    return NextResponse.json({
      username,
      name,
      bio,
      avatar_url: avatarUrl,
      followers,
      following,
      posts,
      highlights,
    })
  } catch (err: any) {
    console.error('[ig-scrape]', err)
    return NextResponse.json(
      { error: err.message || 'Erro interno ao buscar perfil.' },
      { status: 500 }
    )
  }
}
