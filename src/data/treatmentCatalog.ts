// Каталог вредителей, элементов работ и базовых цен для конструктора договора.
// Цены — базовые (степень 1). Множитель применяется по степени заражения.

export type InfestationLevel = "1" | "2-3" | "4-5";

export const LEVEL_MULTIPLIER: Record<InfestationLevel, number> = {
  "1": 1.0,
  "2-3": 1.5,
  "4-5": 2.0,
};

export const LEVEL_WARRANTY_DAYS: Record<InfestationLevel, number> = {
  "1": 90,
  "2-3": 60,
  "4-5": 30,
};

export const LEVEL_LABEL: Record<InfestationLevel, string> = {
  "1": "1 балл (единичные особи)",
  "2-3": "2-3 балла (среднее)",
  "4-5": "4-5 баллов (сильное)",
};

export interface TreatmentElement {
  id: string;
  name: string;
  unit: string; // шт, м.п., м², комплект, точка
  basePrice: number; // ₽ за единицу при степени 1
  defaultQty?: number;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  levelLock?: InfestationLevel[]; // мягкая рекомендация — где имеет смысл
}

export interface PestCatalog {
  key: string;
  name: string;
  methodNote: string;
  preparations: string[]; // доступные препараты
  elements: TreatmentElement[];
  barrier?: { name: string; basePrice: number }; // отдельная опция «барьерная защита»
  outdoor?: boolean; // обработка участка/улицы
}

// Дефолтные границы по единице измерения (используется как fallback)
export const UNIT_LIMITS: Record<string, { min: number; max: number; step: number; hint: string }> = {
  "шт": { min: 1, max: 50, step: 1, hint: "Штуки — целое число от 1 до 50" },
  "м.п.": { min: 1, max: 500, step: 1, hint: "Погонные метры (по периметру) — от 1 до 500" },
  "м²": { min: 1, max: 10000, step: 1, hint: "Квадратные метры площади — от 1 до 10 000" },
  "комн.": { min: 1, max: 20, step: 1, hint: "Количество комнат — от 1 до 20" },
  "точка": { min: 1, max: 50, step: 1, hint: "Точки раскладки/обработки — от 1 до 50" },
  "комплект": { min: 1, max: 10, step: 1, hint: "Комплект работ — обычно 1" },
  "сотка": { min: 1, max: 200, step: 1, hint: "Сотка (100 м²) — от 1 до 200" },
};

export function getElementLimits(el: TreatmentElement) {
  const fallback = UNIT_LIMITS[el.unit] ?? { min: 1, max: 9999, step: 1, hint: "" };
  return {
    min: el.min ?? fallback.min,
    max: el.max ?? fallback.max,
    step: el.step ?? fallback.step,
    hint: el.hint ?? fallback.hint,
  };
}

export function clampQty(qty: number, el: TreatmentElement): number {
  const { min, max } = getElementLimits(el);
  if (!Number.isFinite(qty)) return min;
  return Math.min(max, Math.max(min, Math.round(qty)));
}

