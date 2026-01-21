/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "stream";

import { isbot } from "isbot";
import ReactDOMServer from "react-dom/server";
const { renderToReadableStream, renderToPipeableStream, renderToString } =
  ReactDOMServer;
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";

// Reject/cancel all pending promises after 5 seconds
export const streamTimeout = 5000;

function isEdgeRuntime() {
  return process?.env?.CF_PAGES === "1";
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
) {
  const controller = new AbortController();

  // Automatically timeout the React renderer after 6 seconds, which ensures
  // React has enough time to flush down the rejected boundary contents
  const timeoutId = setTimeout(() => {
    console.warn("SSR TIMEOUT: Aborting render");
    controller.abort();
  }, streamTimeout + 1000);

  console.log("[handleRequest] URL:", request.url);

  let body: ReadableStream<Uint8Array>;
  let didError = false;

  const userAgent = request.headers.get("user-agent") ?? "";
  const bot = isbot(userAgent);

  try {
    if (isEdgeRuntime()) {
      // -------------------------------------------
      // ① エッジ環境 (Cloudflare Workers 等)
      //    → renderToReadableStream
      // -------------------------------------------
      // Node.js では使わない API があるため、import * as ReactDOMServer の形で
      // すべてインポート済みの場合でも問題ありません。

      body = await renderToReadableStream(
        <ServerRouter context={reactRouterContext} url={request.url} />,
        {
          signal: controller.signal,
          onError(err: unknown) {
            console.error("[Edge] SSR Error:", err);
            didError = true;
          },
        },
      );

      // Bot なら allReady を待機してから返す (クローラー向けに完全なHTMLを返したい場合)
      if (bot) {
        // react が allReadyを追加している : https://react.dev/reference/react-dom/server/renderToReadableStream
        await body.allReady;
      }
    } else {
      // -------------------------------------------
      // ② Node.js 環境
      //    → renderToPipeableStream + PassThrough
      // -------------------------------------------
      // ESM 環境では require('stream') が使えないので動的 import
      // 同様に react-dom/server も動的に取り出す場合はこう書く
      // const serverMod = await import("react-dom/server");
      // const { renderToPipeableStream } = serverMod;

      body = new ReadableStream<Uint8Array>({
        start(controller) {
          const { pipe } = renderToPipeableStream(
            <ServerRouter context={reactRouterContext} url={request.url} />,
            {
              onShellError(err: unknown) {
                console.error("[Node] SSR Shell Error:", err);
                didError = true;
              },
              onError(err: unknown) {
                console.error("[Node] SSR Stream Error:", err);
                didError = true;
              },
            },
          );

          const passThrough = new PassThrough();
          pipe(passThrough);

          passThrough.on("data", (chunk: Buffer) => {
            controller.enqueue(chunk);
          });
          passThrough.on("end", () => {
            controller.close();
          });
          passThrough.on("error", (err: unknown) => {
            console.error("[Node] PassThrough Error:", err);
            didError = true;
            controller.error(err);
          });
        },
      });
    }
  } catch (err) {
    // ストリーミングに失敗したときはフォールバック
    console.error("SSR Streaming failed:", err);
    didError = true;

    body = new ReadableStream({
      start(controller) {
        try {
          const html = renderToString(
            <ServerRouter context={reactRouterContext} url={request.url} />,
          );
          controller.enqueue(new TextEncoder().encode(html));
          controller.close();
        } catch (fallbackErr) {
          // フォールバックすら失敗
          console.error("SSR Fallback failed:", fallbackErr);
          controller.close();
        }
      },
    });
  }

  clearTimeout(timeoutId);

  responseHeaders.set("Content-Type", "text/html");

  return new Response(body, {
    headers: responseHeaders,
    status: didError ? 500 : responseStatusCode,
  });
}
