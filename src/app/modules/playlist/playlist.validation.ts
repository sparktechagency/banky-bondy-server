import { z } from 'zod';

export const createPlaylistValidationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        description: z.string({ required_error: 'Description is required' }),
        tags: z.array(z.string()).optional(),
        audios: z
            .array(z.string().length(24, 'Invalid audio ID'))
            .nonempty('At least one audio is required'),
    }),
});

export const updatePlaylistValidationSchema = z.object({
    body: z
        .object({
            name: z.string().optional(),
            description: z.string().optional(),
            tags: z.array(z.string()).optional(),
            cover_image: z.string().optional(),
            audios: z.array(z.string().length(24)).optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field must be provided for update',
        }),
});

const PlaylistValidations = {
    createPlaylistValidationSchema,
    updatePlaylistValidationSchema,
};

export default PlaylistValidations;
