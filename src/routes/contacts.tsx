import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { SITE } from "@/data/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LeadForm } from "@/components/site/LeadForm";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: `Контакты Дез-Федерация — телефон, адрес, реквизиты в Новосибирске` },
      { name: "description", content: `Телефон ${SITE.phone}, email ${SITE.email}, адрес: ${SITE.address}. Санитарная служба Дез-Федерация в Новосибирске — ежедневно 07:00–23:00.` },
      { property: "og:title", content: "Контакты Дез-Федерация" },
      { property: "og:description", content: `Связаться с санитарной службой в Новосибирске: ${SITE.phone}` },
      { property: "og:url", content: "/contacts" },
    ],
    links: [{ rel: "canonical", href: "/contacts" }],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Контакты" }]} />
      <section className="container-x pb-6">
        <h1 className="font-display text-3xl font-extrabold md:text-5xl">Контакты</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Связаться с санитарной службой Дез-Федерация в Новосибирске можно по телефону, через мессенджеры или по форме обратной связи. Работаем ежедневно с 07:00 до 23:00, аварийные службы (сушка после потопа) — круглосуточно.
        </p>
      </section>

      <section className="container-x py-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <a href={SITE.phoneHref} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-card hover:border-primary/40">
              <Phone className="mt-1 h-6 w-6 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Телефон</div>
                <div className="font-display text-lg font-bold">{SITE.phone}</div>
                <div className="text-xs text-muted-foreground">{SITE.hours}</div>
              </div>
            </a>
            <a href={SITE.whatsappHref} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-card hover:border-primary/40">
              <MessageCircle className="mt-1 h-6 w-6 text-success" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp / Telegram</div>
                <div className="font-display text-lg font-bold">{SITE.whatsapp}</div>
                <div className="text-xs text-muted-foreground">Отвечаем в течение 15 минут</div>
              </div>
            </a>
            <a href={SITE.emailHref} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-card hover:border-primary/40">
              <Mail className="mt-1 h-6 w-6 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="font-display text-lg font-bold">{SITE.email}</div>
                <div className="text-xs text-muted-foreground">Договоры, счета, документы</div>
              </div>
            </a>
            <div className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
              <MapPin className="mt-1 h-6 w-6 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Офис</div>
                <div className="font-display text-base font-bold">{SITE.address}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" />{SITE.hours}</div>
              </div>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="font-display text-lg font-bold">Реквизиты</div>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">ИНН</dt><dd className="font-medium">5406789012</dd></div>
                <div><dt className="text-muted-foreground">ОГРН</dt><dd className="font-medium">1145476123456</dd></div>
                <div><dt className="text-muted-foreground">Лицензия Роспотребнадзора</dt><dd className="font-medium">№ 54.НС.04.001.Л.000123.04.14</dd></div>
                <div><dt className="text-muted-foreground">Юр. адрес</dt><dd className="font-medium">630099, г. Новосибирск, Красный проспект, 28</dd></div>
              </dl>
            </div>
          </div>
          <div>
            <LeadForm title="Написать в офис" subtitle="Опишите задачу — ответим с расчётом и сроками." />
          </div>
        </div>
      </section>
    </>
  );
}
