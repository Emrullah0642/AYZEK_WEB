import Link from "next/link"
import { ArrowUpRight, Code2, GraduationCap, Users } from "lucide-react"

const paths = [
  { icon: GraduationCap, number: "01", title: "Merakını keşfet", description: "Yapay zekâdan yazılıma, atölye ve eğitimlerle yeni bir alana ilk adımını at.", href: "#etkinlikler", action: "Etkinlikleri keşfet" },
  { icon: Code2, number: "02", title: "Birlikte üret", description: "Fikirlerini paylaş, proje geliştiren ekiplerle tanış ve öğrendiklerini uygulamaya taşı.", href: "#ekibimiz", action: "Ekiple tanış" },
  { icon: Users, number: "03", title: "Kendine yer bul", description: "Seninle aynı heyecanı paylaşan insanlarla tanış. Topluluğun bir sonraki hikâyesinde sen de ol.", href: "/join", action: "Topluluğa katıl" },
]

export function CommunityStart() {
  return (
    <section aria-labelledby="start-title" className="community-start px-4 py-12 sm:py-16">
      <div className="container max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div><p className="section-eyebrow mb-3">SENİN YOLCULUĞUN</p><h2 id="start-title" className="text-3xl sm:text-4xl font-semibold tracking-tight">Burada sana da yer var.</h2></div>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">İster ilk satır kodunu yaz, ister yeni bir proje geliştir. Bir sonraki adımı birlikte atalım.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {paths.map(({ icon: Icon, ...path }) => (
            <Link key={path.number} href={path.href} className="start-card group">
              <div className="flex justify-between items-center"><Icon className="h-6 w-6 text-cyan-300" strokeWidth={1.5} /><span className="text-xs font-mono text-muted-foreground">/ {path.number}</span></div>
              <h3 className="mt-7 text-xl font-semibold">{path.title}</h3>
              <p className="mt-3 mb-7 text-sm text-muted-foreground leading-relaxed">{path.description}</p>
              <span className="mt-auto flex items-center justify-between text-sm font-medium">{path.action}<ArrowUpRight className="h-4 w-4 text-cyan-300 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
