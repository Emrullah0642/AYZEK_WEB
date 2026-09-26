import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const values = [
  { title: "Kapsayıcılık", lead: "Herkese bir yer.", description: "Bölümün ya da deneyimin ne olursa olsun, merakını paylaşabileceğin bir alan açıyoruz." },
  { title: "İş birliği", lead: "Birlikte daha ileri.", description: "Birbirimizden öğreniyor, teknoloji dünyasıyla kurduğumuz bağlantıları topluluğumuzla paylaşıyoruz." },
  { title: "Yenilikçilik", lead: "Fikirler denemeye değer.", description: "Yeni sorular soruyor, farklı yollar deniyor ve fikirlerimizi çalışan projelere dönüştürüyoruz." },
  { title: "Profesyonellik", lead: "Emeğimize sahip çıkarız.", description: "Sorumluluk alıyor, verdiğimiz sözleri önemsiyor ve birlikte ürettiğimiz işin arkasında duruyoruz." },
  { title: "Etkileşim", lead: "Bir tanışmayla başlar.", description: "Atölyeler, buluşmalar ve etkinliklerle yeni insanları aynı masada bir araya getiriyoruz." },
  { title: "Gelişim", lead: "Öğrenmenin sonu yok.", description: "Yapay zekâ ve yazılımda öğrendiklerimizi uyguluyor, deneyimlerimizi birbirimize aktarıyoruz." },
]

export function MissionValues() {
  return (
    <>
      <div className="mission-story">
        <div className="mission-story-copy">
          <p className="story-kicker">01 / MİSYONUMUZ</p>
          <h3>Merakı paylaş.<br />Birlikte <em>ilerle.</em></h3>
          <p className="mission-story-description">Teknolojiye duyduğumuz merakı, birlikte öğrenebildiğimiz ve üretebildiğimiz bir ortama dönüştürmek için buradayız. Kampüste başlayan bir tanışmanın, hayat boyu sürecek bir iş birliğine dönüşebileceğine inanıyoruz.</p>
          <Link href="/join" className="mission-story-link">Bu hikâyeye sen de katıl <ArrowUpRight size={19} /></Link>
        </div>
        <figure className="mission-story-photo">
          <Image src="/yeniekip1.JPG" alt="AYZEK üyeleri bir etkinliğin ardından sahnede birlikte" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" />
          <figcaption>AYZEK’TEN BİR KARE <span>Birlikte öğrenen, birlikte büyüyen insanlar.</span></figcaption>
        </figure>
      </div>
      <div className="values-story">
        <div className="values-story-heading">
          <p className="story-kicker">02 / DEĞERLERİMİZ</p>
          <h3>Bizi bir arada<br />tutan şeyler.</h3>
          <p>Yaptığımız her işte, kurduğumuz her ekipte aynı anlayışı paylaşıyoruz.</p>
          <span className="values-star" aria-hidden="true">✳</span>
        </div>
        <div className="values-story-list">
          {values.map((value, index) => (
            <article key={value.title} className="value-story-row">
              <span className="value-story-number">0{index + 1}</span>
              <div><p className="value-story-label">{value.title}</p><h4>{value.lead}</h4><p className="value-story-description">{value.description}</p></div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}
