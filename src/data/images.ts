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

// Unique blog covers
import blogUkusKlopa from "@/assets/blog-ukus-klopa.jpg";
import blogNovostroyka from "@/assets/blog-novostroyka.jpg";
import blogUchastokVesnoy from "@/assets/blog-uchastok-vesnoy.jpg";
import blogOzonAvto from "@/assets/blog-ozon-avto.jpg";
import blogPlesenVannaya from "@/assets/blog-plesen-vannaya.jpg";
import blogZatopili from "@/assets/blog-zatopili.jpg";
import blogKafe from "@/assets/blog-kafe.jpg";
import blogPodgotovka from "@/assets/blog-podgotovka.jpg";
import blogPodval from "@/assets/blog-podval.jpg";
import blogBorschevik from "@/assets/blog-borschevik.jpg";
import blogOsyBalkon from "@/assets/blog-osy-balkon.jpg";
import blogOzonVirus from "@/assets/blog-ozon-virus.jpg";

// Unique gallery (process-in-action photos)
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";

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
  gallery1, gallery2, gallery3, gallery4, gallery5, gallery6,
];

// Map blog post slug → cover image (reuses service photos thematically)
export const BLOG_COVERS: Record<string, string> = {
  "kak-otlichit-ukus-klopa": blogUkusKlopa,
  "tarakany-v-novostroyke": blogNovostroyka,
  "obrabotka-uchastka-vesnoy": blogUchastokVesnoy,
  "ozonirovanie-avto-zachem": blogOzonAvto,
  "plesen-v-vannoy-prichiny": blogPlesenVannaya,
  "zatopili-sosedi-chto-delat": blogZatopili,
  "deratizatsiya-v-kafe": blogKafe,
  "kak-podgotovit-kvartiru": blogPodgotovka,
  "blohi-iz-podvala": blogPodval,
  "borschevik-na-dache": blogBorschevik,
  "osy-na-balkone": blogOsyBalkon,
  "ozon-protiv-virusov": blogOzonVirus,
};