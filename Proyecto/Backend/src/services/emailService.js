import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Envía un email de bienvenida a un nuevo usuario
 * @param {string} correo 
 * @param {string} nombre 
 */
export async function sendWelcomeEmail(correo, nombre) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a PocketVet!</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); padding: 40px 30px; text-align: center;">
                  <div style="font-size: 64px; margin-bottom: 10px;">🐾</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                    ¡Bienvenido a PocketVet!
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                    ¡Hola ${nombre}! 👋
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Nos emociona que te hayas unido a <strong>PocketVet</strong>, la aplicación que te ayuda a cuidar mejor de tus mascotas.
                  </p>
                  <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Con PocketVet puedes:
                  </p>
                  
                  <!-- Features List -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 12px 0;">
                        <span style="font-size: 20px;">📋</span>
                        <span style="margin-left: 10px; color: #333333; font-size: 15px;">
                          <strong>Registrar tus mascotas</strong> con toda su información
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <span style="font-size: 20px;">💉</span>
                        <span style="margin-left: 10px; color: #333333; font-size: 15px;">
                          <strong>Guardar vacunas y tratamientos</strong> en su historial
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <span style="font-size: 20px;">📅</span>
                        <span style="margin-left: 10px; color: #333333; font-size: 15px;">
                          <strong>Calendario de eventos</strong> y recordatorios
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <span style="font-size: 20px;">🔔</span>
                        <span style="margin-left: 10px; color: #333333; font-size: 15px;">
                          <strong>Notificaciones automáticas</strong> de próximos eventos
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <span style="font-size: 20px;">🏥</span>
                        <span style="margin-left: 10px; color: #333333; font-size: 15px;">
                          <strong>Carnet digital</strong> para tus mascotas
                        </span>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- CTA Box -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color: #e7f3ff; border-radius: 8px; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #004085; font-size: 16px; font-weight: 600;">
                          ¡Comienza ahora! 🚀
                        </p>
                        <p style="margin: 0; color: #004085; font-size: 14px; line-height: 1.5;">
                          Abre la aplicación y registra tu primera mascota para empezar a disfrutar de todas las funciones.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Si tienes alguna pregunta o sugerencia, no dudes en contactarnos. ¡Estamos aquí para ayudarte!
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                    Gracias por confiar en nosotros 💙
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} PocketVet - Cuidado integral para tu mascota 🐶🐱
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"PocketVet" <noreply.pocketvet@gmail.com>`,
    replyTo: process.env.EMAIL_USER,
    to: correo,
    subject: '🐾 ¡Bienvenido a PocketVet!',
    html: htmlTemplate,
    text: `¡Hola ${nombre}!\n\nNos emociona que te hayas unido a PocketVet, la aplicación que te ayuda a cuidar mejor de tus mascotas.\n\nCon PocketVet puedes:\n- Registrar tus mascotas con toda su información\n- Guardar vacunas y tratamientos en su historial\n- Calendario de eventos y recordatorios\n- Notificaciones automáticas\n- Carnet digital para tus mascotas\n\n¡Comienza ahora y registra tu primera mascota!\n\nGracias por confiar en nosotros 💙\nPocketVet Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email de bienvenida enviado a ${correo}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠ Error al enviar email de bienvenida:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía un código de recuperación de contraseña por email
 * @param {string} correo 
 * @param {string} code 
 */
export async function sendPasswordResetCode(correo, code) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recupera tu contraseña - PocketVet</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                    🐾 PocketVet
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                    Recuperación de contraseña
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: 600;">
                    ¡Hola! 👋
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>PocketVet</strong>.
                  </p>
                  <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Usa el siguiente código de verificación para continuar:
                  </p>
                  
                  <!-- Code Box -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <div style="background-color: #f8f9fa; border: 2px dashed #4A90E2; border-radius: 8px; padding: 20px; display: inline-block;">
                          <p style="margin: 0; color: #999999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                            TU CÓDIGO DE VERIFICACIÓN
                          </p>
                          <p style="margin: 0; color: #4A90E2; font-size: 36px; font-weight: 700; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                            ${code}
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Warning Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                      <td style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 4px;">
                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                          ⏱️ <strong>Este código expira en 10 minutos</strong><br>
                          🔒 Por tu seguridad, tienes máximo 3 intentos para ingresar el código correcto.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                    Este es un correo automático, por favor no respondas.
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} PocketVet - Cuidado integral para tu mascota 🐶🐱
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"PocketVet" <noreply.pocketvet@gmail.com>`,
    replyTo: process.env.EMAIL_USER,
    to: correo,
    subject: 'Recupera tu contraseña - PocketVet',
    html: htmlTemplate,
    text: `Tu código de recuperación de contraseña es: ${code}\n\nEste código expira en 10 minutos.\n\nSi no solicitaste este cambio, ignora este correo.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email enviado a ${correo}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠ Error al enviar email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Envía un email de confirmación después de cambiar la contraseña
 * @param {string} correo - Email del destinatario
 */
export async function sendPasswordChangedNotification(correo) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contraseña actualizada - PocketVet</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #28a745 0%, #20883a 100%); padding: 40px 30px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                    Contraseña actualizada
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: 600;">
                    ¡Todo listo! 🎉
                  </h2>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Tu contraseña de <strong>PocketVet</strong> ha sido cambiada exitosamente.
                  </p>
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                    Ahora puedes iniciar sesión en la aplicación con tu nueva contraseña.
                  </p>
                  
                  <!-- Info Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                      <td style="background-color: #e7f3ff; border-left: 4px solid #4A90E2; padding: 16px; border-radius: 4px;">
                        <p style="margin: 0; color: #004085; font-size: 14px; line-height: 1.5;">
                          📅 <strong>Fecha del cambio:</strong> ${new Date().toLocaleString('es-CO', { 
                            timeZone: 'America/Bogota',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Warning Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                      <td style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; border-radius: 4px;">
                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                          ⚠️ <strong>¿No realizaste este cambio?</strong><br>
                          Si no solicitaste cambiar tu contraseña, por favor contacta a nuestro equipo de soporte inmediatamente.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                    Este es un correo automático, por favor no respondas.
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} PocketVet - Cuidado integral para tu mascota 🐶🐱
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"PocketVet" <noreply.pocketvet@gmail.com>`,
    replyTo: process.env.EMAIL_USER,
    to: correo,
    subject: 'Tu contraseña fue actualizada - PocketVet',
    html: htmlTemplate,
    text: `Tu contraseña de PocketVet ha sido cambiada exitosamente.\n\nFecha del cambio: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n\nSi no realizaste este cambio, contacta a soporte inmediatamente.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Notificación enviada a ${correo}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('⚠Error al enviar notificación:', error);
    return { success: false, error: error.message };
  }
}
