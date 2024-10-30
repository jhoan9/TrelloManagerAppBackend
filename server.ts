import express, { Request, Response } from "express";
import { ApiResponse } from "./interfaces/ApiResponse";

import mysql from "mysql2";
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'taskManager'
});

db.connect((err: mysql.QueryError | null) => {
  if (err) {
    console.log('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Endpoint para obtener datos de la BD
app.get('/api/users', (req, res: Response) => {
  const query = 'SELECT * FROM usuario';
  db.query(query, (err: mysql.QueryError, result: mysql.RowDataPacket[]) => {
    if (err) {
      return res.json({ code: 400, status: false, message: 'Error al obtener los usuarios' });
    }
    res.json(result);
  });
});

// Endpoint para agregar un usuario
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
  
});

// Endpoint para Iniciar Sesion
app.post('/api/login', (req: Request, res: Response) => {
  const { correo, clave } = req.body;
  const query = `SELECT * FROM usuario WHERE correo_usuario = '${correo}' AND clave_usuario = '${clave}'`;

  let response: ApiResponse = { code: 500, message: 'Error desconocido' };

  db.query(query, (err, result: mysql.RowDataPacket[]) => {
    if (err) {
      response = { code: 400, message: 'Error al intentar iniciar sesión' };
      return res.json(response);
    }

    if (result.length > 0) {
      response = { code: 200, message: 'Inicio de sesión exitoso' };
      return res.json(response);
    } else {
      response = { code: 404, message: 'Credenciales incorrectas' };
      return res.json(response);
    }
  });
});

// Endpoint para registrar un usuario
app.post('/api/register', (req: Request, res: Response) => {
  const { No_documento, Nombre, Apellido, Correo, Telefono, Clave } = req.body;
  const query = `INSERT INTO usuario (id_usuario, nombre_usuario, apellido_usuario, correo_usuario, telefono_usuario, clave_usuario, id_rol) VALUES ('${No_documento}', '${Nombre}', '${Apellido}', '${Correo}', '${Telefono}', '${Clave}', 2)`;

  let response: ApiResponse = { code: 500, message: 'Error desconocido' };

  db.query(query, (err, result: mysql.RowDataPacket[]) => {
    if (err) {
      response = { code: 400, message: 'El usuario ya existe' };
      return res.json(response);
    }

    response = { code: 200, message: 'Usuario registrado exitosamente' };
    return res.json(response);
  });
})

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
