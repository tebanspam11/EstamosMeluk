import { calculatePetAge } from "../Backend/src/utils/calculatePetAge";

describe("calculatePetAge()", () => {
  test("Debe calcular correctamente la edad cuando el cumpleaños ya pasó este año", () => {
    const birth = "2000-01-10"; 
    expect(calculatePetAge(birth)).toBe(new Date().getFullYear() - 2000);
  });

  test("Debe calcular correctamente la edad cuando el cumpleaños es hoy", () => {
    const today = new Date();
    const yyyy = today.getFullYear() - 20; 
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const birth = `${yyyy}-${mm}-${dd}`;
    expect(calculatePetAge(birth)).toBe(20);
  });

  test("Debe calcular correctamente la edad cuando el cumpleaños aún no ha pasado este año", () => {
    const today = new Date();
    const yyyy = today.getFullYear() - 20;
    const mm = String(today.getMonth() + 2).padStart(2, "0"); // ejemplo: Próximo mes
    const dd = "01";

    const birth = `${yyyy}-${mm}-${dd}`;

    expect(calculatePetAge(birth)).toBe(19);
  });
});
