-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "contraseña" TEXT,
    "foto" TEXT,
    "cuenta_google" BOOLEAN DEFAULT false,
    "googleId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mascota" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "raza" TEXT,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "sexo" TEXT NOT NULL,
    "color" TEXT,
    "peso" DOUBLE PRECISION,
    "foto" TEXT,
    "alergias" TEXT,
    "enfermedades" TEXT,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mascota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" SERIAL NOT NULL,
    "id_mascota" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "estado" TEXT NOT NULL,
    "repeticion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_programada" TIMESTAMP(3) NOT NULL,
    "canal" TEXT NOT NULL,
    "enviada" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento_Mascota" (
    "id" SERIAL NOT NULL,
    "id_mascota" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "archivo_pdf" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_Mascota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carnet_Digital" (
    "id" SERIAL NOT NULL,
    "id_mascota" INTEGER NOT NULL,
    "tipo_medicamento" TEXT NOT NULL,
    "nombre_medicamento" TEXT NOT NULL,
    "fecha_aplicacion" TIMESTAMP(3) NOT NULL,
    "laboratorio" TEXT,
    "id_lote" TEXT NOT NULL,
    "fecha_elaboracion" TIMESTAMP(3),
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "nombre_veterinaria" TEXT NOT NULL,
    "telefono_veterinaria" TEXT,
    "direccion_veterinaria" TEXT NOT NULL,
    "proxima_dosis" TIMESTAMP(3),
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carnet_Digital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefono_key" ON "Usuario"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_googleId_key" ON "Usuario"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Notificacion_id_evento_key" ON "Notificacion"("id_evento");

-- CreateIndex
CREATE UNIQUE INDEX "Carnet_Digital_id_mascota_key" ON "Carnet_Digital"("id_mascota");

-- AddForeignKey
ALTER TABLE "Mascota" ADD CONSTRAINT "Mascota_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento_Mascota" ADD CONSTRAINT "Documento_Mascota_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carnet_Digital" ADD CONSTRAINT "Carnet_Digital_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

