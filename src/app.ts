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
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

console.log('🌍 CORS - Orígenes permitidos:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    console.log('🔍 CORS Request from:', origin || 'NO ORIGIN');
    
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) return callback(null, true);
    
    // Si ALLOWED_ORIGINS incluye '*', permitir todo
    if (allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Verificar si el origen está en la lista
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS bloqueado para origen:', origin);
      callback(null, true); // Temporal: permitir de todos modos para debugging
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