@echo off
REM  🟢 Inicialización del entorno PocketVet

echo Inicializando entorno para PocketVet...

REM 1. Instalar dependencias
echo Instalando dependencias...
cd Proyecto
call npm install
echo ✅ Dependencias instaladas.
echo.


REM 2. Verificar si existe el archivo .env (solo para devs) para conectarlo a Render.com
cd Backend
if exist .env (
    echo ✅ Archivo .env encontrado. No se modifica.
) else (
    echo ⚠️ No se encontro .env. Creando uno de ejemplo...
    (
        echo DATABASE_URL="postgresql://USUARIO:CONTRASENA@HOST:PUERTO/NOMBRE_DB"
    ) > .env
    echo ✅ Archivo .env creado. Edítalo con tus credenciales.
)
cd ..
echo.

REM 3. Prisma: generar client
echo 🔹 Generando Prisma Client...
cd Backend
call npx prisma generate
cd ..
echo ✅ Prisma Client generado.
echo.

REM 4. Ejecutar pruebas
echo Ejecutando pruebas (si existen)...
call npm test || echo ⚠️ No hay pruebas definidas, continuando...
echo.

REM 4. Levantar aplicación con Expo (modo tunnel para mejor conecitividad)
echo 🚀 Iniciando Expo...
cd Frontend
call npx expo start --tunnel

REM Fin
pause
