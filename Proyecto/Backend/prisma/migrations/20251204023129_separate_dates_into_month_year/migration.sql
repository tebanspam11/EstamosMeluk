/*
  Warnings:

  - You are about to drop the column `fecha_elaboracion` on the `Carnet_Digital` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_vencimiento` on the `Carnet_Digital` table. All the data in the column will be lost.
  - Added the required column `ano_vencimiento_medicamento` to the `Carnet_Digital` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mes_vencimiento_medicamento` to the `Carnet_Digital` table without a default value. This is not possible if the table is not empty.
  - Made the column `laboratorio` on table `Carnet_Digital` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Carnet_Digital" DROP COLUMN "fecha_elaboracion",
DROP COLUMN "fecha_vencimiento",
ADD COLUMN     "ano_elaboracion_medicamento" INTEGER,
ADD COLUMN     "ano_vencimiento_medicamento" INTEGER NOT NULL,
ADD COLUMN     "mes_elaboracion_medicamento" INTEGER,
ADD COLUMN     "mes_vencimiento_medicamento" INTEGER NOT NULL,
ALTER COLUMN "laboratorio" SET NOT NULL;
