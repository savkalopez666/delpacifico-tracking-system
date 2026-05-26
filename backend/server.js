const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");
const path = require("path");

dotenv.config();

const app = express();

// ======================================
// MIDDLEWARES
// ======================================
app.use(cors());
app.use(express.json());

// ======================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// ======================================
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID; 

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'google-credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'], // Solo lectura
});

// ======================================
// TEST API
// ======================================
app.get("/", (req, res) => {
  res.send("🚀 WMS Tracking API con Google Sheets funcionando de forma segura");
});

// ======================================
// TRACK ORDER
// ======================================
app.get("/track-order", async (req, res) => {
  try {
    // Obtener y limpiar el número de pedido buscado
    const orderNumber = String(req.query.orderNumber || "")
      .replace(/\s/g, "")
      .replace(".0", "")
      .trim()
      .toLowerCase();

    console.log("Pedido recibido para buscar:", orderNumber);

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        error: "Número de pedido requerido"
      });
    }

    // Conectar con la API de Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Traemos las filas de la pestaña (Cambia 'Hoja 1' si tu pestaña se llama diferente)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'MATRIZ', 
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No se encontraron datos en la Matriz de Google"
      });
    }

    // Función de limpieza idéntica a tu código original
    const clean = (value) => {
      return String(value || "")
        .replace(/"/g, "")
        .replace(/\s/g, "")
        .replace(".0", "")
        .trim()
        .toLowerCase();
    };

    // Buscar el pedido en las filas (saltándonos la cabecera i=0)
    let foundOrder = null;

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];

      // Mantenemos tus mismas posiciones de búsqueda exacta:
      const matchesOrder = 
        clean(values[1]) === orderNumber ||  // values[1] -> Documento
        clean(values[0]) === orderNumber ||  // values[0] -> Nota Venta
        clean(values[32]) === orderNumber;   // values[32] -> Traspaso

      if (matchesOrder) {
        foundOrder = values;
        break; // Detener bucle al encontrar el primero
      }
    }

    // Si pasamos por todas las filas y no se encontró
    if (!foundOrder) {
      return res.status(404).json({
        success: false,
        error: "Pedido no encontrado"
      });
    }

    // Respuesta idéntica con la estructura que tu React espera
    return res.json({
      success: true,
      order: foundOrder
    });

  } catch (err) {
    console.error("ERROR GENERAL EN EL SERVIDOR:", err);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor al conectar con Google Sheets"
    });
  }
});

// ======================================
// SERVER
// ======================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend seguro corriendo en http://localhost:${PORT}`);
});