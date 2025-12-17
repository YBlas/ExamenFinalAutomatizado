export function reportSuccess(name: string) {
  console.log(`✅ ${name}`);
}

export function reportFailure(name: string, error: Error) {
  console.error(`❌ ${name}: ${error.message}`);
}
