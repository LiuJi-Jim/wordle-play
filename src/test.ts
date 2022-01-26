import { check } from './utils';
import { Context } from './Context';

async function main() {
  const expected = 'attempt';

  const context = new Context(expected.length, async (attempt) =>
    check(attempt, expected)
  );

  const result = await context.guess();

  console.log('result =', result);
}

main();
