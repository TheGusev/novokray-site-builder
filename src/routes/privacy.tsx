import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Политика обработки персональных данных — ${SITE.shortName}` },
      { name: "description", content: "Политика обработки персональных данных санитарной службы Дез-Федерация. Цели обработки, состав данных, сроки хранения, права субъекта по 152-ФЗ." },
      { property: "og:title", content: "Политика обработки персональных данных" },
      { property: "og:description", content: "Как мы собираем, храним и используем персональные данные пользователей сайта." },
      { property: "og:url", content: `${SITE.domain}/privacy` },
    ],
    links: [{ rel: "canonical", href: `${SITE.domain}/privacy` }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE.domain}/` },
          { "@type": "ListItem", position: 2, name: "Политика конфиденциальности", item: `${SITE.domain}/privacy` },
        ],
      }),
    }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Главная", to: "/" }, { label: "Политика конфиденциальности" }]} />
      <article className="container-x mx-auto max-w-3xl py-10 md:py-16">
        <h1 className="font-display text-3xl font-extrabold text-balance md:text-4xl">
          Политика обработки персональных данных
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Действует с 1&nbsp;января 2026&nbsp;года. Редакция от 1&nbsp;января 2026&nbsp;года.
        </p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-foreground">
          <section>
            <h2 className="font-display text-xl font-bold">1. Общие положения</h2>
            <p className="mt-2">
              Настоящая Политика разработана в&nbsp;соответствии с&nbsp;Федеральным законом от&nbsp;27.07.2006 №&nbsp;152-ФЗ
              «О персональных данных» и&nbsp;определяет порядок обработки персональных данных пользователей сайта{" "}
              <a href={SITE.domain} className="text-primary underline-offset-2 hover:underline">{SITE.domain}</a>{" "}
              (далее — Сайт), а&nbsp;также меры по&nbsp;обеспечению их&nbsp;безопасности.
            </p>
            <p className="mt-2">
              Оператор: {SITE.legal.fullName} (бренд «{SITE.shortName}»), ИНН&nbsp;{SITE.legal.inn},
              ОГРН&nbsp;{SITE.legal.ogrn}, юридический адрес:&nbsp;{SITE.legal.legalAddress}.
              Лицензия Роспотребнадзора №&nbsp;{SITE.legal.licenseNo} от&nbsp;{SITE.legal.licenseDate}.
              Контактный e-mail:{" "}
              <a href={SITE.emailHref} className="text-primary underline-offset-2 hover:underline">{SITE.email}</a>,
              телефон:{" "}
              <a href={SITE.phoneHref} className="text-primary underline-offset-2 hover:underline">{SITE.phone}</a>,
              Telegram:{" "}
              <a href={SITE.telegramHref} className="text-primary underline-offset-2 hover:underline">{SITE.telegramHandle}</a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">2. Какие данные мы&nbsp;обрабатываем</h2>
            <p className="mt-2">Через формы Сайта мы&nbsp;собираем:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>имя (если указано пользователем);</li>
              <li>номер телефона;</li>
              <li>выбранную услугу и&nbsp;тип объекта обработки;</li>
              <li>факт согласия с&nbsp;настоящей Политикой и&nbsp;Пользовательским соглашением.</li>
            </ul>
            <p className="mt-2">
              Дополнительно автоматически собираются технические данные: IP-адрес, тип браузера и&nbsp;устройства, страница входа,
              источник перехода, файлы cookie сервисов веб-аналитики.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">3. Цели обработки</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>обработка заявки и&nbsp;связь с&nbsp;пользователем по&nbsp;указанному телефону;</li>
              <li>расчёт стоимости услуг и&nbsp;согласование выезда специалиста;</li>
              <li>заключение и&nbsp;исполнение договора оказания услуг;</li>
              <li>информирование о&nbsp;статусе заявки и&nbsp;гарантийных обязательствах;</li>
              <li>улучшение работы Сайта и&nbsp;качества сервиса.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">4. Правовые основания обработки</h2>
            <p className="mt-2">
              Обработка осуществляется на&nbsp;основании согласия пользователя, которое он&nbsp;выражает, отмечая чекбокс
              «Я&nbsp;согласен с&nbsp;политикой обработки персональных данных» при&nbsp;отправке заявки. Согласие может быть
              отозвано в&nbsp;любой момент по&nbsp;e-mail{" "}
              <a href={SITE.emailHref} className="text-primary underline-offset-2 hover:underline">{SITE.email}</a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">5. Сроки и&nbsp;способы хранения</h2>
            <p className="mt-2">
              Данные хранятся на&nbsp;защищённых серверах в&nbsp;течение срока, необходимого для&nbsp;исполнения целей обработки,
              но&nbsp;не&nbsp;более 5&nbsp;лет с&nbsp;момента получения. По&nbsp;истечении срока или по&nbsp;письменному
              требованию пользователя данные уничтожаются.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">6. Передача третьим лицам</h2>
            <p className="mt-2">
              Мы&nbsp;не&nbsp;продаём и&nbsp;не&nbsp;передаём персональные данные третьим лицам, кроме случаев, прямо
              предусмотренных законодательством РФ&nbsp;или необходимых для&nbsp;исполнения договора (например, передача
              курьерской службе для&nbsp;доставки документов).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">7. Cookie и&nbsp;аналитика</h2>
            <p className="mt-2">
              Сайт использует файлы cookie для&nbsp;корректной работы интерфейса и&nbsp;сервисы веб-аналитики
              (Яндекс.Метрика, Google&nbsp;Analytics) для&nbsp;сбора обезличенной статистики. Пользователь может
              отключить cookie в&nbsp;настройках браузера; в&nbsp;этом случае часть функций может работать некорректно.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">8. Права пользователя</h2>
            <p className="mt-2">
              Пользователь вправе получать сведения об&nbsp;обработке своих данных, требовать их&nbsp;уточнения, блокирования
              или&nbsp;уничтожения, а&nbsp;также отзывать согласие. Запрос направляется на&nbsp;e-mail{" "}
              <a href={SITE.emailHref} className="text-primary underline-offset-2 hover:underline">{SITE.email}</a>{" "}
              и&nbsp;рассматривается в&nbsp;срок до&nbsp;10&nbsp;рабочих дней.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">9. Изменения политики</h2>
            <p className="mt-2">
              Мы&nbsp;вправе обновлять настоящую Политику. Актуальная редакция всегда размещена по&nbsp;адресу{" "}
              <Link to="/privacy" className="text-primary underline-offset-2 hover:underline">/privacy</Link>.
              Дата последней редакции указана в&nbsp;начале документа.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}