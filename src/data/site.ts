export const SITE = {
  name: "Дез-Федерация.ру",
  shortName: "Дез-Федерация",
  domain: "https://dez-federation.ru",
  city: "Новосибирск",
  region: "Новосибирская область",
  phone: "+7 (383) 207-77-77",
  phoneHref: "tel:+73832077777",
  whatsapp: "+7 (913) 207-77-77",
  whatsappHref: "https://wa.me/79132077777",
  email: "info@dez-federation.ru",
  emailHref: "mailto:info@dez-federation.ru",
  address: "г. Новосибирск, ул. Красный проспект, 28, офис 412",
  hours: "Ежедневно 07:00–23:00",
  hoursIso: "Mo-Su 07:00-23:00",
  geo: { lat: 55.0302, lng: 82.9204 },
  social: {
    vk: "https://vk.com/dez_federation_nsk",
    telegram: "https://t.me/dez_federation_nsk",
  },
  // SDA / metrics
  rating: { value: "4.9", count: 1268 },
  founded: 2014,
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
