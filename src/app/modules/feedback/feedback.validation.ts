import { z } from 'zod';

const createFeedbackValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    description: z.string({ required_error: 'Description is required' }),
  }),
});

const updateFeedbackValidationSchema = z.object({
  body: z.object({
    replyMessage: z.string({ required_error: 'Reply is required' }),
  }),
});

const feedbackValidations = {
  createFeedbackValidationSchema,
  updateFeedbackValidationSchema,
};

export default feedbackValidations;
