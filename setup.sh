#!/bin/bash

echo "Inicializando entorno para PocketVet..."

echo "Instalando dependencias..."
cd Proyecto || exit
npm install

echo "✅ Dependencias instaladas."
echo ""

echo "Verificando archivo .env en Backend..."
cd Backend || exit
if [ -f .env ]; then
    echo "✅ Archivo .env encontrado. No se modifica."
else
    echo "⚠️ No se encontró .env. Creando uno de ejemplo..."
    cat <EOT > .env
DATABASE_URL="postgresql://USUARIO:CONTRASENA@HOST:PUERTO/NOMBRE_DB"
EOT
    echo "✅ Archivo .env creado. Edítalo con tus credenciales."
fi
cd ..
echo ""

echo "Generando Prisma Client..."
cd Backend || exit
npx prisma generate
cd ..
echo "✅ Prisma Client generado."
echo ""

echo "Ejecutando pruebas (si existen)..."
npm test || echo "⚠️ No hay pruebas definidas, continuando..."
echo ""

echo "🚀 Iniciando Expo (modo tunnel)..."
cd Frontend || exit
npx expo start --tunnel

echo ""
echo "✅ Entorno PocketVet listo."
