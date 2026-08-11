export const SITE = {
  name: "Дез-Федерация.ру",
  shortName: "Дез-Федерация",
  domain: "https://dez-federation.ru",
  city: "Новосибирск",
  region: "Новосибирская область",
  phone: "+7 (906) 998-98-88",
  phoneHref: "tel:+79069989888",
  whatsapp: "+7 (906) 998-98-88",
  whatsappHref: "https://wa.me/79069989888",
  max: "+7 (906) 998-98-88",
  maxHref: "https://max.ru/+79069989888",
  telegramHandle: "@one_help",
  telegramHref: "https://t.me/one_help",
  email: "info@dez-federation.ru",
  emailHref: "mailto:info@dez-federation.ru",
  address: "г. Новосибирск, ул. Тайгинская, зд. 13/1, помещ. 212",
  hours: "Ежедневно 07:00–23:00",
  hoursIso: "Mo-Su 07:00-23:00",
  geo: { lat: 55.0302, lng: 82.9204 },
  social: {
    telegram: "https://t.me/one_help",
    max: "https://max.ru/+79069989888",
  },
  // SDA / metrics
  rating: { value: "4.9", count: 1268 },
  founded: 2019,
  // Реквизиты юрлица (выписка из реестра лицензий Роспотребнадзора НСО от 14.11.2025)
  legal: {
    name: 'ООО «Санитарные решения»',
    fullName: 'Общество с ограниченной ответственностью «Санитарные решения»',
    inn: "5410169338",
    ogrn: "1255400030555",
    legalAddress: "630129, г. Новосибирск, ул. Тайгинская, зд. 13/1, помещ. 212",
    licenseNo: "54.НС.01.003.Л.000080.11.25",
    licenseErul: "Л064-00111-54/03753714",
    licenseDate: "14.11.2025",
    licenseAuthority: "Управление Роспотребнадзора по Новосибирской области",
    licenseScope: "Деятельность по оказанию услуг по дезинфекции, дезинсекции и дератизации",
  },
  // Банковские реквизиты для счёта на оплату. Пустые поля печатаются
  // как «указать при подписании» и не блокируют выдачу счёта.
  bank: {
    account: "",
    bankName: "",
    bik: "",
    correspondent: "",
  },
} as const;

export const NAV_MAIN = [
  { to: "/", label: "Главная" },
  { to: "/services", label: "Услуги" },
  { to: "/price", label: "Цены" },
  { to: "/garantii", label: "Гарантии" },
  { to: "/blog", label: "Блог" },
  { to: "/o-kompanii", label: "О компании" },
  { to: "/contacts", label: "Контакты" },
] as const;
