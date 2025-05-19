import { Base } from '@/common/domain/base.domain';

export class AppointmentsDomain extends Base {
  clientId: number;
  serviceId: number;
  appointmentDate: Date;
}
