export default function carnetFormat(mascotaSeleccionada: any, vacunas: any[], desparasitaciones: any[]) {
  const carnetFormat = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #4A90E2;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #4A90E2;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 18px;
              color: #666;
            }
            .pet-info {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            .pet-info h2 {
              color: #4A90E2;
              margin-top: 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .section-title {
              background: #4A90E2;
              color: white;
              padding: 12px;
              border-radius: 5px;
              margin-top: 30px;
              margin-bottom: 15px;
              font-size: 18px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .med-container {
              border: 1px solid #e0e0e0;
              padding: 8px;
              border-radius: 6px;
              background: #ffffff;
            }
            .med-top {
              font-weight: bold;
              margin-bottom: 6px;
            }
            .med-bottom {
              font-size: 12px;
              color: #666;
            }
            .vet-container {
              border: 1px dashed #e0e0e0;
              padding: 8px;
              border-radius: 6px;
              background: #fff;
              font-size: 12px;
            }
            .small { font-size: 12px; color: #666 }
            th {
              background: #e3f2fd;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #4A90E2;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e0e0e0;
            }
            tr:last-child td { border-bottom: none; }
            .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🐾 PocketVet</div>
            <div class="subtitle">Carnet Digital de Salud</div>
          </div>

          <div class="pet-info">
            <h2>Información de la Mascota</h2>
            <div class="info-row"><strong>Nombre:</strong> <span>${mascotaSeleccionada.nombre}</span></div>
            <div class="info-row"><strong>Especie:</strong> <span>${mascotaSeleccionada.especie}</span></div>
            <div class="info-row"><strong>Raza:</strong> <span>${mascotaSeleccionada.raza || 'No especifica'}</span></div>
            <div class="info-row"><strong>Sexo:</strong> <span>${mascotaSeleccionada.sexo}</span></div>
            <div class="info-row"><strong>Color:</strong> <span>${mascotaSeleccionada.color || 'No especifica'}</span></div>
            <div class="info-row"><strong>Peso:</strong> <span>${mascotaSeleccionada.peso}</span></div>
            <div class="info-row"><strong>Fecha de Nacimiento:</strong> <span>${new Date(mascotaSeleccionada.fecha_nacimiento).toLocaleDateString('es-ES')}</span></div>
            <div class="info-row"><strong>Alergias:</strong> <span>${mascotaSeleccionada.alergias || 'No especifica'}</span></div>
            <div class="info-row"><strong>Enfermedades:</strong> <span>${mascotaSeleccionada.enfermedades || 'No especifica'}</span></div>
          </div>

          <div class="section-title">💉 VACUNAS</div>
          ${
            vacunas.length === 0
              ? '<p style="text-align: center; color: #666; font-style: italic;">No hay vacunas registradas</p>'
              : `
              <table>
                <thead>
                  <tr>
                    <th>Aplicación</th>
                    <th>Medicamento</th>
                    <th>Peso (kg)</th>
                    <th>Veterinaria</th>
                    <th>Próxima Dosis</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${vacunas
                    .map(
                      (v) => `
                    <tr>
                      <td>${v.fecha_aplicacion}</td>
                      <td>
                        <div class="med-container">
                          <div class="med-top">${v.nombre_medicamento}' — '${v.laboratorio}</div>
                          <div class="med-bottom">
                            <div>Lote: ${v.id_lote}</div>
                            <div>Elab: ${v.mes_elaboracion_medicamento && v.ano_elaboracion_medicamento ? v.mes_elaboracion_medicamento + '/' + v.ano_elaboracion_medicamento : 'N/A'}</div>
                            <div>Venc: ${v.mes_vencimiento_medicamento}/${v.ano_vencimiento_medicamento}</div>
                          </div>
                        </div>
                      </td>
                      <td>${v.peso}</td>
                      <td><div class="vet-container"><div><strong>${v.nombre_veterinaria}</strong></div><div class="small">Tel: ${v.telefono_veterinaria || 'N/A'}</div><div class="small">Dir: ${v.direccion_veterinaria}</div></div></td>
                      <td>${v.proxima_dosis ? new Date(v.proxima_dosis).toLocaleDateString('es-ES') : 'N/A'}</td>
                      <td>${v.observaciones || 'N/A'}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            `
          }

          <div class="section-title">💊 DESPARASITACIONES</div>
          ${
            desparasitaciones.length === 0
              ? '<p style="text-align: center; color: #666; font-style: italic;">No hay desparasitaciones registradas</p>'
              : `
              <table>
                <thead>
                  <tr>
                    <th>Aplicación</th>
                    <th>Medicamento</th>
                    <th>Peso (kg)</th>
                    <th>Veterinaria</th>
                    <th>Próxima Dosis</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${desparasitaciones
                    .map(
                      (d) => `
                    <tr>
                      <td>${d.fecha_aplicacion}</td>
                      <td>
                        <div class="med-container">
                          <div class="med-top">${d.nombre_medicamento}' — '${d.laboratorio}</div>
                          <div class="med-bottom">
                            <div>Lote: ${d.id_lote}</div>
                            <div>Elab: ${d.mes_elaboracion_medicamento && d.ano_elaboracion_medicamento ? d.mes_elaboracion_medicamento + '/' + d.ano_elaboracion_medicamento : 'N/A'}</div>
                            <div>Venc: ${d.mes_vencimiento_medicamento}/${d.ano_vencimiento_medicamento}</div>
                          </div>
                        </div>
                      </td>
                      <td>${d.peso}</td>
                      <td><div class="vet-container"><div><strong>${d.nombre_veterinaria}</strong></div><div class="small">Tel: ${d.telefono_veterinaria || 'N/A'}</div><div class="small">Dir: ${d.direccion_veterinaria}</div></div></td>
                      <td>${d.proxima_dosis ? new Date(d.proxima_dosis).toLocaleDateString('es-ES') : 'N/A'}</td>
                      <td>${d.observaciones || 'N/A'}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            `
          }

          <div class="footer">
            <p><strong>PocketVet - Carnet Digital</strong></p>
            <p>Generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </body>
        </html>
      `;

  return carnetFormat;
}
