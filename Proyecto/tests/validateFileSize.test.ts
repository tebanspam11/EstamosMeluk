import { validateFileSize } from "../Backend/src/utils/validateFileSize";

describe("validateFileSize()", () => {

  test("Debe aceptar un archivo pequeño (1MB)", () => {
    const size = 1 * 1024 * 1024; // 1 MB
    expect(validateFileSize(size)).toEqual({ valido: true, error: null });
  });

  test("Debe aceptar un archivo exactamente en el límite (5MB)", () => {
    const size = 5 * 1024 * 1024; // 5 MB
    expect(validateFileSize(size)).toEqual({ valido: true, error: null });
  });

  test("Debe rechazar un archivo que supera el límite (6MB)", () => {
    const size = 6 * 1024 * 1024;
    expect(validateFileSize(size)).toEqual({
      valido: false,
      error: "El archivo supera el límite de 5 MB",
    });
  });

});
