export class Viaje {
  idViaje!: number;
  idSolicitudOrigen!: number;
  idPasajera!: number;
  idConductora!: number;
  idOperadoraAsignadora!: number;
  patenteVehiculoUtilizado!: string;
  horarioInicio!: string;
  horarioFin!: string | null;
  estadoViaje!: 'En Camino' | 'Finalizado' | 'Cancelado en Ruta';
  monto!: number | null;
}
