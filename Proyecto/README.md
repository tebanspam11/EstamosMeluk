#  PocketVet

## Tecnologías
- Expo + React Native (TypeScript)
- Firebase (Authentication, Firestore, Storage)
- Expo Notifications
- Google Maps API

---

## Estructura del proyecto

PocketVet/
├── app/ # Navegación principal (Expo Router)
│ ├── _layout.tsx
│ └── index.tsx
│
├── src/
│ ├── config/ # Configuración global
│ │ └── firebase.ts
│ ├── screens/ # Pantallas principales
│ ├── services/ # Funciones CRUD de Firestore
│ ├── components/ # Componentes reutilizables
│ ├── hooks/ # Hooks personalizados
│ └── utils/ # Funciones auxiliares
│
├── assets/ # Imágenes y recursos
├── .env # Variables de entorno (NO subir)
├── app.json
├── package.json
└── README.md

---

## Configuración local

1. Clonar el repositorio:
```bash
git clone https://github.com/tebanspam11/EstamosMeluk
cd PocketVet
```
   
2. Instalar las dependencias:
```bash
npm install
```

3. Crear un archivo .env en la raíz con credenciales Firebase:
```env
EXPO_PUBLIC_API_KEY=...
EXPO_PUBLIC_AUTH_DOMAIN=...
EXPO_PUBLIC_PROJECT_ID=...
EXPO_PUBLIC_STORAGE_BUCKET=...
EXPO_PUBLIC_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_APP_ID=...
```

4. Inicia el proyecto:

```bash
npx expo start
```
