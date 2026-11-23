const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Conexão com o banco de dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "geomtr",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao MySQL:", err.message);
    return;
  }

  console.log("MySQL conectado com sucesso!");
});

// Rota inicial para testar o servidor
app.get("/", (req, res) => {
  res.send("API do GeoMTR funcionando!");
});

app.listen(3000, () => {
  console.log("Servidor GeoMTR rodando na porta 3000");
});
