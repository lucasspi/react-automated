# Jira Automation — Lean Agent Pipeline

Automated engineering workflow: move a Jira ticket to **TRIGGER AGENT** → Lambda validates + deduplicates → GitHub Actions runs Claude Code → PR created → ticket moves to **CODE REVIEW**.

## Architecture

```
Jira Board Move (TODO → TRIGGER AGENT)
    │
    ▼
Jira Webhook (POST to Lambda Function URL)
    │
    ▼
AWS Lambda (Node.js 20)
    ├─ Verify webhook secret
    ├─ Parse issue details
    ├─ DynamoDB dedup check (fingerprint + atomic claim)
    ├─ Check for existing open PRs
    ├─ Transition Jira → IN PROGRESS
    ├─ Post Jira comment (work started)
    ├─ Trigger GitHub repository_dispatch
    └─ Slack notification (dispatched)
    │
    ▼
GitHub Actions Workflow (agent-task.yml)
    ├─ Checkout repo + create branch
    ├─ Run Claude Code (implements changes)
    ├─ Commit + push + create PR
    ├─ Transition Jira → CODE REVIEW
    ├─ Post Jira comment (PR link + summary)
    ├─ Slack notification (PR ready)
    └─ Update DynamoDB status
    │
    ▼
Human takes over (code review)
```

## Deduplication Strategy

Three layers prevent duplicate work:

1. **Active task check** — DynamoDB query for tasks with `dispatched`/`in_progress`/`fixing` status
2. **Open PR check** — GitHub API check for existing agent PRs for this issue
3. **Atomic claim** — DynamoDB conditional write prevents concurrent Lambda executions

Claims auto-expire after 8 hours (TTL). Task records auto-expire after 7 days.

## Setup

### 1. Build the Lambda

```bash
cd automation/lambda
npm install
npm run deploy   # builds + zips to deploy.zip
```

### 2. Deploy Infrastructure

```bash
cd automation/infra
terraform init
terraform apply \
  -var="jira_base_url=spirandeli.atlassian.net" \
  -var="jira_email=lucas@spirandeli.com" \
  -var="jira_api_token=YOUR_TOKEN" \
  -var="jira_webhook_secret=YOUR_SECRET" \
  -var="github_token=YOUR_GITHUB_PAT" \
  -var="slack_webhook_url=YOUR_SLACK_URL"
```

Save the `lambda_function_url` output — you'll need it for the Jira webhook.

### 3. Configure Jira Webhook

In Jira → Project Settings → Automation (or Webhooks):

- **URL:** The Lambda Function URL from Terraform output
- **Header:** `x-webhook-secret: YOUR_SECRET` (same as `JIRA_WEBHOOK_SECRET`)
- **Events:** Issue Updated
- **Filter:** Project = ST AND status changed to "TRIGGER AGENT"

### 4. Configure GitHub Secrets

In `lucasspi/react-automated` → Settings → Secrets:

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key for Claude Code |
| `JIRA_BASE_URL` | `spirandeli.atlassian.net` |
| `JIRA_EMAIL` | `lucas@spirandeli.com` |
| `JIRA_API_TOKEN` | Jira API token |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL |
| `DYNAMODB_TABLE` | `jira-agent-tasks-prod` |
| `AWS_REGION` | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | For DynamoDB updates (optional) |
| `AWS_SECRET_ACCESS_KEY` | For DynamoDB updates (optional) |

### 5. Create Slack Incoming Webhook

1. Go to [Slack API](https://api.slack.com/apps)
2. Create app → Incoming Webhooks → Activate
3. Add webhook to your channel
4. Copy the URL

## Testing End-to-End

1. Create a Jira ticket in project ST with a clear description
2. Move it from **TODO** to **TRIGGER AGENT**
3. Watch:
   - Lambda logs in CloudWatch
   - Jira ticket moves to **IN PROGRESS** + comment appears
   - GitHub Actions workflow starts
   - PR is created
   - Jira ticket moves to **CODE REVIEW** + final comment
   - Slack notifications arrive

### Manual Lambda Test

```bash
# Health check
curl https://YOUR_FUNCTION_URL

# Simulate webhook (replace with your function URL and secret)
curl -X POST https://YOUR_FUNCTION_URL \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -d '{
    "webhookEvent": "jira:issue_updated",
    "issue": {
      "key": "ST-1",
      "fields": {
        "summary": "Add a dark mode toggle",
        "description": "Add a toggle in the header that switches between light and dark themes",
        "status": { "name": "TRIGGER AGENT" },
        "issuetype": { "name": "Task" },
        "labels": []
      }
    },
    "changelog": {
      "items": [{
        "field": "status",
        "fromString": "TODO",
        "toString": "TRIGGER AGENT"
      }]
    }
  }'
```

## File Structure

```
automation/
├── README.md              ← This file
├── lambda/
│   ├── package.json       ← Lambda dependencies + build scripts
│   ├── tsconfig.json      ← TypeScript config
│   ├── .env.example       ← Environment variable template
│   └── src/
│       └── handler.ts     ← Lambda handler (single file)
└── infra/
    └── main.tf            ← Terraform: Lambda + DynamoDB + IAM + Function URL

.github/
└── workflows/
    └── agent-task.yml     ← GitHub Actions: Claude Code + PR + notifications
```

## Known Limitations

1. **Jira description parsing** — Rich text (ADF format) is forwarded as-is to Claude. Works for simple text; complex formatting may lose structure.
2. **No retry queue** — If the Lambda fails, the ticket stays in IN PROGRESS. Move it back to TODO → TRIGGER AGENT to retry.
3. **Single repo** — Currently hardcoded to `react-automated`. To support multiple repos, add a repo mapping based on Jira labels or components.
4. **DynamoDB updates from GitHub Actions** — Requires AWS credentials as GitHub secrets. If not configured, task tracking in DynamoDB is skipped (everything else still works).
5. **Claude Code action** — Requires `anthropics/claude-code-action@v1` to be available. Check the [action docs](https://github.com/anthropics/claude-code-action) for setup.

## Branch Naming

Format: `agent/{issue-key}-{slugified-summary}`

Example: `agent/st-1-add-dark-mode-toggle`
