/*
  Warnings:

  - Added the required column `archivo_pdf` to the `Documento_Mascota` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Documento_Mascota" ADD COLUMN     "archivo_pdf" TEXT NOT NULL;
