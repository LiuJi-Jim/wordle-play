import { check, loadDict } from './utils';
import { Context } from './Context';
import inquirer from 'inquirer';

async function main() {
  const wordList = await loadDict(5);

  const { count } = await inquirer.prompt<{ count: number }>({
    type: 'number',
    name: 'count',
    message: 'Count of test cases',
    default: 10,
  });

  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * wordList.length);
    const expected = wordList[index];
    console.log(`expected = ${expected}`);
    const context = new Context(expected.length, async (attempt) =>
      check(attempt, expected)
    );
    const result = await context.guess();

    console.log(`result = ${result}`);
    console.log('------');
  }
}

main();
