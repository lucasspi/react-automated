# react-automated

A React + TypeScript application with an automated Jira-to-GitHub development pipeline powered by Claude Code.

## Project Overview

**react-automated** is a demonstration project that showcases an AI-powered development workflow. Jira tickets automatically trigger GitHub Actions, which use Claude Code to implement the requested changes, create pull requests, and update the ticket status—all without manual developer intervention.

The project consists of three main components:
- **React frontend** (`src/`) — A React 19 + TypeScript application built with Vite
- **Automation infrastructure** (`automation/`) — AWS Lambda functions and DynamoDB backend for Jira webhook processing
- **CI/CD agent workflow** (`.github/workflows/agent-task.yml`) — GitHub Actions workflow that orchestrates the automated development process

## Tech Stack

- **React** 19.2.0
- **TypeScript** 5.9.3
- **Vite** 7.3.1
- **ESLint** 9.39.1 for linting
- **GitHub Actions** for CI/CD
- **AWS Lambda** and **DynamoDB** for the Jira automation backend
- **Jira** and **Slack** integrations for workflow notifications

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react-automated
```

2. Install dependencies:
```bash
npm install
```

### Available Scripts

- `npm run dev` — Start the development server with hot module replacement
- `npm run build` — Build the application for production (includes TypeScript compilation)
- `npm run lint` — Run ESLint to check for code quality issues
- `npm run preview` — Preview the production build locally

## Project Structure

```
react-automated/
├── src/                  # React application source code
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── ...
├── automation/          # Infrastructure and Lambda functions for Jira agent pipeline
│   ├── lambda/          # AWS Lambda function handlers
│   └── ...
├── .github/workflows/   # GitHub Actions workflow definitions
│   └── agent-task.yml   # Claude Code automation workflow
├── public/              # Static assets
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── eslint.config.js     # ESLint configuration
```

## Jira Automation Workflow

The project implements a fully automated development workflow:

1. **Jira Ticket Creation** — When a Jira issue is created or transitions to a specific status, a webhook is triggered
2. **Repository Dispatch** — The Jira webhook handler sends a `repository_dispatch` event to GitHub
3. **Agent Activation** — GitHub Actions triggers the `agent-task.yml` workflow with the ticket details
4. **Code Implementation** — Claude Code reads the Jira ticket, analyzes the codebase, and implements the requested changes
5. **Pull Request Creation** — The agent creates a branch, commits the changes, and opens a pull request
6. **Status Update** — The Jira issue is automatically transitioned to "CODE REVIEW" status
7. **Notifications** — Slack notifications are sent at key stages of the workflow

This enables a hands-free development process where tickets are automatically implemented and ready for human review.

## Environment Variables / Secrets

The following secrets must be configured in GitHub Actions for the automation to function:

- `ANTHROPIC_API_KEY` — API key for Claude Code (Anthropic API)
- `AWS_ACCESS_KEY_ID` — AWS access key for Lambda and DynamoDB access
- `AWS_SECRET_ACCESS_KEY` — AWS secret access key
- `AWS_REGION` — AWS region where resources are deployed
- `JIRA_EMAIL` — Email address for Jira API authentication
- `JIRA_API_TOKEN` — Jira API token for authentication
- `JIRA_BASE_URL` — Base URL for your Jira instance (e.g., `https://your-domain.atlassian.net`)
- `SLACK_WEBHOOK_URL` — Slack webhook URL for sending notifications
- `DYNAMODB_TABLE` — Name of the DynamoDB table for tracking automation state

**Note:** Never commit secrets or sensitive values to the repository. All secrets should be configured in GitHub repository settings under "Secrets and variables" → "Actions".
