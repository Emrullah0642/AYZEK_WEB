FROM python:3.10-slim

# Gerekli sistem kütüphanelerini kuralım
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Bağımlılıkları kuralım
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Proje dosyalarını kopyalayalım
COPY . .

# Fotoğrafların yükleneceği klasörün varlığından emin olalım
RUN mkdir -p public/uploads

RUN chmod +x entrypoint.sh

EXPOSE 8000

# Container başlarken migration'ları uygula, sonra sunucuyu başlat
ENTRYPOINT ["./entrypoint.sh"]