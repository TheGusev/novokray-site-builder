import dogovorAsset from "@/assets/docs/dogovor-obrazec.pdf.asset.json";
import zhurnalAsset from "@/assets/docs/zhurnal-sanpin.pdf.asset.json";
import aktAsset from "@/assets/docs/akt-vypolnennyh-rabot.pdf.asset.json";
import sertAsset from "@/assets/docs/sertifikat-dezinfekcii.pdf.asset.json";

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
    url: dogovorAsset.url,
    file: "dogovor-obrazec.pdf",
    description: "Типовой договор на оказание дезинсекционных и дератизационных услуг с прописанными сроками гарантии.",
  },
  {
    slug: "zhurnal-sanpin",
    title: "Журнал СанПиН",
    note: "Учёт мероприятий · форма",
    url: zhurnalAsset.url,
    file: "zhurnal-sanpin.pdf",
    description: "Форма журнала учёта санитарно-эпидемиологических мероприятий для юрлиц и УК.",
  },
  {
    slug: "akt",
    title: "Акт выполненных работ",
    note: "Образец акта приёмки",
    url: aktAsset.url,
    file: "akt-vypolnennyh-rabot.pdf",
    description: "Образец акта приёмки оказанных услуг с указанием объёма работ и гарантийного срока.",
  },
  {
    slug: "sertifikat",
    title: "Сертификат дезинфекции",
    note: "Подтверждение работ",
    url: sertAsset.url,
    file: "sertifikat-dezinfekcii.pdf",
    description: "Сертификат, подтверждающий проведение дезинфекционных работ — для УК, ТСЖ и проверяющих органов.",
  },
];

export const getDoc = (slug: string) => DOCS.find((d) => d.slug === slug);