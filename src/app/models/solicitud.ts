export class Solicitud {
  idSolicitud!: number;
  idPasajera!: number;
  idConductoraAsignada!: number | null;
  origen!: string;
  destino!: string;
  zona!: string;
  cantPasajeros!: number;
  estado!: 'Pendiente' | 'Propuesta' | 'Aceptada' | 'Rechazada' | 'Cancelada';
  fechaHora!: string;
}
