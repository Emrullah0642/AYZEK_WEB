import boto3
import os
import logging
from PIL import Image, ImageOps
import io

logger = logging.getLogger("uvicorn.error")

ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
SECRET_KEY = os.getenv("R2_SECRET_KEY")
ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL")
BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
PUBLIC_DOMAIN = os.getenv("R2_PUBLIC_DOMAIN")

def upload_file_to_r2(file_obj, filename, content_type):
    try:
        if content_type and content_type.startswith("image/"):
            image_data = file_obj.read()
            img = Image.open(io.BytesIO(image_data))
            # Telefon kameralarının EXIF döndürme bilgisini piksellere işle
            # (yoksa örn. dikey çekilen fotoğraf yatık/yanlamasına görünür)
            img = ImageOps.exif_transpose(img)
            max_size = (1920, 1920)
            img.thumbnail(max_size, Image.LANCZOS)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            output = io.BytesIO()
            img.save(output, format="JPEG", quality=85, optimize=True)
            output.seek(0)
            filename = filename.rsplit(".", 1)[0] + ".jpg"
            content_type = "image/jpeg"
            file_obj = output

        s3_client = boto3.client(
            service_name='s3',
            endpoint_url=ENDPOINT_URL,
            aws_access_key_id=ACCESS_KEY,
            aws_secret_access_key=SECRET_KEY,
            region_name='auto'
        )

        s3_client.upload_fileobj(
            file_obj,
            BUCKET_NAME,
            filename,
            ExtraArgs={'ContentType': content_type}
        )

        final_url = f"{PUBLIC_DOMAIN}/{filename}"
        return final_url

    except Exception:
        logger.exception("R2 yükleme hatası")
        return None