export const CATALOG: PestCatalog[] = [
  {
    key: "klopy",
    name: "Клопы",
    methodNote:
      "Обработка методом холодного/горячего тумана и точечного пролива гнёзд микрокапсулированными препаратами. Повторная обработка по гарантии — бесплатно.",
    preparations: ["Лямбда-Зона", "Дельта-Зона", "Сольфак Дуо", "Get", "Хлорпиримарк"],
    elements: [
      { id: "krovat", name: "Пролив кровати (каркас, матрас)", unit: "шт", basePrice: 600, defaultQty: 1 },
      { id: "divan", name: "Пролив дивана / мягкой мебели", unit: "шт", basePrice: 700, defaultQty: 1 },
      { id: "shkaf", name: "Пролив шкафа / комода", unit: "шт", basePrice: 500, defaultQty: 1 },
      { id: "plintus_pol", name: "Плинтусы напольные", unit: "м.п.", basePrice: 50, defaultQty: 10 },
      { id: "plintus_potol", name: "Плинтусы потолочные / молдинги", unit: "м.п.", basePrice: 50, defaultQty: 10 },
      { id: "dv_korob", name: "Дверные коробки", unit: "шт", basePrice: 200, defaultQty: 1 },
      { id: "rozetki", name: "Розетки / выключатели", unit: "шт", basePrice: 80, defaultQty: 4 },
      { id: "kover", name: "Ковры / паласы", unit: "шт", basePrice: 400, defaultQty: 1 },
      { id: "tuman", name: "Обработка туманом (помещение)", unit: "комн.", basePrice: 800, defaultQty: 1 },
    ],
    barrier: { name: "Барьерная защита периметра (30 дн.)", basePrice: 1500 },
  },
  {
    key: "tarakany",
    name: "Тараканы",
    methodNote:
      "Комбинированная обработка: пролив гелевыми приманками + барьерное опрыскивание мест миграции. Через 14 дней — контрольный осмотр по гарантии.",
    preparations: ["Get", "Дохлокс гель", "Лямбда-Зона", "Глобал", "Goliath"],
    elements: [
      { id: "kuhnya", name: "Кухонный гарнитур (пролив + гель)", unit: "комплект", basePrice: 1500, defaultQty: 1 },
      { id: "holod", name: "Пролив за/под холодильником", unit: "шт", basePrice: 400, defaultQty: 1 },
      { id: "santech", name: "Раковина / сантехнический узел", unit: "шт", basePrice: 500, defaultQty: 1 },
      { id: "plintus", name: "Плинтусы", unit: "м.п.", basePrice: 50, defaultQty: 10 },
      { id: "ventil", name: "Вентиляция / короба", unit: "шт", basePrice: 300, defaultQty: 1 },
      { id: "gel", name: "Гель-приманка (раскладка)", unit: "комплект", basePrice: 400, defaultQty: 1 },
      { id: "rozetki", name: "Розетки / выключатели", unit: "шт", basePrice: 80, defaultQty: 4 },
      { id: "tuman", name: "Обработка туманом", unit: "комн.", basePrice: 800, defaultQty: 1 },
    ],
    barrier: { name: "Барьерная защита периметра", basePrice: 1500 },
  },
  {
    key: "blokhi",
    name: "Блохи",
    methodNote:
      "Сплошная обработка пола, плинтусов и ковровых покрытий контактным препаратом. Гарантия — при условии обработки источника (домашних животных).",
    preparations: ["Лямбда-Зона", "Сольфак", "Цифокс", "Дельта-Зона"],
    elements: [
      { id: "pol", name: "Пол (сплошная обработка)", unit: "м²", basePrice: 40, defaultQty: 30 },
      { id: "plintus", name: "Плинтусы", unit: "м.п.", basePrice: 50, defaultQty: 15 },
      { id: "myagk", name: "Ковры / мягкая мебель", unit: "шт", basePrice: 500, defaultQty: 2 },
      { id: "tuman", name: "Обработка туманом", unit: "комн.", basePrice: 800, defaultQty: 1 },
    ],
    barrier: { name: "Барьерная защита", basePrice: 1500 },
  },
  {
    key: "muravi",
    name: "Муравьи",
    methodNote:
      "Обработка путей миграции и локальная ликвидация гнёзд. Применение гелевых приманок длительного действия.",
    preparations: ["Дохлокс гель", "Get", "Глобал", "Лямбда-Зона"],
    elements: [
      { id: "puti", name: "Пути миграции (плинтусы, щели)", unit: "м.п.", basePrice: 80, defaultQty: 10 },
      { id: "gnezda", name: "Локальная обработка гнёзд", unit: "шт", basePrice: 500, defaultQty: 1 },
      { id: "gel", name: "Гель-приманка (раскладка)", unit: "комплект", basePrice: 400, defaultQty: 1 },
      { id: "kuhnya", name: "Кухонный гарнитур", unit: "комплект", basePrice: 800, defaultQty: 1 },
    ],
    barrier: { name: "Барьерная защита периметра", basePrice: 1200 },
  },
  {
    key: "gryzuny",
    name: "Грызуны",
    methodNote:
      "Раскладка родентицидных приманок в защищённые контейнеры, установка клеевых площадок. Заделка нор. Контрольный визит через 10 дней.",
    preparations: ["Крысиная смерть", "Шторм (Сторм)", "Брат", "Ratron"],
    elements: [
      { id: "primanka", name: "Раскладка приманки (точка)", unit: "точка", basePrice: 200, defaultQty: 5 },
      { id: "kleev", name: "Клеевые площадки", unit: "шт", basePrice: 150, defaultQty: 5 },
      { id: "nory", name: "Заделка нор + закладка яда", unit: "шт", basePrice: 400, defaultQty: 2 },
      { id: "kontroll", name: "Контрольный визит", unit: "шт", basePrice: 800, defaultQty: 1 },
    ],
  },
  {
    key: "osy",
    name: "Осы / шершни",
    methodNote:
      "Уничтожение гнезда контактно-инсектицидным препаратом с механическим снятием. При работе на высоте — применение лестниц/страховки.",
    preparations: ["Лямбда-Зона", "Сольфак", "Get"],
    elements: [
      { id: "gn_small", name: "Гнездо до 20 см", unit: "шт", basePrice: 2000, defaultQty: 1 },
      { id: "gn_med", name: "Гнездо 20-50 см", unit: "шт", basePrice: 3500, defaultQty: 1 },
      { id: "gn_big", name: "Гнездо более 50 см", unit: "шт", basePrice: 5000, defaultQty: 1 },
      { id: "visota", name: "Высотные работы (надбавка)", unit: "шт", basePrice: 1500, defaultQty: 1 },
    ],
  },
  {
    key: "plesen",
    name: "Плесень",
    methodNote:
      "Механическая зачистка очагов, антисептирование стен и швов. Финишное озонирование для устранения спор и запаха.",
    preparations: ["Дезавид", "Неомид Bio", "Антиплесень", "Озон"],
    elements: [
      { id: "steny", name: "Обработка стен", unit: "м²", basePrice: 250, defaultQty: 10 },
      { id: "shvy", name: "Антисептирование швов", unit: "м.п.", basePrice: 100, defaultQty: 15 },
      { id: "ozon", name: "Озонирование помещения", unit: "комплект", basePrice: 1500, defaultQty: 1 },
    ],
  },
];

export function getPest(key: string): PestCatalog | undefined {
  return CATALOG.find((p) => p.key === key);
}
