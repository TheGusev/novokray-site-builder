import { describe, expect, it } from "vitest";
import { parseMarkdownBlocks } from "../mdx-lite";

describe("Markdown-таблицы блога", () => {
  it("разбирает таблицу из статьи о тараканах", () => {
    const blocks = parseMarkdownBlocks([
      "| Параметр | Прусак | Чёрный |",
      "|---|---|---|",
      "| Препарат | Микрокапсулы + гель | Барьерная защита |",
    ].join("\n"));

    expect(blocks).toEqual([{
      kind: "table",
      head: ["Параметр", "Прусак", "Чёрный"],
      rows: [["Препарат", "Микрокапсулы + гель", "Барьерная защита"]],
    }]);
  });

  it("поддерживает пробелы, выравнивание и строки без крайних разделителей", () => {
    const blocks = parseMarkdownBlocks([
      "Название | Значение",
      " :--- | ---: ",
      "Площадь | 100 м²",
    ].join("\n"));

    expect(blocks[0]).toMatchObject({
      kind: "table",
      head: ["Название", "Значение"],
      rows: [["Площадь", "100 м²"]],
    });
  });

  it("дополняет отсутствующие ячейки, не ломая следующие блоки", () => {
    const blocks = parseMarkdownBlocks([
      "| A | B | C |",
      "| --- | --- | --- |",
      "| 1 | 2 |",
      "",
      "## Следующий раздел",
    ].join("\n"));

    expect(blocks[0]).toMatchObject({ kind: "table", rows: [["1", "2", ""]] });
    expect(blocks[1]).toEqual({ kind: "h2", text: "Следующий раздел" });
  });
});