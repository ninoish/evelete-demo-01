export const singleton = <Value>(
  name: string,
  valueFactory: (env: Env) => Value,
): Value => {
  const g = globalThis as any;
  g.__singletons ??= {};
  g.__singletons[name] ??= valueFactory();
  return g.__singletons[name];
};
