import { Bindings } from "../type";

interface ArticleSummary {
  content: string;
  direction: string;
}

interface Origin {
  htmlUrl: string;
  streamId: string;
  title: string;
}

interface Category {
  id: string;
  label: string;
}

type Item = {
  language: string;
  id: string;
  fingerprint: string;
  keywords: string[];
  originId: string;
  origin: Origin;
  published: number;
  summary: ArticleSummary;
  alternate: { href: string; type: string }[];
  title: string;
  crawled: number;
  canonicalUrl: string;
  d: boolean;
  categories: Category[];
  engagement: number;
  engagementRate: number;
};

type Response = {
  id: string;
  items: Item[];
};
export const fetchFeedlyMixes = async <T extends Bindings>(env: T) => {
  const accessToken = await fetch("https://cloud.feedly.com/v3/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: "feedlydev",
      client_secret: "feedlydev",
      grant_type: "refresh_token",
      refresh_token: env.FEEDLY_REFRESH_TOKEN,
    }),
  }).then(async (res) => {
    const json = await res.json<{ access_token: string }>();
    return json.access_token;
  });

  const feedlyStreamId = `${encodeURIComponent(
    "user/f976596c-2e5d-4c61-bddd-e88241c5ecd0/category/global.all",
  )}&count=10&hours=24&unreadOnly=true`;
  const apiPath = `https://cloud.feedly.com/v3/mixes/contents?streamId=${feedlyStreamId}`;

  const headers = new Headers();
  headers.append("Authorization", `OAuth ${accessToken}`);

  const feedlyResponse = await fetch(apiPath, {
    method: "GET",
    headers: headers,
  });

  const json = (await feedlyResponse.json()) as Response;
  return json.items.map((item) => ({
    title: item.title,
    url: item.canonicalUrl ?? item.originId,
  }));
};
