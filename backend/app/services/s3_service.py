import os
import uuid
import mimetypes
from werkzeug.utils import secure_filename
import boto3
from botocore.exceptions import ClientError
from app.config.config import get_config

config = get_config()

class S3Service:
    """
    Handles file upload, deletion, and URL generation for Amazon S3,
    with an automatic local file storage fallback for zero-friction local development.
    """

    def __init__(self):
        self.bucket_name = config.S3_BUCKET_NAME
        self.region = config.AWS_REGION
        self.use_fallback = config.S3_USE_LOCAL_FALLBACK
        self.local_upload_dir = config.LOCAL_UPLOAD_FOLDER

        if not os.path.exists(self.local_upload_dir):
            os.makedirs(self.local_upload_dir, exist_ok=True)

        self._s3_client = None
        if config.AWS_ACCESS_KEY_ID and config.AWS_SECRET_ACCESS_KEY:
            try:
                self._s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=config.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
                    region_name=self.region,
                )
            except Exception as e:
                print(f"[S3Service] Warning: Failed to initialize AWS S3 client: {e}")
                self._s3_client = None

    def is_s3_enabled(self) -> bool:
        return self._s3_client is not None

    def upload_file(self, file_storage, folder: str = "locations") -> dict:
        """
        Uploads a file to S3 (or local uploads directory if S3 is unconfigured).
        Returns a dict: { s3_key, url, filename, file_size, mime_type }
        """
        raw_filename = secure_filename(file_storage.filename or "upload.jpg")
        ext = raw_filename.rsplit(".", 1)[-1].lower() if "." in raw_filename else "jpg"

        if ext not in config.ALLOWED_IMAGE_EXTENSIONS:
            raise ValueError(f"Unsupported file type .{ext}. Allowed: {', '.join(config.ALLOWED_IMAGE_EXTENSIONS)}")

        unique_id = uuid.uuid4().hex[:12]
        s3_key = f"{folder}/{unique_id}_{raw_filename}"
        mime_type = mimetypes.guess_type(raw_filename)[0] or "image/jpeg"

        # Read file bytes to determine size
        file_bytes = file_storage.read()
        file_size = len(file_bytes)
        file_storage.seek(0)

        if self.is_s3_enabled():
            try:
                self._s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=s3_key,
                    Body=file_bytes,
                    ContentType=mime_type,
                    ACL="public-read", # or presigned URLs depending on policy
                )
                url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_key}"
                return {
                    "s3_key": s3_key,
                    "url": url,
                    "filename": raw_filename,
                    "file_size": file_size,
                    "mime_type": mime_type,
                    "storage": "S3",
                }
            except ClientError as e:
                print(f"[S3Service] S3 put_object failed ({e}), falling back to local storage.")

        # Fallback: Save to local uploads folder
        local_path = os.path.join(self.local_upload_dir, s3_key.replace("/", "_"))
        with open(local_path, "wb") as f:
            f.write(file_bytes)

        # Public access URL via backend media endpoint
        url = f"/api/media/{s3_key.replace('/', '_')}"
        return {
            "s3_key": s3_key,
            "url": url,
            "filename": raw_filename,
            "file_size": file_size,
            "mime_type": mime_type,
            "storage": "LOCAL_FALLBACK",
        }

    def delete_file(self, s3_key: str) -> bool:
        """Deletes file from S3 or local directory."""
        if self.is_s3_enabled():
            try:
                self._s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
                return True
            except ClientError as e:
                print(f"[S3Service] S3 delete error: {e}")

        # Local cleanup
        local_path = os.path.join(self.local_upload_dir, s3_key.replace("/", "_"))
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
                return True
            except Exception:
                pass
        return False

s3_service = S3Service()
