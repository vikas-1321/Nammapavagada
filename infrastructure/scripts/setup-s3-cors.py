#!/usr/bin/env python3
"""
Namma Pavagada - Amazon S3 Media Bucket Provisioner & CORS Setup
Initializes bucket directory structure and applies CORS policy for public/admin frontends.
"""

import os
import sys
import boto3
from botocore.exceptions import ClientError

BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "namma-pavagada-media")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://nammapavagada.com",
    "https://www.nammapavagada.com",
    "https://admin.nammapavagada.com",
]

SUBDIRECTORIES = [
    "locations/",
    "bus/",
    "hospitals/",
    "schools/",
    "colleges/",
    "theatres/",
    "history/",
    "government/",
]

def setup_s3():
    print(f"Connecting to Amazon S3 in region: {AWS_REGION}...")
    s3 = boto3.client("s3", region_name=AWS_REGION)

    # 1. Create Bucket if not present
    try:
        if AWS_REGION == "us-east-1":
            s3.create_bucket(Bucket=BUCKET_NAME)
        else:
            s3.create_bucket(
                Bucket=BUCKET_NAME,
                CreateBucketConfiguration={"LocationConstraint": AWS_REGION},
            )
        print(f"✓ S3 Bucket '{BUCKET_NAME}' created.")
    except ClientError as e:
        if e.response["Error"]["Code"] in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
            print(f"✓ S3 Bucket '{BUCKET_NAME}' already exists.")
        else:
            print(f"✗ Failed to create S3 bucket: {e}")
            sys.exit(1)

    # 2. Configure CORS
    cors_configuration = {
        "CORSRules": [
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
                "AllowedOrigins": ALLOWED_ORIGINS,
                "ExposeHeaders": ["ETag"],
                "MaxAgeSeconds": 3600,
            }
        ]
    }
    s3.put_bucket_cors(Bucket=BUCKET_NAME, CORSConfiguration=cors_configuration)
    print("✓ S3 CORS policy configured for public and admin web origins.")

    # 3. Create folder placeholders
    for folder in SUBDIRECTORIES:
        s3.put_object(Bucket=BUCKET_NAME, Key=folder)
        print(f"  - Initialized folder prefix: {folder}")

    print("\n✓ Amazon S3 storage initialization completed successfully!")

if __name__ == "__main__":
    setup_s3()
