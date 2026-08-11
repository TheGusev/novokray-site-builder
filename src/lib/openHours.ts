/** Режим работы диспетчерской по времени Новосибирска. */
export const OPEN_FROM = 7;
export const OPEN_TO = 23;

/** Час (0–23) в таймзоне Новосибирска для переданного момента времени. */
export function novosibirskHour(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Novosibirsk",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const raw = parts.find((p) => p.type === "hour")?.value ?? "0";
  const hour = Number.parseInt(raw, 10);
  return Number.isFinite(hour) ? hour % 24 : 0;
}

/** Принимаем ли звонки прямо сейчас (07:00–23:00 по Новосибирску). */
export function isOpenNow(now: Date = new Date()): boolean {
  const h = novosibirskHour(now);
  return h >= OPEN_FROM && h < OPEN_TO;
}

/** Короткая подпись под номером телефона. */
export function openStatusLabel(now: Date = new Date()): string {
  return isOpenNow(now)
    ? "Сейчас принимаем звонки"
    : `Перезвоним с ${String(OPEN_FROM).padStart(2, "0")}:00`;
}