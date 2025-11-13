-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "contraseña" TEXT,
    "cuenta_google" BOOLEAN DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mascota" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "raza" TEXT,
    "edad" INTEGER,
    "peso" REAL,
    "foto" TEXT,
    "alergias" TEXT,
    "enfermedades" TEXT,
    "observaciones" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Mascota_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_mascota" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" DATETIME NOT NULL,
    "fecha_fin" DATETIME,
    "estado" TEXT NOT NULL,
    "repeticion" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Evento_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "Mascota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_programada" DATETIME NOT NULL,
    "canal" TEXT NOT NULL,
    "enviada" BOOLEAN DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Notificacion_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "Evento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Documento_Mascota" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_mascota" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "archivo_pdf" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Documento_Mascota_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "Mascota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Carnet_Digital" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_mascota" INTEGER NOT NULL,
    "tipo_medicamento" TEXT NOT NULL,
    "nombre_medicamento" TEXT NOT NULL,
    "fecha_aplicacion" DATETIME NOT NULL,
    "laboratorio" TEXT,
    "id_lote" TEXT NOT NULL,
    "fecha_elaboracion" DATETIME,
    "fecha_vencimiento" DATETIME NOT NULL,
    "peso" REAL NOT NULL,
    "nombre_veterinaria" TEXT NOT NULL,
    "telefono_veterinaria" TEXT,
    "direccion_veterinaria" TEXT NOT NULL,
    "proxima_dosis" DATETIME,
    "observaciones" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Carnet_Digital_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "Mascota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefono_key" ON "Usuario"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Notificacion_id_evento_key" ON "Notificacion"("id_evento");

-- CreateIndex
CREATE UNIQUE INDEX "Carnet_Digital_id_mascota_key" ON "Carnet_Digital"("id_mascota");
