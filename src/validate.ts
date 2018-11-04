import { AnySchema } from './AnySchema';
import { Validator, ErrorDetails } from './types';
import { ValidationError } from './ValidationError';

export const getValidateResult = (
  value: any,
  schema: AnySchema,
  path: string[] = []
) => {
  const validators: Validator[] = [...(schema as any).validators];
  validators.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  const ret = {
    value: value,
    errors: [] as ErrorDetails[],
  };

  for (let i = 0; i < validators.length; i++) {
    const validator = validators[i];
    const fnRet = validator.validate(ret.value, path);
    if (!fnRet) {
      continue;
    }
    if (fnRet.error) {
      ret.errors.push(fnRet.error);
    }
    if (fnRet.errors) {
      ret.errors = ret.errors.concat(fnRet.errors);
    }
    if (fnRet.hasOwnProperty('value')) {
      ret.value = fnRet.value;
    }
    if (fnRet.stop) {
      break;
    }
  }
  return ret;
};

export const validate = (value: any, schema: AnySchema) => {
  const { value: newValue, errors } = getValidateResult(value, schema, []);
  if (errors.length) {
    const error = new ValidationError('Validation error', errors);
    throw error;
  }
  return newValue;
};
