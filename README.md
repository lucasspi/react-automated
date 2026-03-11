# react-automated

A React + TypeScript application with an automated Jira-to-GitHub CI/CD pipeline. This project demonstrates how to integrate Jira issue tracking with GitHub Actions and Claude Code to automatically implement ticket changes, create pull requests, and manage the development workflow.

The project consists of three main components:
- **React frontend** (`src/`) — A React 19 application built with TypeScript and Vite
- **Automation infrastructure** (`automation/`) — AWS Lambda functions and DynamoDB integration for the Jira agent pipeline
- **CI/CD agent workflow** (`.github/workflows/agent-task.yml`) — GitHub Actions workflow that executes Claude Code to implement Jira tickets automatically

## Tech Stack

- **Frontend**: React 19, TypeScript 5.9, Vite 7
- **Code Quality**: ESLint for linting
- **CI/CD**: GitHub Actions
- **Backend Infrastructure**: AWS Lambda, AWS DynamoDB
- **Integrations**: Jira API, Slack webhooks

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager

### Installation

```bash
npm install
```

### Available Scripts

- `npm run dev` — Start the development server with hot module replacement
- `npm run build` — Build the application for production
- `npm run lint` — Run ESLint to check code quality
- `npm run preview` — Preview the production build locally

## Project Structure

```
react-automated/
├── src/                    # React application source code
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── ...
├── automation/            # Infrastructure and Lambda functions for Jira agent pipeline
│   ├── lambda/            # AWS Lambda function handlers
│   └── infrastructure/    # Infrastructure as code (IaC) configuration
├── .github/
│   └── workflows/
│       └── agent-task.yml # GitHub Actions workflow for automated ticket implementation
├── public/                # Static assets
├── package.json           # Project dependencies and scripts
└── vite.config.ts         # Vite configuration
```

## Jira Automation Workflow

The project includes an automated workflow that bridges Jira issue tracking with GitHub development:

1. **Trigger**: When a Jira ticket is transitioned to a specific status, a webhook triggers an AWS Lambda function
2. **Dispatch**: The Lambda function sends a `repository_dispatch` event to GitHub Actions with the ticket details
3. **Agent Execution**: The GitHub Actions workflow (`.github/workflows/agent-task.yml`) starts and uses Claude Code to:
   - Read and analyze the Jira ticket requirements
   - Implement the requested code changes
   - Create a new branch and commit the changes
   - Open a pull request with the implementation
4. **Status Update**: The workflow automatically transitions the Jira issue to "CODE REVIEW" status
5. **Notifications**: A notification is posted to Slack with links to the PR and updated Jira ticket

This automation enables a seamless flow from ticket creation to code implementation without manual intervention.

## Environment Variables / Secrets

The following secrets must be configured in GitHub repository settings for the automation workflow to function:

- `ANTHROPIC_API_KEY` — API key for Claude Code agent
- `AWS_ACCESS_KEY_ID` — AWS credentials for Lambda and DynamoDB access
- `AWS_SECRET_ACCESS_KEY` — AWS secret access key
- `AWS_REGION` — AWS region where resources are deployed
- `JIRA_EMAIL` — Email address for Jira API authentication
- `JIRA_API_TOKEN` — API token for Jira authentication
- `JIRA_BASE_URL` — Base URL of your Jira instance (e.g., `https://yourcompany.atlassian.net`)
- `SLACK_WEBHOOK_URL` — Webhook URL for Slack notifications
- `DYNAMODB_TABLE` — Name of the DynamoDB table used for state management
