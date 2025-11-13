import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { CursosDataSource, AlumnosDataSource } from './shared/infrastructure/config/databases';
import calificacionRoutes from './calificacion/infrastructure/http/routes/calificacion.routes';
import asistenciaTutoradoRoutes from './asistencia-tutorado/infrastructure/http/routes/asistencia-tutorado.routes';
import estudiantesCursoRoutes from './estudiantes-curso/infrastructure/http/routes/estudiantes-curso.routes';
import { asistenciaEstudiantesRoutes } from './asistencia-estudiantes/infrastructure/http/routes/asistencia-estudiantes.routes';

const app = express();

// Configuración de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // En producción, cambiar a: callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Rutas
app.use('/api/asistencia-tutorado', asistenciaTutoradoRoutes);
app.use('/api', calificacionRoutes);
app.use('/api/cursos', estudiantesCursoRoutes);
app.use('/api/asistencia-estudiantes', asistenciaEstudiantesRoutes);

// Inicializar conexiones a las bases de datos
Promise.all([
  CursosDataSource.initialize(),
  AlumnosDataSource.initialize()
])
  .then(() => {
    console.log('Bases de datos conectadas exitosamente');
    console.log('- Base de datos de cursos: conectada');
    console.log('- Base de datos de alumnos: conectada');
  })
  .catch((error) => {
    console.error('Error al conectar las bases de datos:', error);
  });

export default app;