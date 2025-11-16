import { validatePDF } from "../Backend/src/utils/validatePDF";

describe("validatePDF()", () => {
  test("Debe aceptar archivos PDF válidos", () => {
    expect(validatePDF("documento.pdf")).toBe(true);
  });

  test("Debe rechazar archivos no PDF", () => {
    expect(validatePDF("imagen.png")).toBe(false);
  });

  test("Debe rechazar archivos sin extensión", () => {
    expect(validatePDF("archivo")).toBe(false);
  });
});

