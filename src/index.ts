import { Context } from './Context';
import inquirer from 'inquirer';
import { Answer, CheckFn } from './types';

async function main() {
  const { length } = await inquirer.prompt<{ length: number }>({
    type: 'number',
    name: 'length',
    message: 'Length of word',
    default: 5,
  });

  const check: CheckFn = async function (attempt) {
    const { answer } = await inquirer.prompt<{ answer: string }>({
      type: 'input',
      name: 'answer',
      message: `The answer of "${attempt}" e.g. EEYYG (empty to skip)`,
      validate: (input: string) => {
        if (input.length === 0) return true;
        return (
          input.length === length &&
          input.split('').every((ch) => ch === 'E' || ch === 'G' || ch === 'Y')
        );
      },
    });
    return answer.split('') as Answer[];
  };

  const context = new Context(length, check);

  const { first } = await inquirer.prompt<{ first: string }>({
    type: 'input',
    name: 'first',
    message: `First attempt (default random word)`,
    validate: (input: string) => {
      return input.length === 0 || input.length === length;
    },
  });

  context.guess(first.length === length ? first : undefined);
}

main();
