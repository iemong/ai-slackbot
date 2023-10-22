import { SlackApp, SlackEdgeAppEnv } from "slack-cloudflare-workers";

const CHANNEL = "#rss";

export const slackMessenger =
  (env: SlackEdgeAppEnv) => async (text: string) => {
    const client = new SlackApp({ env }).client;
    const response = await client.chat.postMessage({
      channel: CHANNEL,
      text,
    });
  };
