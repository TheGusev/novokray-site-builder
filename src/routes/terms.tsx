import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Пользовательское соглашение — ${SITE.shortName}` },
      { name: "description", content: "Пользовательское соглашение сайта санитарной службы Дез-Федерация: предмет, условия использования, ответственность, изменения." },
      { property: "og:title", content: "Пользовательское соглашение" },
      { property: "og:description", content: "Условия использования сайта и сервиса оформления заявок." },
      { property: "og:url", content: `${SITE.domain}/terms` },
    ],
    links: [{ rel: "canonical", href: `${SITE.domain}/terms` }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Пользовательское соглашение" }]} />
      <article className="container-x mx-auto max-w-3xl py-10 md:py-16">
        <h1 className="font-display text-3xl font-extrabold text-balance md:text-4xl">
          Пользовательское соглашение
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Действует с 1&nbsp;января 2026&nbsp;года.
        </p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-foreground">
          <section>
            <h2 className="font-display text-xl font-bold">1. Предмет соглашения</h2>
            <p className="mt-2">
              Настоящее Соглашение регулирует отношения между {SITE.legal.fullName}
              (бренд «{SITE.shortName}», ИНН&nbsp;{SITE.legal.inn}, ОГРН&nbsp;{SITE.legal.ogrn},
              лицензия Роспотребнадзора №&nbsp;{SITE.legal.licenseNo} от&nbsp;{SITE.legal.licenseDate}; далее — «Исполнитель»)
              и&nbsp;пользователем сайта{" "}
              <a href={SITE.domain} className="text-primary underline-offset-2 hover:underline">{SITE.domain}</a>{" "}
              (далее — «Пользователь») при&nbsp;использовании Сайта и&nbsp;сервиса оформления заявок на&nbsp;услуги
              дезинфекции, дезинсекции, дератизации и&nbsp;смежных работ.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">2. Принятие условий</h2>
            <p className="mt-2">
              Используя Сайт и&nbsp;отправляя заявку, Пользователь подтверждает, что&nbsp;ознакомился с&nbsp;настоящим
              Соглашением и&nbsp;{" "}
              <Link to="/privacy" className="text-primary underline-offset-2 hover:underline">
                Политикой обработки персональных данных
              </Link>{" "}
              и&nbsp;согласен с&nbsp;их&nbsp;условиями.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">3. Заявка и&nbsp;стоимость работ</h2>
            <p className="mt-2">
              Отправка заявки не&nbsp;является заключением договора и&nbsp;не&nbsp;обязывает Пользователя к&nbsp;оплате.
              Предварительная цена, указанная на&nbsp;Сайте, является ориентировочной. Итоговая стоимость определяется
              по&nbsp;результатам бесплатного осмотра объекта и&nbsp;фиксируется в&nbsp;договоре до&nbsp;начала работ.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">4. Обязанности сторон</h2>
            <p className="mt-2">
              Исполнитель обязуется связаться с&nbsp;Пользователем по&nbsp;указанному телефону в&nbsp;разумный срок,
              согласовать время выезда и&nbsp;выполнить работы в&nbsp;соответствии с&nbsp;действующими санитарными нормами
              и&nbsp;договором.
            </p>
            <p className="mt-2">
              Пользователь обязуется указывать достоверные данные, обеспечить доступ специалиста к&nbsp;объекту и&nbsp;выполнить
              рекомендации по&nbsp;подготовке помещения, переданные Исполнителем.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">5. Гарантия</h2>
            <p className="mt-2">
              На&nbsp;выполненные работы предоставляется гарантия в&nbsp;объёме и&nbsp;сроке, указанных в&nbsp;договоре
              и&nbsp;на&nbsp;странице{" "}
              <Link to="/garantii" className="text-primary underline-offset-2 hover:underline">«Гарантии»</Link>.
              При&nbsp;возврате проблемы в&nbsp;гарантийный срок Исполнитель выполняет повторную обработку без&nbsp;доплаты.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">6. Ответственность</h2>
            <p className="mt-2">
              Исполнитель не&nbsp;несёт ответственности за&nbsp;последствия, возникшие в&nbsp;результате недостоверных сведений
              со&nbsp;стороны Пользователя, нарушения им&nbsp;инструкций по&nbsp;подготовке объекта или&nbsp;самостоятельной
              обработки помещения сторонними средствами.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">7. Интеллектуальная собственность</h2>
            <p className="mt-2">
              Все материалы Сайта — тексты, графика, фотографии, логотип и&nbsp;дизайн — принадлежат Исполнителю.
              Использование материалов без&nbsp;письменного согласия не&nbsp;допускается.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">8. Изменения и&nbsp;контакты</h2>
            <p className="mt-2">
              Исполнитель вправе изменять настоящее Соглашение. Актуальная редакция размещена по&nbsp;адресу{" "}
              <Link to="/terms" className="text-primary underline-offset-2 hover:underline">/terms</Link>.
              По&nbsp;вопросам, связанным с&nbsp;использованием Сайта, обращайтесь по&nbsp;телефону{" "}
              <a href={SITE.phoneHref} className="text-primary underline-offset-2 hover:underline">{SITE.phone}</a>{" "}
              или&nbsp;e-mail{" "}
              <a href={SITE.emailHref} className="text-primary underline-offset-2 hover:underline">{SITE.email}</a>.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}