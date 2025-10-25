#!/usr/bin/env bash

echo "🟢 Inicializando entorno para PocketVet..."

echo "📦 Instalando dependencias..."
npm install

if [ ! -f ".env" ]; then
  echo "⚠️ No se encontró .env, creándolo..."
  cat <<EOF > .env
EXPO_PUBLIC_API_KEY="TU_API_KEY_AQUÍ"
EXPO_PUBLIC_AUTH_DOMAIN="pocketvet-84557.firebaseapp.com"
EXPO_PUBLIC_PROJECT_ID="pocketvet-84557"
EXPO_PUBLIC_STORAGE_BUCKET="pocketvet-84557.appspot.com"
EXPO_PUBLIC_MESSAGING_SENDER_ID="768214284853"
EXPO_PUBLIC_APP_ID="1:768214284853:web:706d7eea71de1ce2ec8f7c"
EOF
  echo "✅ Edita el archivo .env para reemplazar TU_API_KEY_AQUÍ con tu API real."
else
  echo "✅ Archivo .env encontrado, no se modificó."
fi

echo "🧪 Ejecutando pruebas..."
npm test || echo "⚠️ No hay pruebas, continuando..."

echo "🚀 Levantando aplicación Expo..."
npx expo start -c
