# react-automated

## Project Overview

**react-automated** is a React + TypeScript application with an integrated Jira-to-GitHub automation pipeline. The project demonstrates an autonomous development workflow where Jira tickets automatically trigger GitHub Actions that use Claude Code to implement changes, create pull requests, and update Jira issues.

Key components:
- **React frontend** (`src/`) — The main application built with React 19 and TypeScript
- **Automation infrastructure** (`automation/`) — AWS Lambda functions and infrastructure code for the Jira integration backend
- **CI/CD agent workflow** (`.github/workflows/agent-task.yml`) — GitHub Actions workflow that orchestrates the automated development pipeline

## Tech Stack

- **React 19** — Modern React with latest features
- **TypeScript 5.9** — Type-safe JavaScript
- **Vite 7** — Fast build tool and dev server
- **ESLint** — Code linting and quality checks
- **GitHub Actions** — CI/CD automation
- **AWS Lambda** — Serverless functions for webhook handling
- **AWS DynamoDB** — State management for automation pipeline
- **Jira API** — Issue tracking integration
- **Slack Webhooks** — Team notifications

## Getting Started

### Prerequisites

- Node.js 20 or higher

### Installation

```bash
npm install
```

### Available Scripts

- `npm run dev` — Start the development server with hot reload
- `npm run build` — Build the production bundle
- `npm run lint` — Run ESLint to check code quality
- `npm run preview` — Preview the production build locally

## Project Structure

```
react-automated/
├── src/                  # React application source code
│   ├── components/       # React components
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── automation/          # Infrastructure and Lambda functions for Jira agent pipeline
│   ├── lambda/          # Lambda function handlers
│   └── infrastructure/  # AWS CDK or Terraform configuration
└── .github/
    └── workflows/       # GitHub Actions workflow definitions
        └── agent-task.yml  # Automated agent workflow
```

## Jira Automation Workflow

The project includes a fully automated development workflow:

1. **Jira Ticket Creation** — A developer creates or transitions a Jira ticket to a specific status
2. **Webhook Trigger** — Jira webhook fires and invokes the AWS Lambda function
3. **GitHub Dispatch** — Lambda sends a `repository_dispatch` event to trigger the GitHub Actions workflow
4. **Agent Execution** — The GitHub Actions workflow (`agent-task.yml`) runs Claude Code agent to:
   - Read and understand the Jira ticket requirements
   - Implement the necessary code changes
   - Run tests and quality checks
   - Create a pull request with the changes
5. **Jira Update** — The agent transitions the Jira issue to CODE REVIEW status
6. **Notifications** — Status updates and PR links are posted to Slack

This workflow enables autonomous ticket implementation with minimal human intervention.

## Environment Variables / Secrets

The following secrets must be configured in GitHub Actions and AWS Lambda:

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | API key for Claude Code agent |
| `AWS_ACCESS_KEY_ID` | AWS access key for Lambda and DynamoDB |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key |
| `AWS_REGION` | AWS region (e.g., `us-east-1`) |
| `JIRA_EMAIL` | Email address for Jira API authentication |
| `JIRA_API_TOKEN` | Jira API token for authentication |
| `JIRA_BASE_URL` | Base URL of your Jira instance |
| `SLACK_WEBHOOK_URL` | Slack webhook URL for notifications |
| `DYNAMODB_TABLE` | DynamoDB table name for state management |

**Security Note:** Never commit these secrets to version control. Configure them in GitHub repository settings and AWS Systems Manager Parameter Store or Secrets Manager.
