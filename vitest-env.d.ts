// vitest.config.ts sets `test.globals: true`, which makes describe/it/expect
// etc. available at runtime without importing them. This reference makes tsc
// aware of those same globals for type-checking (vitest.config.ts alone only
// configures the test runner, not the compiler).
/// <reference types="vitest/globals" />
