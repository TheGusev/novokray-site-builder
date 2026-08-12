import { toast } from "sonner";
import { SITE } from "@/data/site";

/** Единое сообщение после отправки: без ложного «успеха», если заявка не ушла. */
export function notifyLeadResult(sent: boolean, successText: string): void {
  if (sent) {
    toast.success(successText);
    return;
  }
  toast.error(
    `Не удалось отправить заявку. Позвоните ${SITE.phone} или напишите в Telegram ${SITE.telegramHandle}.`,
    { duration: 10000 },
  );
}
