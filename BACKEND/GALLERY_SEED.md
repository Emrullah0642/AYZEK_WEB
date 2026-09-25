# Etkinlik galerisi başlangıç verisi

`gallery_seed.json`, yereldeki `secilen-gorseller/upload_gallery.py` dosyasında
hazırlanan 31 etkinliğin başlık, açıklama, kategori, tarih ve konum bilgisini
içerir. Her etkinliğin `01.jpg` kapağı `public/gallery/seed-XX.jpg` yoluna
kopyalandı. Diğer fotoğraflar ve orijinal Google Drive manifestosu yerelde
saklanır; mevcut galeri şeması etkinlik başına bir görsel destekler.

`8b6e3f2c19a0` Alembic geçişi, başlığı veritabanında bulunmayan etkinlikleri
bir kez ekler. Mevcut kayıtları değiştirmez. Görseller backend'in `/public`
statik yolundan sunulur ve R2 anahtarı gerektirmez. `23 Ayzek Tanıtım` ve
`24 Ayzek Teknofest - Adana-Antalya` klasörleri, ayrı tarihli etkinlik olarak
tanımlanmadıkları için veri kümesine eklenmedi.
