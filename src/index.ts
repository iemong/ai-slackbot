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

const mainFunction = async (env: Bindings) => {
  const feedItems = await fetchFeedlyMixes(env);
  const postMessage = slackMessenger(env as SlackEdgeAppEnv);

  for (const item of feedItems) {
    await postMessage(parseMessage(item));
  }
};


app.get("/api/slack", async (c) => {
  return c.text(String("ok"), 200);
});

const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (
  _,
  env,
  ctx,
) => {
  ctx.waitUntil(mainFunction(env));
};

export default {
  fetch: app.fetch,
  scheduled,
};
