const YOUTUBE_DATA_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeChannelListResponse {
  items?: Array<{
    id: string;
    snippet?: { title?: string };
  }>;
}

/** ログイン中のGoogleアカウントが所有するYouTubeチャンネルの基本情報を取得する。 */
export async function fetchMyChannel(accessToken: string): Promise<YouTubeChannelListResponse> {
  const url = new URL(`${YOUTUBE_DATA_API_BASE}/channels`);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('mine', 'true');

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`YouTube Data API error: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<YouTubeChannelListResponse>;
}
