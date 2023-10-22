import { Hono } from "hono";
import { SlackEdgeAppEnv } from "slack-cloudflare-workers";
import { Bindings } from "./type";
import { fetchFeedlyMixes } from "./lib/feedly";
import { slackMessenger } from "./lib/slack";

const app = new Hono<{ Bindings: Bindings }>();

const parseMessage = ({
  title,
  url,
}: {
  title: string;
  url: string;
}): string => {
  return `*<${url}|${title}>*`;
};

app.get("/api/slack", async (c) => {
  const { env } = c;
  const feedItems = await fetchFeedlyMixes(env);
  const postMessage = slackMessenger(env as SlackEdgeAppEnv);

  for (const item of feedItems) {
    await postMessage(parseMessage(item));
  }

  return c.text(String("ok"), 200);
});

const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (
  _,
  env,
  ctx,
) => {
  const func = async () => {
    const feedItems = await fetchFeedlyMixes(env);
    const postMessage = slackMessenger(env as SlackEdgeAppEnv);

    for (const item of feedItems) {
      await postMessage(parseMessage(item));
    }
  };
  ctx.waitUntil(func());
};

export default {
  fetch: app.fetch,
  scheduled,
};
