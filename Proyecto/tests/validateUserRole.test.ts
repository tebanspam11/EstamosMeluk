import { validateUserRole } from "../Backend/src/utils/validateUserRole";

describe("validateUserRole()", () => {

  test("Debe aceptar rol 'admin'", () => {
    expect(validateUserRole("admin")).toEqual({
      valido: true,
      error: null
    });
  });

  test("Debe aceptar rol 'cliente'", () => {
    expect(validateUserRole("cliente")).toEqual({
      valido: true,
      error: null
    });
  });

  test("Debe rechazar un rol inválido", () => {
    expect(validateUserRole("superusuario")).toEqual({
      valido: false,
      error: "Rol de usuario inválido"
    });
  });

});
