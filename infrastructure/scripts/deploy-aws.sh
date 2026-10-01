#!/usr/bin/env bash
# ==============================================================================
# Namma Pavagada — Automated AWS CloudFormation Deployment Script
# ==============================================================================

set -e

ENV_NAME="${1:-production}"
REGION="${AWS_REGION:-ap-south-1}"

echo "=================================================="
echo " Deploying Namma Pavagada Infrastructure to AWS"
echo " Environment: ${ENV_NAME} | Region: ${REGION}"
echo "=================================================="

# 1. Deploy VPC Network
echo "==> Step 1: Deploying VPC Networking..."
aws cloudformation deploy \
  --template-file infrastructure/aws/cloudformation/01-vpc-network.yaml \
  --stack-name "${ENV_NAME}-np-vpc" \
  --parameter-overrides EnvironmentName="${ENV_NAME}" \
  --region "${REGION}"

# 2. Deploy Amazon S3 Media Bucket
echo "==> Step 2: Deploying Amazon S3 Media Bucket..."
aws cloudformation deploy \
  --template-file infrastructure/aws/cloudformation/03-s3-media.yaml \
  --stack-name "${ENV_NAME}-np-s3" \
  --parameter-overrides EnvironmentName="${ENV_NAME}" \
  --region "${REGION}"

# 3. Deploy Amazon RDS PostgreSQL
echo "==> Step 3: Deploying Amazon RDS PostgreSQL..."
read -s -p "Enter Database Master Password: " DB_PASS
echo ""

aws cloudformation deploy \
  --template-file infrastructure/aws/cloudformation/02-rds-postgres.yaml \
  --stack-name "${ENV_NAME}-np-rds" \
  --parameter-overrides EnvironmentName="${ENV_NAME}" DBMasterPassword="${DB_PASS}" \
  --region "${REGION}"

# 4. Deploy CloudFront & S3 Website Distributions
echo "==> Step 4: Deploying CloudFront Distributions..."
aws cloudformation deploy \
  --template-file infrastructure/aws/cloudformation/05-frontend-cloudfront.yaml \
  --stack-name "${ENV_NAME}-np-cdn" \
  --parameter-overrides EnvironmentName="${ENV_NAME}" \
  --region "${REGION}"

echo "=================================================="
echo " Infrastructure Deployment Complete!"
echo " Next: Build & push backend container to ECR,"
echo " sync public build to S3, and sync admin build to S3."
echo "=================================================="
