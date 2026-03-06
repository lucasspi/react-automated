# ──────────────────────────────────────────────────
# Jira Automation — Terraform Infrastructure
# Single Lambda with Function URL + DynamoDB table
# ──────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure for remote state:
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "jira-automation/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
}

# ── Variables ─────────────────────────────────────

variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "prod"
}

variable "jira_base_url" {
  type = string
}

variable "jira_email" {
  type = string
}

variable "jira_api_token" {
  type      = string
  sensitive = true
}

variable "jira_project_key" {
  type    = string
  default = "ST"
}

variable "jira_webhook_secret" {
  type      = string
  sensitive = true
}

variable "github_token" {
  type      = string
  sensitive = true
}

variable "github_owner" {
  type    = string
  default = "lucasspi"
}

variable "github_repo" {
  type    = string
  default = "react-automated"
}

variable "slack_webhook_url" {
  type      = string
  sensitive = true
}

# ── DynamoDB Table ────────────────────────────────

resource "aws_dynamodb_table" "agent_tasks" {
  name         = "jira-agent-tasks-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "taskFingerprint"
  range_key    = "taskId"

  attribute {
    name = "taskFingerprint"
    type = "S"
  }

  attribute {
    name = "taskId"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Service     = "jira-automation"
    Environment = var.environment
  }
}

# ── IAM Role ──────────────────────────────────────

resource "aws_iam_role" "lambda_role" {
  name = "jira-automation-lambda-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "jira-automation-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:UpdateItem",
        ]
        Resource = aws_dynamodb_table.agent_tasks.arn
      },
    ]
  })
}

# ── Lambda Function ───────────────────────────────

resource "aws_lambda_function" "jira_automation" {
  function_name = "jira-automation-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  filename         = "${path.module}/../lambda/deploy.zip"
  source_code_hash = filebase64sha256("${path.module}/../lambda/deploy.zip")

  environment {
    variables = {
      JIRA_BASE_URL       = var.jira_base_url
      JIRA_EMAIL          = var.jira_email
      JIRA_API_TOKEN      = var.jira_api_token
      JIRA_PROJECT_KEY    = var.jira_project_key
      JIRA_WEBHOOK_SECRET = var.jira_webhook_secret
      GITHUB_TOKEN        = var.github_token
      GITHUB_OWNER        = var.github_owner
      GITHUB_REPO         = var.github_repo
      SLACK_WEBHOOK_URL   = var.slack_webhook_url
      DYNAMODB_TABLE      = aws_dynamodb_table.agent_tasks.name
      TRIGGER_STATUS      = "TRIGGER AGENT"
      IN_PROGRESS_STATUS  = "IN PROGRESS"
      CODE_REVIEW_STATUS  = "CODE REVIEW"
    }
  }

  tags = {
    Service     = "jira-automation"
    Environment = var.environment
  }
}

# ── Function URL (public, webhook-secret-verified) ─

resource "aws_lambda_function_url" "webhook" {
  function_name      = aws_lambda_function.jira_automation.function_name
  authorization_type = "NONE"
}

# Allow public access to the Function URL (required even with auth_type NONE)
resource "aws_lambda_permission" "function_url_public" {
  statement_id           = "AllowPublicFunctionURL"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.jira_automation.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

# ── CloudWatch Log Group ──────────────────────────

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.jira_automation.function_name}"
  retention_in_days = 14
}

# ── Outputs ───────────────────────────────────────

output "lambda_function_url" {
  value       = aws_lambda_function_url.webhook.function_url
  description = "URL to configure as the Jira webhook endpoint"
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.agent_tasks.name
}

output "lambda_function_name" {
  value = aws_lambda_function.jira_automation.function_name
}
