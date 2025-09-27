import { z } from 'zod';
import { ENUM_TEST_TYPE } from '../../utilities/enum';

const createCategoryValidationSchema = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Category name is required' })
            .min(1, 'Category name is required'),
        testType: z.enum(
            Object.values(ENUM_TEST_TYPE) as [string, ...string[]]
        ),
    }),
});
const updateCategoryValidationSchema = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Category name is required' })
            .min(1, 'Category name is required')
            .optional(),
        category_image: z
            .string({
                required_error: 'Category image is required',
            })
            .optional(),
        testType: z
            .enum(Object.values(ENUM_TEST_TYPE) as [string, ...string[]])
            .optional(),
    }),
});

const categoryValidation = {
    createCategoryValidationSchema,
    updateCategoryValidationSchema,
};

export default categoryValidation;
