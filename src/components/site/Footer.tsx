import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { SITE } from "@/data/site";
import { SERVICES } from "@/data/services";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-hero text-primary-foreground">ДФ</span>
            Дез-Федерация
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Санитарная служба №1 в Новосибирске. Работаем с {SITE.founded} года, лицензия Роспотребнадзора, гарантия по договору.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-display text-2xl font-extrabold text-foreground">{SITE.rating.value}</span>
            <span>★★★★★<br />
              <span className="text-xs">{SITE.rating.count} отзывов</span>
            </span>
          </div>
        </div>

        <div>
          <div className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Услуги</div>
          <ul className="space-y-2 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link to="/services/$slug" params={{ slug: s.slug }} className="text-muted-foreground hover:text-primary">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Компания</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/o-kompanii" className="text-muted-foreground hover:text-primary">О нас</Link></li>
            <li><Link to="/price" className="text-muted-foreground hover:text-primary">Цены</Link></li>
            <li><Link to="/garantii" className="text-muted-foreground hover:text-primary">Гарантии и сертификаты</Link></li>
            <li><Link to="/blog" className="text-muted-foreground hover:text-primary">Блог и полезные статьи</Link></li>
            <li><Link to="/faq" className="text-muted-foreground hover:text-primary">Вопросы и ответы</Link></li>
            <li><Link to="/category/dezinfekciya-novosibirsk" className="text-muted-foreground hover:text-primary">Дезинфекция в Новосибирске</Link></li>
            <li><Link to="/contacts" className="text-muted-foreground hover:text-primary">Контакты</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Контакты</div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><a href={SITE.phoneHref} className="hover:text-primary">{SITE.phone}</a></li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><a href={SITE.emailHref} className="hover:text-primary">{SITE.email}</a></li>
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{SITE.address}</li>
            <li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{SITE.hours}</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <a href={SITE.social.vk} className="rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary">VK</a>
            <a href={SITE.social.telegram} className="rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary">Telegram</a>
            <a href={SITE.whatsappHref} className="rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary">WhatsApp</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Дез-Федерация.ру — Санитарная служба Новосибирска. Все права защищены.</div>
          <div className="flex gap-4">
            <Link to="/contacts" className="hover:text-primary">Реквизиты</Link>
            <a href="/sitemap.xml" className="hover:text-primary">Карта сайта</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
