interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  GITHUB_WEBHOOK_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event");
    const body = await request.text();

    if (!signature || !event) {
      return new Response("Missing headers", { status: 400 });
    }

    const isValid = await verifySignature(body, signature, env.GITHUB_WEBHOOK_SECRET);
    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }

    if (event === "ping") {
      return new Response("pong", { status: 200 });
    }

    try {
      const payload = JSON.parse(body);
      const message = formatMessage(event, payload);

      if (message) {
        await sendTelegram(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, message);
      }
    } catch (err) {
      return new Response(`Error: ${err}`, { status: 500 });
    }

    return new Response("OK", { status: 200 });
  },
};

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const digest = "sha256=" + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return signature === digest;
}

function formatMessage(event: string, payload: any): string | null {
  const repo = payload.repository?.full_name ?? "unknown repo";

  if (event === "issue_comment" && payload.action === "created") {
    const user = payload.comment.user.login;
    const issueTitle = payload.issue.title;
    const issueNumber = payload.issue.number;
    const commentBody = truncate(payload.comment.body, 300);
    const url = payload.comment.html_url;
    const isPR = !!payload.issue.pull_request;
    const type = isPR ? "PR" : "Issue";

    return [
      `💬 <b>New comment on ${type} #${issueNumber}</b>`,
      `<b>Repo:</b> ${escapeHtml(repo)}`,
      `<b>${type}:</b> ${escapeHtml(issueTitle)}`,
      `<b>By:</b> ${escapeHtml(user)}`,
      ``,
      escapeHtml(commentBody),
      ``,
      `<a href="${url}">View comment</a>`,
    ].join("\n");
  }

  if (event === "pull_request_review_comment" && payload.action === "created") {
    const user = payload.comment.user.login;
    const prTitle = payload.pull_request.title;
    const prNumber = payload.pull_request.number;
    const file = payload.comment.path;
    const commentBody = truncate(payload.comment.body, 300);
    const url = payload.comment.html_url;

    return [
      `🔍 <b>Review comment on PR #${prNumber}</b>`,
      `<b>Repo:</b> ${escapeHtml(repo)}`,
      `<b>PR:</b> ${escapeHtml(prTitle)}`,
      `<b>File:</b> <code>${escapeHtml(file)}</code>`,
      `<b>By:</b> ${escapeHtml(user)}`,
      ``,
      escapeHtml(commentBody),
      ``,
      `<a href="${url}">View comment</a>`,
    ].join("\n");
  }

  if (event === "pull_request_review" && payload.action === "submitted") {
    const user = payload.review.user.login;
    const prTitle = payload.pull_request.title;
    const prNumber = payload.pull_request.number;
    const state = payload.review.state; // approved, changes_requested, commented
    const reviewBody = truncate(payload.review.body ?? "", 300);
    const url = payload.review.html_url;

    const stateEmoji: Record<string, string> = {
      approved: "✅ Approved",
      changes_requested: "❌ Changes Requested",
      commented: "💭 Reviewed",
    };

    return [
      `📝 <b>${stateEmoji[state] ?? state} — PR #${prNumber}</b>`,
      `<b>Repo:</b> ${escapeHtml(repo)}`,
      `<b>PR:</b> ${escapeHtml(prTitle)}`,
      `<b>By:</b> ${escapeHtml(user)}`,
      reviewBody ? `\n${escapeHtml(reviewBody)}` : "",
      ``,
      `<a href="${url}">View review</a>`,
    ].join("\n");
  }

  return null;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "…";
}

async function sendTelegram(token: string, chatId: string, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
}
