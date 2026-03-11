# react-automated

A React + TypeScript application with an automated Jira-to-GitHub development pipeline. This project demonstrates how to build a modern web app with fully automated ticket implementation using Claude Code and GitHub Actions.

## Project Overview

**react-automated** is a React + TypeScript application that showcases an end-to-end automation workflow:

- **React Frontend** (`src/`) — A modern React 19 application built with TypeScript and Vite
- **Automation Infrastructure** (`automation/`) — AWS Lambda functions and Terraform configuration for the Jira integration backend
- **CI/CD Agent Workflow** (`.github/workflows/agent-task.yml`) — GitHub Actions workflow that automatically implements Jira tickets using Claude Code

When a Jira ticket is moved to a specific status, the automation pipeline triggers a GitHub Actions workflow that reads the ticket, implements the requested changes, creates a pull request, transitions the Jira issue to CODE REVIEW, and posts notifications to Slack.

## Tech Stack

- **React 19** — Latest React with modern features
- **TypeScript 5.9** — Type-safe development
- **Vite 7** — Fast build tool and dev server
- **ESLint** — Code linting and quality checks
- **GitHub Actions** — CI/CD pipeline and automation
- **AWS Lambda** — Serverless functions for Jira webhook handling
- **AWS DynamoDB** — State management for automation workflow
- **Jira API** — Issue tracking integration
- **Slack API** — Notifications and status updates

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Available Scripts

- `npm run dev` — Start the development server with hot module replacement
- `npm run build` — Build the application for production (runs TypeScript compiler and Vite build)
- `npm run lint` — Run ESLint to check code quality
- `npm run preview` — Preview the production build locally

## Project Structure

```
react-automated/
├── src/                    # React application source code
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── assets/            # Static assets
├── automation/            # Infrastructure and Lambda functions
│   ├── infra/             # Terraform configuration for AWS resources
│   └── lambda/            # Lambda function for Jira webhook processing
└── .github/
    └── workflows/         # GitHub Actions workflows
        └── agent-task.yml # Claude Code automation workflow
```

## Jira Automation Workflow

The project implements an automated development workflow triggered by Jira issue transitions:

1. **Jira Webhook** — When a ticket is moved to a designated status (e.g., "Ready for Development"), Jira sends a webhook to the AWS Lambda function
2. **Lambda Processing** — The Lambda function validates the webhook, stores the event in DynamoDB, and triggers a GitHub Actions workflow via `repository_dispatch`
3. **Agent Execution** — GitHub Actions runs Claude Code, which:
   - Reads the Jira ticket details
   - Analyzes the requirements
   - Implements the requested code changes
   - Runs tests and validation
   - Creates a pull request with the changes
4. **Jira Update** — The workflow transitions the Jira issue to "Code Review" status
5. **Slack Notification** — A notification is posted to Slack with the PR link and status

This enables a fully automated development pipeline where tickets are automatically implemented, tested, and submitted for review.

## Environment Variables / Secrets

The automation pipeline requires the following secrets to be configured in GitHub Actions and AWS:

### GitHub Secrets

- `ANTHROPIC_API_KEY` — API key for Claude Code
- `AWS_ACCESS_KEY_ID` — AWS access key for Lambda deployment
- `AWS_SECRET_ACCESS_KEY` — AWS secret key for Lambda deployment
- `AWS_REGION` — AWS region (e.g., `us-east-1`)
- `JIRA_EMAIL` — Email for Jira API authentication
- `JIRA_API_TOKEN` — API token for Jira authentication
- `JIRA_BASE_URL` — Jira instance URL (e.g., `https://your-domain.atlassian.net`)
- `SLACK_WEBHOOK_URL` — Slack webhook URL for notifications
- `DYNAMODB_TABLE` — DynamoDB table name for workflow state

### Lambda Environment Variables

The Lambda function requires the same Jira, Slack, and DynamoDB configuration as environment variables. See `automation/lambda/.env.example` for the template.

## License

This project is private and not licensed for external use.
