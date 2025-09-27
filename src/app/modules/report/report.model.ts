import { model, Schema } from 'mongoose';
import { IReport } from './report.interface';
import { ENUM_INCIDENT_TYPE } from './report.enum';

const ReportSchema = new Schema<IReport>(
    {
        reportFrom: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        reportTo: {
            type: Schema.Types.ObjectId,
            ref: 'NormalUser',
            required: true,
        },
        incidentType: {
            type: String,
            enum: Object.values(ENUM_INCIDENT_TYPE),
            required: true,
        },
        additionalNote: {
            type: String,
        },
    },
    { timestamps: true }
);

const Report = model<IReport>('Report', ReportSchema);

export default Report;
