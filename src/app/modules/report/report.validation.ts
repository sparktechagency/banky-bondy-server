import { z } from 'zod';
import { ENUM_INCIDENT_TYPE } from './report.enum';

const reportValidationSchema = z.object({
    body: z.object({
        reportTo: z.string({ required_error: 'Reported persion is requried' }),
        incidentType: z.enum(
            Object.values(ENUM_INCIDENT_TYPE) as [string, ...string[]]
        ),
    }),
});

const ReportValidations = {
    reportValidationSchema,
};

export default ReportValidations;
