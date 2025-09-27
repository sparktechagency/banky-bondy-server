import { Types } from 'mongoose';
import { ENUM_INCIDENT_TYPE } from './report.enum';

export interface IReport {
    reportFrom: Types.ObjectId;
    reportTo: Types.ObjectId;
    incidentType: (typeof ENUM_INCIDENT_TYPE)[keyof typeof ENUM_INCIDENT_TYPE];
    additionalNote: string;
}
