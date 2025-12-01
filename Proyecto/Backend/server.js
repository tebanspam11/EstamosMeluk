const express = require('express');
const cors = require('cors');

//const mascotaRoutes = require('./src/routes/mascotaRoutes');
//const authRoutes = require('./src/routes/authRoutes');
const pdfRoutes = require('./src/routes/pdfRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

//app.use('/api/auth', authRoutes);
app.use('/api/documentos', pdfRoutes);
//app.use('/mascotas', mascotaRoutes);

app.get('/', (req, res) => {
  res.send('API running');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


