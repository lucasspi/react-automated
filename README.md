# react-automated

A React + TypeScript application with an automated Jira-to-GitHub development pipeline. When a Jira ticket is moved to "TRIGGER AGENT", an AWS Lambda function triggers a GitHub Actions workflow that runs Claude Code to implement the changes, create a pull request, and transition the issue to code review — all automatically.

## Project Overview

**react-automated** combines a modern React frontend with a fully automated agent-driven development workflow:

- **React Frontend** (`src/`) — A React 19 + TypeScript + Vite application
- **Automation Infrastructure** (`automation/`) — AWS Lambda and DynamoDB for handling Jira webhooks and task deduplication
- **CI/CD Agent Workflow** (`.github/workflows/agent-task.yml`) — GitHub Actions workflow that runs Claude Code to implement Jira tickets autonomously

The automation pipeline reads Jira ticket descriptions, implements the requested changes, commits code, creates pull requests, updates Jira status, and posts notifications to Slack.

## Tech Stack

- **React 19** — Modern React with concurrent features
- **TypeScript 5.9** — Type-safe development
- **Vite 7** — Fast build tool and dev server with HMR
- **ESLint** — Code linting and quality checks
- **GitHub Actions** — CI/CD automation
- **AWS Lambda** — Serverless webhook handler (Node.js 20)
- **AWS DynamoDB** — Task deduplication and state tracking
- **Jira API** — Issue tracking and status transitions
- **Slack Webhooks** — Team notifications

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Available Scripts

- `npm run dev` — Start development server with hot module reloading
- `npm run build` — Type-check with TypeScript and build for production
- `npm run lint` — Run ESLint to check code quality
- `npm run preview` — Preview production build locally

## Project Structure

```
react-automated/
├── src/                  # React application source code
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── assets/           # Static assets
├── automation/           # Infrastructure and Lambda functions
│   ├── lambda/           # AWS Lambda webhook handler
│   │   └── src/handler.ts
│   └── infra/            # Terraform infrastructure definitions
│       └── main.tf
├── .github/workflows/    # GitHub Actions workflows
│   └── agent-task.yml    # Claude Code agent automation
└── public/               # Public static files
```

## Jira Automation Workflow

The automated agent pipeline works as follows:

1. **Jira Trigger** — Move a Jira ticket from TODO to "TRIGGER AGENT"
2. **Webhook to Lambda** — Jira sends a webhook POST to AWS Lambda Function URL
3. **Task Validation** — Lambda verifies the webhook, checks for duplicates in DynamoDB, validates no existing PRs exist
4. **Jira Update** — Lambda transitions the issue to "IN PROGRESS" and posts a comment
5. **GitHub Dispatch** — Lambda triggers GitHub Actions via `repository_dispatch` event with ticket details
6. **Agent Implementation** — GitHub Actions workflow:
   - Checks out the repository and creates a feature branch
   - Installs dependencies and Claude Code CLI
   - Runs Claude Code with the Jira ticket description as a prompt
   - Claude Code reads relevant files, implements the changes, and verifies compilation
7. **PR Creation** — If changes were made, commits are pushed and a pull request is created
8. **Status Transition** — Jira ticket is transitioned to "CODE REVIEW"
9. **Notifications** — Updates are posted to:
   - Jira (comment with PR link)
   - Slack (notification with PR and workflow links)
   - DynamoDB (task status tracking)

The entire process is fully automated from ticket assignment to code review, with human review only required for PR approval.

## Environment Variables / Secrets

The following secrets must be configured in GitHub repository settings (Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | API key for Claude Code (Anthropic) |
| `AWS_ACCESS_KEY_ID` | AWS access key for DynamoDB updates |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for DynamoDB updates |
| `AWS_REGION` | AWS region for DynamoDB (e.g., `us-east-1`) |
| `JIRA_EMAIL` | Email for Jira API authentication |
| `JIRA_API_TOKEN` | API token for Jira API authentication |
| `JIRA_BASE_URL` | Jira instance base URL (e.g., `company.atlassian.net`) |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL for notifications |
| `DYNAMODB_TABLE` | DynamoDB table name for task tracking (e.g., `jira-agent-tasks-prod`) |

Additional infrastructure setup and Lambda configuration details are documented in `automation/README.md`.

## Contributing

This project uses an automated agent workflow. To contribute:

1. Create a Jira ticket with a clear description of the desired changes
2. Move the ticket to "TRIGGER AGENT" status
3. The agent will create a PR automatically
4. Review the PR, request changes if needed, or merge when satisfied

For manual contributions, follow standard Git workflow practices and ensure `npm run lint` passes before creating a PR.

## License

MIT
