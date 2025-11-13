import express from "express";
import cors from "cors";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import mascotaRoutes from "./routes/mascotaRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/usuarios", usuarioRoutes);
app.use("/mascotas", mascotaRoutes);

app.listen(4000, () => {
    console.log("✅ Servidor corriendo en http://localhost:4000");
});
