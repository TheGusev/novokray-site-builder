import heroTeam from "@/assets/hero-team.jpg";
import heroSpray from "@/assets/hero-spray.jpg";
import equipmentFlatlay from "@/assets/equipment-flatlay.jpg";
import documentsImg from "@/assets/documents.jpg";
import officeImg from "@/assets/office.jpg";
import b2bCafe from "@/assets/b2b-cafe.jpg";
import svcKlopy from "@/assets/svc-klopy.jpg";
import svcTarakany from "@/assets/svc-tarakany.jpg";
import svcGryzuny from "@/assets/svc-gryzuny.jpg";
import svcBloh from "@/assets/svc-bloh.jpg";
import svcMuravi from "@/assets/svc-muravi.jpg";
import svcOsy from "@/assets/svc-osy.jpg";
import svcMoshkiKomari from "@/assets/svc-moshki-komari.jpg";
import svcKleshchi from "@/assets/svc-kleshchi.jpg";
import svcBorshchevik from "@/assets/svc-borshchevik.jpg";
import svcPlesen from "@/assets/svc-plesen.jpg";
import svcOzon from "@/assets/svc-ozon.jpg";
import svcSushka from "@/assets/svc-sushka.jpg";
import svcFumigaciya from "@/assets/svc-fumigaciya.jpg";
import svcDezinfekciya from "@/assets/svc-dezinfekciya.jpg";
import svcDezodoraciya from "@/assets/svc-dezodoraciya.jpg";

export const COMMON = {
  heroTeam,
  heroSpray,
  equipment: equipmentFlatlay,
  documents: documentsImg,
  office: officeImg,
  b2bCafe,
};

export const SERVICE_IMAGES: Record<string, string> = {
  "unichtozhenie-klopov": svcKlopy,
  "unichtozhenie-tarakanov": svcTarakany,
  "obrabotka-uchastkov": svcKleshchi,
  "obrabotka-ot-pleseni": svcPlesen,
  "ozonirovanie-pomescheniy": svcOzon,
  "sushka-posle-zatopleniya": svcSushka,
  "dezinfekciya": svcDezinfekciya,
  "deratizaciya": svcGryzuny,
  "unichtozhenie-blokh": svcBloh,
  "unichtozhenie-os": svcOsy,
  "unichtozhenie-borschevika": svcBorshchevik,
  "fumigaciya": svcFumigaciya,
  "dezodoraciya": svcDezodoraciya,
};

// Re-exports for variety in galleries
export const GALLERY = [
  svcKlopy, svcMuravi, svcMoshkiKomari, svcOzon, svcSushka, svcPlesen,
];

// Map blog post slug → cover image (reuses service photos thematically)
export const BLOG_COVERS: Record<string, string> = {
  "kak-otlichit-ukus-klopa": svcKlopy,
  "tarakany-v-novostroyke": svcTarakany,
  "obrabotka-uchastka-vesnoy": svcKleshchi,
  "ozonirovanie-avto-zachem": svcOzon,
  "plesen-v-vannoy-prichiny": svcPlesen,
  "zatopili-sosedi-chto-delat": svcSushka,
  "deratizatsiya-v-kafe": svcGryzuny,
  "kak-podgotovit-kvartiru": svcDezinfekciya,
  "blohi-iz-podvala": svcBloh,
  "borschevik-na-dache": svcBorshchevik,
  "osy-na-balkone": svcOsy,
  "ozon-protiv-virusov": svcOzon,
};