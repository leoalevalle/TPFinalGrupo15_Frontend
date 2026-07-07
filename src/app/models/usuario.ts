import { Vehiculo } from './vehiculo';
export class Usuario {
  idUsuario!: number;
  nombre!: string;
  telefono!: string;
  email!: string;
  nomUsuario!: string;
  contrasenia!: string;
  activo!: boolean;
  rol!: number;
  sexo!: string;

  aprobadaPorAdmin?: boolean;
  enJornada?: boolean;
  disponible?: boolean;
  vehiculoAsignado?: Vehiculo;
}
