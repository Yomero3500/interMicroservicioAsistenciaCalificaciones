import { EstadoAsistenciaTutorado } from '../../domain/enums/EstadoAsistenciaTutorado';
import { IAsistenciaTutoradoRepository } from '../ports/output/IAsistenciaTutoradoRepository';
import { AlumnoRepository } from '../../../shared/infrastructure/persistence/repositories/AlumnoRepository';

export interface ListaAsistenciaResponse {
    tutorAcademico: string;
    fecha: Date;
    tutorados: {
        matricula: string;
        nombre: string;
        carrera: string;
        estado: EstadoAsistenciaTutorado;
        observaciones?: string;
        registrado: boolean; // Si ya fue marcado en el sistema
    }[];
    resumen: {
        total: number;
        presentes: number;
        ausentes: number;
        retardos: number;
        justificados: number;
    };
}

export class ObtenerListaAsistenciaUseCase {
    constructor(
        private readonly asistenciaRepository: IAsistenciaTutoradoRepository,
        private readonly alumnoRepository: AlumnoRepository
    ) {}

    async execute(tutorAcademico: string, fecha: Date): Promise<ListaAsistenciaResponse> {
        // Obtener todos los estudiantes del tutor
        const estudiantes = await this.alumnoRepository.findByTutorAcademico(tutorAcademico);
        
        // Obtener asistencias ya registradas para esta fecha
        const asistenciasRegistradas = await this.asistenciaRepository.findByTutorAndFecha(tutorAcademico, fecha);
        const asistenciasMap = new Map(asistenciasRegistradas.map(a => [a.matriculaEstudiante, a]));

        // Construir la lista completa
        const tutorados = estudiantes.map(estudiante => {
            const asistencia = asistenciasMap.get(estudiante.matricula);
            
            return {
                matricula: estudiante.matricula,
                nombre: estudiante.nombre,
                carrera: estudiante.carrera,
                estado: asistencia?.estado || EstadoAsistenciaTutorado.AUSENTE,
                observaciones: asistencia?.observaciones,
                registrado: !!asistencia
            };
        });

        // Calcular resumen
        const resumen = {
            total: tutorados.length,
            presentes: tutorados.filter(t => t.estado === EstadoAsistenciaTutorado.PRESENTE).length,
            ausentes: tutorados.filter(t => t.estado === EstadoAsistenciaTutorado.AUSENTE).length,
            retardos: tutorados.filter(t => t.estado === EstadoAsistenciaTutorado.RETARDO).length,
            justificados: tutorados.filter(t => t.estado === EstadoAsistenciaTutorado.JUSTIFICADO).length
        };

        return {
            tutorAcademico,
            fecha,
            tutorados,
            resumen
        };
    }
}
