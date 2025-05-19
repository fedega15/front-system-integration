import * as Joi from 'joi';

export const configurationValidate = Joi.object({
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string().required(),
});
