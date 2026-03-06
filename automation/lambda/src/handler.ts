/**
 * Jira Automation Lambda Handler
 *
 * Flow: Jira Webhook → Validate → Dedup → Dispatch GitHub Actions → Notify
 *
 * This is the single entry-point Lambda. It receives Jira webhooks when a ticket
 * moves to "TRIGGER AGENT", validates the payload, checks for duplicates via
 * DynamoDB, dispatches a GitHub Actions workflow (which runs Claude Code),
 * and sends initial notifications.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JiraWebhookEvent {
  webhookEvent: string;
  issue: {
    key: string;
    fields: {
      summary: string;
      description: string | null;
      status: { name: string };
      issuetype: { name: string };
      labels: string[];
      assignee?: { displayName: string } | null;
    };
  };
  changelog?: {
    items: Array<{
      field: string;
      fromString: string | null;
      toString: string | null;
    }>;
  };
}

interface TaskRecord {
  taskFingerprint: string;
  taskId: string;
  status: string;
  issueKey: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  ttl: number;
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

function env(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
}

function envOpt(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

// ---------------------------------------------------------------------------
// Config (loaded once per cold start)
// ---------------------------------------------------------------------------

const config = {
  // Jira
  jiraBaseUrl: () => env("JIRA_BASE_URL"),
  jiraEmail: () => env("JIRA_EMAIL"),
  jiraApiToken: () => env("JIRA_API_TOKEN"),
  jiraProjectKey: () => env("JIRA_PROJECT_KEY"),
  webhookSecret: () => env("JIRA_WEBHOOK_SECRET"),

  // GitHub
  githubToken: () => env("GITHUB_TOKEN"),
  githubOwner: () => env("GITHUB_OWNER"),
  githubRepo: () => env("GITHUB_REPO"),
  githubAgentRepo: () => envOpt("GITHUB_AGENT_REPO", ""),

  // Slack
  slackWebhookUrl: () => env("SLACK_WEBHOOK_URL"),

  // DynamoDB
  tableName: () => env("DYNAMODB_TABLE"),

  // Target status names (configurable per Jira project)
  triggerStatus: () => envOpt("TRIGGER_STATUS", "TRIGGER AGENT"),
  inProgressStatus: () => envOpt("IN_PROGRESS_STATUS", "IN PROGRESS"),
  codeReviewStatus: () => envOpt("CODE_REVIEW_STATUS", "CODE REVIEW"),
};

// ---------------------------------------------------------------------------
// DynamoDB Client
// ---------------------------------------------------------------------------

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function respond(statusCode: number, body: object): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function generateFingerprint(issueKey: string): string {
  // Simple deterministic fingerprint from issue key
  // No need for crypto hash — issue keys are already unique identifiers
  return `jira:${issueKey}`;
}

function generateTaskId(): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function log(msg: string, data?: Record<string, unknown>) {
  console.log(JSON.stringify({ message: msg, ...data, ts: new Date().toISOString() }));
}

// ---------------------------------------------------------------------------
// Webhook Verification
// ---------------------------------------------------------------------------

function verifyWebhook(headers: Record<string, string | undefined>): boolean {
  const secret = config.webhookSecret();
  const provided = headers["x-webhook-secret"] || headers["X-Webhook-Secret"];
  return provided === secret;
}

// ---------------------------------------------------------------------------
// Jira API Helpers
// ---------------------------------------------------------------------------

function jiraHeaders(): Record<string, string> {
  const auth = Buffer.from(
    `${config.jiraEmail()}:${config.jiraApiToken()}`
  ).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function jiraUrl(path: string): string {
  const base = config.jiraBaseUrl().replace(/\/$/, "");
  const protocol = base.startsWith("http") ? "" : "https://";
  return `${protocol}${base}/rest/api/3${path}`;
}

async function jiraTransition(
  issueKey: string,
  targetStatusName: string
): Promise<boolean> {
  try {
    // 1. Get available transitions
    const res = await fetch(
      jiraUrl(`/issue/${issueKey}/transitions`),
      { headers: jiraHeaders() }
    );
    if (!res.ok) {
      log("Failed to get Jira transitions", {
        issueKey,
        status: res.status,
        body: await res.text(),
      });
      return false;
    }

    const data = (await res.json()) as {
      transitions: Array<{ id: string; name: string; to: { name: string } }>;
    };

    // 2. Find matching transition (match by destination status name)
    const transition = data.transitions.find(
      (t) => t.to.name.toUpperCase() === targetStatusName.toUpperCase()
    );

    if (!transition) {
      log("Transition not found", {
        issueKey,
        targetStatusName,
        available: data.transitions.map((t) => t.to.name),
      });
      return false;
    }

    // 3. Execute transition
    const transRes = await fetch(
      jiraUrl(`/issue/${issueKey}/transitions`),
      {
        method: "POST",
        headers: jiraHeaders(),
        body: JSON.stringify({ transition: { id: transition.id } }),
      }
    );

    if (!transRes.ok) {
      log("Failed to execute Jira transition", {
        issueKey,
        transitionId: transition.id,
        status: transRes.status,
      });
      return false;
    }

    log("Jira transition successful", { issueKey, to: targetStatusName });
    return true;
  } catch (err) {
    log("Jira transition error", { issueKey, error: String(err) });
    return false;
  }
}

async function jiraComment(issueKey: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(jiraUrl(`/issue/${issueKey}/comment`), {
      method: "POST",
      headers: jiraHeaders(),
      body: JSON.stringify({
        body: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text }],
            },
          ],
        },
      }),
    });
    if (!res.ok) {
      log("Failed to post Jira comment", { issueKey, status: res.status });
      return false;
    }
    return true;
  } catch (err) {
    log("Jira comment error", { issueKey, error: String(err) });
    return false;
  }
}

// ---------------------------------------------------------------------------
// GitHub API Helpers
// ---------------------------------------------------------------------------

function githubHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${config.githubToken()}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function checkOpenAgentPR(issueKey: string): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${config.githubOwner()}/${config.githubRepo()}/pulls?state=open&head=${config.githubOwner()}:agent/${issueKey.toLowerCase()}`;
    const res = await fetch(url, { headers: githubHeaders() });
    if (!res.ok) return null;

    const prs = (await res.json()) as Array<{
      html_url: string;
      head: { ref: string };
    }>;

    // Check if any open PR branch starts with agent/{issueKey}
    const match = prs.find((pr) =>
      pr.head.ref.toLowerCase().startsWith(`agent/${issueKey.toLowerCase()}`)
    );
    return match ? match.html_url : null;
  } catch {
    return null;
  }
}

async function triggerGitHubDispatch(payload: {
  taskId: string;
  taskFingerprint: string;
  issueKey: string;
  summary: string;
  description: string;
  branchName: string;
}): Promise<boolean> {
  try {
    const owner = config.githubOwner();
    const repo = config.githubRepo();

    const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`;
    const res = await fetch(url, {
      method: "POST",
      headers: githubHeaders(),
      body: JSON.stringify({
        event_type: "agent-task",
        client_payload: payload,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      log("GitHub dispatch failed", { status: res.status, body });
      return false;
    }

    log("GitHub dispatch triggered", { owner, repo, taskId: payload.taskId });
    return true;
  } catch (err) {
    log("GitHub dispatch error", { error: String(err) });
    return false;
  }
}

// ---------------------------------------------------------------------------
// Slack Helper
// ---------------------------------------------------------------------------

async function slackNotify(message: {
  issueKey: string;
  summary: string;
  status: string;
  prUrl?: string;
  error?: string;
}): Promise<void> {
  try {
    const url = config.slackWebhookUrl();
    const emoji = message.error ? "🔴" : message.prUrl ? "🟢" : "🔵";
    const text = [
      `${emoji} *Jira Automation* — \`${message.issueKey}\``,
      `*Summary:* ${message.summary}`,
      `*Status:* ${message.status}`,
      message.prUrl ? `*PR:* ${message.prUrl}` : null,
      message.error ? `*Error:* ${message.error}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    log("Slack notify error (non-fatal)", { error: String(err) });
  }
}

// ---------------------------------------------------------------------------
// DynamoDB Dedup
// ---------------------------------------------------------------------------

const ACTIVE_STATUSES = ["dispatched", "in_progress", "fixing"];

async function checkActiveTask(
  fingerprint: string
): Promise<TaskRecord | null> {
  const result = await ddb.send(
    new QueryCommand({
      TableName: config.tableName(),
      KeyConditionExpression: "taskFingerprint = :fp",
      ExpressionAttributeValues: { ":fp": fingerprint },
      ScanIndexForward: false,
      Limit: 10,
    })
  );

  const active = (result.Items || []).find((item) =>
    ACTIVE_STATUSES.includes(item.status as string)
  );
  return active ? (active as TaskRecord) : null;
}

async function claimFingerprint(fingerprint: string): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const ttl = now + 8 * 60 * 60; // 8h claim expiry

  try {
    await ddb.send(
      new PutCommand({
        TableName: config.tableName(),
        Item: {
          taskFingerprint: fingerprint,
          taskId: "CLAIM",
          status: "claimed",
          ttl,
          createdAt: new Date().toISOString(),
        },
        ConditionExpression:
          "attribute_not_exists(taskFingerprint) OR #ttl < :now",
        ExpressionAttributeNames: { "#ttl": "ttl" },
        ExpressionAttributeValues: { ":now": now },
      })
    );
    return true;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "name" in err &&
      (err as { name: string }).name === "ConditionalCheckFailedException"
    ) {
      log("Fingerprint already claimed", { fingerprint });
      return false;
    }
    throw err;
  }
}

async function releaseFingerprint(fingerprint: string): Promise<void> {
  try {
    await ddb.send(
      new DeleteCommand({
        TableName: config.tableName(),
        Key: { taskFingerprint: fingerprint, taskId: "CLAIM" },
      })
    );
  } catch (err) {
    log("Release fingerprint error (non-fatal)", { error: String(err) });
  }
}

async function createTask(
  fingerprint: string,
  taskId: string,
  issueKey: string,
  summary: string
): Promise<void> {
  const now = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7d

  await ddb.send(
    new PutCommand({
      TableName: config.tableName(),
      Item: {
        taskFingerprint: fingerprint,
        taskId,
        status: "dispatched",
        issueKey,
        summary,
        createdAt: now,
        updatedAt: now,
        ttl,
      },
    })
  );
}

// ---------------------------------------------------------------------------
// Webhook Event Parsing
// ---------------------------------------------------------------------------

function parseWebhookEvent(body: string): JiraWebhookEvent | null {
  try {
    return JSON.parse(body) as JiraWebhookEvent;
  } catch {
    // Jira Automation smart values may inject unescaped newlines/tabs inside
    // JSON string values. Escape them and retry.
    try {
      const sanitized = body.replace(
        /"(?:[^"\\]|\\.)*"/g,
        (match) => match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
      );
      return JSON.parse(sanitized) as JiraWebhookEvent;
    } catch {
      return null;
    }
  }
}

function isStatusTransitionToTrigger(event: JiraWebhookEvent): boolean {
  const triggerStatus = config.triggerStatus().toUpperCase();

  // Check changelog for status field change
  if (event.changelog?.items) {
    const statusChange = event.changelog.items.find(
      (item) => item.field === "status"
    );
    if (statusChange && statusChange.toString?.toUpperCase() === triggerStatus) {
      return true;
    }
  }

  // Fallback: check current status
  return event.issue.fields.status.name.toUpperCase() === triggerStatus;
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  log("Lambda invoked", {
    method: event.requestContext?.http?.method,
    path: event.requestContext?.http?.path,
  });

  // ── Health check ──
  if (event.requestContext?.http?.method === "GET") {
    return respond(200, { status: "ok", service: "jira-automation" });
  }

  // ── Verify webhook secret ──
  const headers = event.headers || {};
  if (!verifyWebhook(headers)) {
    log("Webhook verification failed");
    return respond(401, { error: "Unauthorized" });
  }

  // ── Parse event ──
  const rawBody = event.body || "";
  log("Raw webhook body", { body: rawBody.slice(0, 2000) });

  const webhookEvent = parseWebhookEvent(rawBody);
  if (!webhookEvent || !webhookEvent.issue) {
    log("Invalid webhook payload", { bodyLength: rawBody.length, parsed: !!webhookEvent });
    return respond(400, { error: "Invalid payload" });
  }

  const issueKey = webhookEvent.issue.key;
  const summary = webhookEvent.issue.fields.summary;
  const description = webhookEvent.issue.fields.description || "";

  log("Processing webhook", { issueKey, summary, event: webhookEvent.webhookEvent });

  // ── Check if this is a TRIGGER AGENT transition ──
  if (!isStatusTransitionToTrigger(webhookEvent)) {
    log("Not a trigger transition, skipping", {
      issueKey,
      currentStatus: webhookEvent.issue.fields.status.name,
    });
    return respond(200, { message: "Ignored — not a trigger transition" });
  }

  const fingerprint = generateFingerprint(issueKey);
  const taskId = generateTaskId();
  const branchName = `agent/${issueKey.toLowerCase()}-${slugify(summary)}`;

  // ── Dedup: check for active tasks ──
  const activeTask = await checkActiveTask(fingerprint);
  if (activeTask) {
    log("Active task exists, skipping", { issueKey, activeTaskId: activeTask.taskId });
    return respond(200, { message: "Duplicate — active task exists" });
  }

  // ── Dedup: check for open PRs ──
  const existingPR = await checkOpenAgentPR(issueKey);
  if (existingPR) {
    log("Open PR exists, skipping", { issueKey, pr: existingPR });
    return respond(200, { message: "Duplicate — open PR exists", pr: existingPR });
  }

  // ── Atomic claim ──
  const claimed = await claimFingerprint(fingerprint);
  if (!claimed) {
    log("Fingerprint already claimed, skipping", { issueKey });
    return respond(200, { message: "Duplicate — concurrent claim" });
  }

  try {
    // ── Create task record ──
    await createTask(fingerprint, taskId, issueKey, summary);

    // ── Transition Jira to IN PROGRESS ──
    await jiraTransition(issueKey, config.inProgressStatus());

    // ── Post Jira comment: work started ──
    await jiraComment(
      issueKey,
      `🤖 Agent automation started.\nTask ID: ${taskId}\nBranch: ${branchName}\nThe agent is now working on this issue.`
    );

    // ── Dispatch GitHub Actions ──
    const dispatched = await triggerGitHubDispatch({
      taskId,
      taskFingerprint: fingerprint,
      issueKey,
      summary,
      description: typeof description === "string" ? description : JSON.stringify(description),
      branchName,
    });

    if (!dispatched) {
      throw new Error("GitHub dispatch failed");
    }

    // ── Slack: work started ──
    await slackNotify({
      issueKey,
      summary,
      status: "Agent dispatched — working on implementation",
    });

    // ── Release claim (task record now tracks state) ──
    await releaseFingerprint(fingerprint);

    log("Dispatch complete", { issueKey, taskId, branchName });
    return respond(200, {
      message: "Dispatched",
      taskId,
      branchName,
      issueKey,
    });
  } catch (err) {
    log("Handler error", { issueKey, error: String(err) });

    // Release the claim so retries can work
    await releaseFingerprint(fingerprint);

    // Best-effort notifications
    await jiraComment(
      issueKey,
      `🔴 Agent automation failed to start.\nError: ${String(err)}\nPlease check logs and retry by moving the ticket back to TODO, then to TRIGGER AGENT again.`
    );
    await slackNotify({
      issueKey,
      summary,
      status: "Failed to dispatch",
      error: String(err),
    });

    return respond(500, { error: "Dispatch failed", details: String(err) });
  }
}
