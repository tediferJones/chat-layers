import { FormInputs } from 'types'

export const inputConstraints: {
  [key: string]: { 
    minLength?: number,
    maxLength?: number,
    match?: string,
    required?: boolean,
    isHex?: boolean,
  }  
} = {
    username: { minLength: 8, maxLength: 32, required: true },
    password: { minLength: 8, maxLength: 32, required: true },
    servername: { minLength: 4, maxLength: 32, required: true },
    confirm: { match: 'password', required: true },
    color: { isHex: true, required: true },
  }

export function verifyInputs(inputs: { [key: string]: string }): { isValid: boolean, errors: { [key: string]: string } } {
  let result: { isValid: boolean, errors: { [key: string]: string } } = {
    isValid: true,
    errors: {},
  }

  const verifyFunctions: { [key: string]: { verify: Function, error: Function } } = {
    minLength: {
      verify: (value: string, constraint: number) => value.length >= constraint,
      error: (constraint: number) => `Must be at least ${constraint} characters`,
    },
    maxLength: {
      verify: (value: string, constraint: number) => value.length <= constraint,
      error: (constraint: number) => `Must be at most ${constraint} characters`,
    },
    match: {
      verify: (value: string, constraint: string) => value === inputs[constraint],
      error: (constraint: string) => `Doesn't match ${constraint}`,
    },
    required: {
      verify: (value: string, constraint: boolean) => !!value === constraint,
      error: () => 'This field is required',
    },
    isHex: {
      verify: (value: string, constraint: boolean) => !!value.match(/^#?([a-f0-9]{6}|[a-f0-9]{3})$/g) === constraint,
      error: () => 'Not a valid hex code',
    }
  }

  for (const input in inputs) {
    const constraints: { [key: string]: number | string | boolean }  = inputConstraints[input];
    const value: string = inputs[input];
    for (const constraint in constraints) {
      if (!verifyFunctions[constraint].verify(value, constraints[constraint])) {
        result.isValid = false;
        result.errors[input] = verifyFunctions[constraint].error(constraints[constraint]);
      }
    }
  }

  return result;
}

export function viewErrors(form: HTMLFormElement, errors: { [key: string]: string }) {
  for (const input in errors) {
    if (form[input]) {
      form[input].setCustomValidity(errors[input]);
    }
  }
  form.reportValidity();
}

export function getFormInputs(formElement: HTMLFormElement): FormInputs {
  const formData = new FormData(formElement)
  const result: FormInputs = {};
  
  for (let entry of formData.entries()) {
    result[entry[0].toString()] = entry[1].toString();
  }

  return result;
}
