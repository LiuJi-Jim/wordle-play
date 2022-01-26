import { Answer } from './types';
import * as path from 'path';
import * as fs from 'fs';

export function visualize(answers: Answer[]): string {
  const VIS: Record<Answer, string> = {
    E: '⬜',
    G: '🟩',
    Y: '🟨',
  };

  return answers.map((ans) => VIS[ans]).join('');
}

export function check(input: string, expected: string): Answer[] {
  const result: Answer[] = [];
  const chars = new Map<string, number>();
  for (let i = 0; i < expected.length; i++) {
    const ch = expected.charAt(i);
    const count = (chars.get(ch) || 0) + 1;
    chars.set(ch, count);
  }
  for (let i = 0; i < input.length; i++) {
    const ch1 = input.charAt(i);
    const ch2 = expected.charAt(i);
    if (ch1 === ch2) {
      result[i] = 'G';
      const count = chars.get(ch1) || 1;
      chars.set(ch1, count - 1);
    } else if ((chars.get(ch1) || 0) > 0) {
      result[i] = 'Y';
    } else {
      result[i] = 'E';
    }
  }

  return result;
}

export async function loadDict(length: number): Promise<string[]> {
  const filename = path.join(process.cwd(), 'dict', 'dict_lewdle.txt');
  const txt = await new Promise<string>((resolve) => {
    fs.readFile(filename, 'utf-8', (err, data) => {
      resolve(data);
    });
  });
  const words = txt.split('\n').filter((word) => word.length === length);
  return words;
}
