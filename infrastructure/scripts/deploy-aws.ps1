# ==============================================================================
# Namma Pavagada — Automated AWS CloudFormation Deployment Script (PowerShell)
# ==============================================================================

param (
    [string]$EnvironmentName = "production",
    [string]$Region = "ap-south-1"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Namma Pavagada AWS Production Deployment" -ForegroundColor Cyan
Write-Host "  Environment: $EnvironmentName | Region: $Region" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check AWS CLI
try {
    $callerIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "Authenticated as AWS Account: $($callerIdentity.Account)" -ForegroundColor Green
} catch {
    Write-Error "AWS CLI is not configured or authenticated. Run 'aws configure' first."
    exit 1
}

# --- 1. Deploy VPC Network ---
Write-Host "`n==> Step 1: Deploying VPC Networking (01-vpc-network.yaml)..." -ForegroundColor Yellow
aws cloudformation deploy `
  --template-file infrastructure/aws/cloudformation/01-vpc-network.yaml `
  --stack-name "$EnvironmentName-np-vpc" `
  --parameter-overrides EnvironmentName="$EnvironmentName" `
  --region "$Region"

# --- 2. Deploy Amazon S3 Media Bucket ---
Write-Host "`n==> Step 2: Deploying Amazon S3 Media Bucket (03-s3-media.yaml)..." -ForegroundColor Yellow
aws cloudformation deploy `
  --template-file infrastructure/aws/cloudformation/03-s3-media.yaml `
  --stack-name "$EnvironmentName-np-s3" `
  --parameter-overrides EnvironmentName="$EnvironmentName" `
  --region "$Region"

# --- 3. Deploy Amazon RDS PostgreSQL ---
Write-Host "`n==> Step 3: Deploying Amazon RDS PostgreSQL (02-rds-postgres.yaml)..." -ForegroundColor Yellow
$SecurePass = Read-Host -Prompt "Enter Database Master Password (at least 8 chars)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePass)
$PlainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

if ([string]::IsNullOrWhiteSpace($PlainPass) -or $PlainPass.Length -lt 8) {
    Write-Error "Database password must be at least 8 characters long."
    exit 1
}

aws cloudformation deploy `
  --template-file infrastructure/aws/cloudformation/02-rds-postgres.yaml `
  --stack-name "$EnvironmentName-np-rds" `
  --parameter-overrides EnvironmentName="$EnvironmentName" DBMasterPassword="$PlainPass" `
  --region "$Region"

# --- 4. Deploy CloudFront & S3 Website Hosting ---
Write-Host "`n==> Step 4: Deploying CloudFront & S3 Website Hosting (05-frontend-cloudfront.yaml)..." -ForegroundColor Yellow
aws cloudformation deploy `
  --template-file infrastructure/aws/cloudformation/05-frontend-cloudfront.yaml `
  --stack-name "$EnvironmentName-np-cdn" `
  --parameter-overrides EnvironmentName="$EnvironmentName" `
  --region "$Region"

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "  Foundation Infrastructure Deployed Successfully!" -ForegroundColor Green
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Build and push backend Docker image to Amazon ECR." -ForegroundColor White
Write-Host "  2. Deploy App Runner stack (04-backend-apprunner.yaml)." -ForegroundColor White
Write-Host "  3. Build & sync Public and Admin frontends to S3." -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Green
