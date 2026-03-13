# react-automated

A React + TypeScript application with an automated Jira-to-GitHub development pipeline powered by Claude Code.

## Project Overview

**react-automated** is a React 19 + TypeScript project that demonstrates an end-to-end automation workflow for software development. When a Jira ticket is moved to the "TRIGGER AGENT" status, an AWS Lambda function validates the request and triggers a GitHub Actions workflow that uses Claude Code to implement the changes, create a pull request, and transition the ticket to code review—all automatically.

### Key Components

- **`src/`** — React frontend application source code
- **`automation/`** — Infrastructure and Lambda functions for the Jira automation backend
- **`.github/workflows/agent-task.yml`** — GitHub Actions workflow that runs Claude Code to implement Jira tickets automatically

## Tech Stack

- **React 19** — Modern React with latest features
- **TypeScript 5.9** — Type-safe JavaScript
- **Vite 7** — Fast build tool and dev server
- **ESLint** — Code linting and quality checks
- **GitHub Actions** — CI/CD automation
- **AWS Lambda** — Serverless webhook handler (Node.js 20)
- **AWS DynamoDB** — Task deduplication and state tracking
- **Jira Integration** — Webhook-based ticket automation
- **Slack Integration** — Real-time notifications

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager

### Installation

```bash
npm install
```

### Available Scripts

- **`npm run dev`** — Start the Vite development server with hot module replacement
- **`npm run build`** — Build the production application (runs TypeScript compiler + Vite build)
- **`npm run lint`** — Run ESLint to check code quality
- **`npm run preview`** — Preview the production build locally

## Project Structure

```
react-automated/
├── src/                          # React application source code
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Application entry point
│   ├── layouts/                  # Layout components
│   ├── pages/                    # Page components
│   └── assets/                   # Static assets (images, styles)
├── automation/                   # Jira automation infrastructure
│   ├── lambda/                   # Lambda function code
│   │   └── src/handler.ts        # Webhook handler logic
│   └── infra/                    # Terraform infrastructure definitions
│       └── main.tf               # Lambda, DynamoDB, IAM, Function URL
└── .github/
    └── workflows/
        └── agent-task.yml        # GitHub Actions workflow for automated implementation
```

## Jira Automation Workflow

The automation pipeline connects Jira tickets directly to code implementation:

### High-Level Flow

1. **Trigger**: Move a Jira ticket from `TODO` to `TRIGGER AGENT`
2. **Webhook**: Jira sends a webhook POST to the AWS Lambda Function URL
3. **Lambda Processing**:
   - Validates webhook secret
   - Parses issue details (key, summary, description)
   - Checks DynamoDB for duplicate/in-progress tasks
   - Checks GitHub for existing open PRs
   - Transitions Jira ticket to `IN PROGRESS`
   - Triggers GitHub `repository_dispatch` event
   - Posts Slack notification
4. **GitHub Actions**:
   - Checks out repository and creates feature branch
   - Runs Claude Code with the ticket details
   - Commits and pushes changes
   - Creates pull request with ticket context
   - Transitions Jira ticket to `CODE REVIEW`
   - Posts PR link as Jira comment
   - Sends Slack notification with PR details
5. **Human Review**: Developer reviews and merges the PR

### Deduplication Strategy

Three layers prevent duplicate work:

- **Active task check** — DynamoDB query for tasks with `dispatched`/`in_progress`/`fixing` status
- **Open PR check** — GitHub API check for existing agent PRs for this issue
- **Atomic claim** — DynamoDB conditional write prevents concurrent Lambda executions

Claims auto-expire after 8 hours (TTL). Task records auto-expire after 7 days.

### Branch Naming Convention

Format: `agent/{issue-key}-{slugified-summary}`

Example: `agent/st-134-improve-readme-with-project-specific-doc`

## Environment Variables / Secrets

The following secrets must be configured in GitHub repository settings (Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key for running Claude Code in GitHub Actions |
| `AWS_ACCESS_KEY_ID` | AWS access key for DynamoDB updates (optional) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for DynamoDB updates (optional) |
| `AWS_REGION` | AWS region where resources are deployed (e.g., `us-east-1`) |
| `JIRA_EMAIL` | Email address for Jira API authentication |
| `JIRA_API_TOKEN` | Jira API token for authentication |
| `JIRA_BASE_URL` | Jira instance base URL (e.g., `yourcompany.atlassian.net`) |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL for notifications |
| `DYNAMODB_TABLE` | DynamoDB table name for task tracking (e.g., `jira-agent-tasks-prod`) |

**Note**: AWS credentials are optional for GitHub Actions. If not configured, DynamoDB updates are skipped but the core workflow (Claude Code + PR creation) still functions.

### Additional Configuration Required

- **Lambda Environment Variables**: Configured via Terraform in `automation/infra/main.tf`
- **Jira Webhook**: Must be configured to POST to the Lambda Function URL with `x-webhook-secret` header
- **Slack App**: Incoming webhook must be created and added to your workspace channel

For detailed setup instructions, see [`automation/README.md`](automation/README.md).

## Development

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

### Building for Production

```bash
npm run build
```

The optimized production bundle will be output to the `dist/` directory.

### Code Quality

```bash
npm run lint
```

ESLint is configured with React-specific rules and TypeScript support.

## Contributing

This project uses an automated agent for Jira ticket implementation. To request changes:

1. Create a Jira ticket with a clear description
2. Move it to `TRIGGER AGENT` status
3. The automation pipeline will implement changes and create a PR
4. Review and merge the PR

---

🤖 **Powered by [Claude Code](https://claude.com/claude-code)**
