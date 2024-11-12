import express, { Request, Response } from "express";
import { ApiResponse } from "./interfaces/ApiResponse";
import bcrypt from "bcrypt";

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
  const query = 'SELECT id_usuario, nombre_usuario, apellido_usuario, correo_usuario, telefono_usuario FROM usuario;';
  db.query(query, (err: mysql.QueryError, result: mysql.RowDataPacket[]) => {
    if (err) {
      return res.json({ code: 400, status: false, message: 'Error al obtener los usuarios' });
    }
    res.json(result);
  });
});


app.get('/api/users/:idUser', (req, res: Response) => {
  const { idUser } = req.params;
  const query = `SELECT * FROM usuario WHERE id_usuario = ${idUser}`;
  console.log(query);
  db.query(query, (err, result: mysql.RowDataPacket[]) => {
    if (err) {
      return res.json({ code: 400, status: false, message: 'Error al obtener el usuario' });
    }
    res.json(result);
  })
});


// Endpoint para Iniciar Sesion
app.post('/api/login', (req: Request, res: Response) => {
  const { correo, clave } = req.body;
  const query = `SELECT * FROM usuario WHERE id_usuario = '${correo}'`;

  console.log("Login " + query);

  let response: ApiResponse = { code: 500, message: 'Error desconocido' };

  db.query(query, async (err, result: mysql.RowDataPacket[]) => {
    if (err) {
      response = { code: 400, message: 'Error al intentar iniciar sesión' };
      return res.json(response);
    }

    if (result.length > 0) {
      const user = result[0];
      const match = await bcrypt.compare(clave, user.clave_usuario);

      response = { code: 404, message: 'Credenciales incorrectas' };
      if (match) {
        response = { code: 200, message: 'Inicio de sesión exitoso', data: result[0] };
        return res.json(response);
      }

      return res.json(response);

    } else {
      response = { code: 404, message: 'Credenciales incorrectas' };
      return res.json(response);
    }
  });
});

// Endpoint para registrar un usuario
app.post('/api/register', async (req: Request, res: Response) => {
  const { No_documento, Nombre, Apellido, Correo, Telefono, Clave } = req.body;
  const hashedPassword = await bcrypt.hash(Clave, 10);
  const query = `INSERT INTO usuario (id_usuario, nombre_usuario, apellido_usuario, correo_usuario, telefono_usuario, clave_usuario, id_rol) VALUES ('${No_documento}', '${Nombre}', '${Apellido}', '${Correo}', '${Telefono}', '${hashedPassword}', 2)`;

  console.log("Registar usuario " + query);

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

app.post('/api/crearTarea', (req: Request, res: Response) => {
  const { titulo_tarea, descripcion_tarea, id_prioridad, id_usuario, id_estado } = req.body;
  const query = `INSERT INTO tarea (titulo_tarea, descripcion_tarea, id_prioridad, id_usuario, id_estado) VALUES ('${titulo_tarea}', '${descripcion_tarea}', ${id_prioridad}, ${id_usuario}, ${id_estado})`;

  console.log(query);
  let response: ApiResponse = { code: 500, message: 'Error desconocido' };

  db.query(query, (err, result: mysql.RowDataPacket[]) => {
    if (err) {
      response = { code: 400, message: 'Error al crear la tarea' };
      return res.json(response);
    }

    response = { code: 200, message: 'Tarea creada exitosamente' };
    return res.json(response);
  })
})

app.put('/api/actualizarTarea', (req: Request, res: Response) => {
  const { id_tarea, titulo_tarea, descripcion_tarea, id_prioridad, id_usuario, id_estado } = req.body;
  const query = `UPDATE tarea SET titulo_tarea = '${titulo_tarea}', descripcion_tarea = '${descripcion_tarea}', id_prioridad = ${id_prioridad}, id_usuario = ${id_usuario}, id_estado = ${id_estado} WHERE id_tarea = ${id_tarea}`;

  console.log("Actualizar " + query);
  let response: ApiResponse = { code: 500, message: 'Error desconocido' };

  db.query(query, (err, result: mysql.RowDataPacket[]) => {
    if (err) {
      response = { code: 400, message: 'Error al actualizar la tarea' };
      return res.json(response);
    }

    response = { code: 200, message: 'Tarea actualizada exitosamente' };
    return res.json(response);
  })
})

app.get('/api/tareas', (req: Request, res: Response) => {
  const query = 'SELECT * FROM tarea';

  let response: ApiResponse = { code: 500, message: 'Error desconocido' };

  db.query(query, (err, result: mysql.RowDataPacket[]) => {
    if (err) {
      response = { code: 400, message: 'Error al obtener las tareas' };
      return res.json(response);
    }

    response = { code: 200, message: 'Tareas obtenidas exitosamente', data: result };
    return res.json(response);
  })
})

app.get('/api/tareas/:idUser', (req, res) => {
  const { idUser } = req.params;

  const query = `SELECT * FROM tarea WHERE id_usuario = ${idUser}`;
  console.log(query);

  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error en la consulta de base de datos' });
    }
    res.json({ code: 200, data: results });
  });
});

app.post('/api/notificar', (req: Request, res: Response) => {
  const habilitar_notificacion = true;
  const { descripcion_notificacion, id_usuario } = req.body;
  const query = `INSERT INTO notificacion (descripcion_notificacion, habilitar_notificacion, id_usuario) VALUES ('${descripcion_notificacion}',  ${habilitar_notificacion}, ${id_usuario})`;
  console.log(query);

  let response: ApiResponse = { code: 500, message: 'Error desconocido' };

  db.query(query, (err, result: mysql.RowDataPacket[]) => {
    if (err) {
      response = { code: 400, message: 'Error al notificar' };
      return res.json(response);
    }

    response = { code: 200, message: 'Notificacion enviada exitosamente' };
    return res.json(response);
  })
})

app.put('/api/updateNotificar', (req: Request, res: Response) => {
  const habilitar_notificacion = false;
  const { id_usuario } = req.body;
  const query = `UPDATE notificacion SET habilitar_notificacion = ${habilitar_notificacion} WHERE id_usuario = ${id_usuario}`;
  console.log(query);

  let response: ApiResponse = { code: 500, message: 'Error desconocido' };

  db.query(query, (err, result: mysql.RowDataPacket[]) => {
    if (err) {
      response = { code: 400, message: 'Error al actualizar la notificacion' };
      return res.json(response);
    }

    response = { code: 200, message: 'Notificacion actualizada exitosamente' };
    return res.json(response);
  })
})

app.get('/api/notificaciones/:idUser', (req, res) => {
  const { idUser } = req.params;

  const query = `SELECT * FROM notificacion WHERE id_usuario = ${idUser} AND habilitar_notificacion = 1`;
  console.log(query);

  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error en la consulta de base de datos' });
    }
    res.json({ code: 200, data: results });
  });
})


// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
