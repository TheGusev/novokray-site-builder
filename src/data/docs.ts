// PDF-образцы лежат в public/docs — статикой, чтобы отдавались любым хостингом напрямую.
export interface DocItem {
  slug: string;
  title: string;
  note: string;
  url: string;
  file: string;
  description: string;
}

export const DOCS: DocItem[] = [
  {
    slug: "dogovor",
    title: "Договор",
    note: "Разовая обработка · 2 стр.",
    url: "/docs/dogovor-obrazec.pdf",
    file: "dogovor-obrazec.pdf",
    description: "Типовой договор на оказание дезинсекционных и дератизационных услуг с прописанными сроками гарантии.",
  },
  {
    slug: "zhurnal-sanpin",
    title: "Журнал СанПиН",
    note: "Учёт мероприятий · форма",
    url: "/docs/zhurnal-sanpin.pdf",
    file: "zhurnal-sanpin.pdf",
    description: "Форма журнала учёта санитарно-эпидемиологических мероприятий для юрлиц и УК.",
  },
  {
    slug: "akt",
    title: "Акт выполненных работ",
    note: "Образец акта приёмки",
    url: "/docs/akt-vypolnennyh-rabot.pdf",
    file: "akt-vypolnennyh-rabot.pdf",
    description: "Образец акта приёмки оказанных услуг с указанием объёма работ и гарантийного срока.",
  },
  {
    slug: "sertifikat",
    title: "Сертификат дезинфекции",
    note: "Подтверждение работ",
    url: "/docs/sertifikat-dezinfekcii.pdf",
    file: "sertifikat-dezinfekcii.pdf",
    description: "Сертификат, подтверждающий проведение дезинфекционных работ — для УК, ТСЖ и проверяющих органов.",
  },
];

export const getDoc = (slug: string) => DOCS.find((d) => d.slug === slug);