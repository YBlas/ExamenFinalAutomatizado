export function expectNoErrors(result: any) {
  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }
}

export function expectDefined(value: any, message?: string) {
  if (value === undefined || value === null) {
    throw new Error(message || "Expected value to be defined");
  }
}

export function expectPath(result: any, path: string) {
  const value = path.split(".").reduce((o, k) => o?.[k], result.data);
  if (value === undefined) throw new Error(`Missing path: ${path}`);
  return value;
}
