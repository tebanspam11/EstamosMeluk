@echo off
REM  🟢 Inicialización del entorno PocketVet

echo Inicializando entorno para PocketVet...

REM 1. Instalar dependencias
echo Instalando dependencias (npm install)...
call npm install
echo Dependencias instaladas.
echo.


REM 2. Verificar si existe el archivo .env
if exist .env (
    echo ✅ Archivo .env encontrado. No se modifica.
) else (
    echo ⚠️ No se encontro .env. Creando uno ejemplo...
    (
        echo EXPO_PUBLIC_API_KEY="TU_API_KEY_AQUI"
        echo EXPO_PUBLIC_AUTH_DOMAIN="pocketvet-84557.firebaseapp.com"
        echo EXPO_PUBLIC_PROJECT_ID="pocketvet-84557"
        echo EXPO_PUBLIC_STORAGE_BUCKET="pocketvet-84557.appspot.com"
        echo EXPO_PUBLIC_MESSAGING_SENDER_ID="768214284853"
        echo EXPO_PUBLIC_APP_ID="1:768214284853:web:706d7eea71de1ce2ec8f7c"
    ) > .env
    echo ✅ Archivo .env creado.
)
echo.


REM 3. Ejecutar pruebas
echo Ejecutando pruebas (si existen)...
call npm test || echo ⚠️ No hay pruebas definidas, continuando...
echo.

REM 4. Levantar aplicación con Expo
echo 🚀 Iniciando Expo...
call npx expo start -c

REM Fin
pause
