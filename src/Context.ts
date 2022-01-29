import { loadDict, visualize } from './utils';
import { Answer, CheckFn } from './types';
import { writeDict } from './debug';

export class Context<L extends number = 5> {
  length: L;
  blackLists: Set<string>[];
  yellowLists: Set<string>[];
  greenMap: Map<number, string>;
  wordList: string[] = [];
  check: CheckFn;

  constructor(length: L, check: CheckFn) {
    this.length = length;
    this.blackLists = [];
    this.yellowLists = [];
    for (let i = 0; i < length; i++) {
      this.blackLists[i] = new Set<string>();
      this.yellowLists[i] = new Set<string>();
    }
    this.greenMap = new Map<number, string>();

    this.check = check;
  }

  async init() {
    // console.log('initializing');
    this.wordList = await loadDict(this.length);
    writeDict(this.wordList);
  }

  buildSingleRegexp(i: number): string {
    if (this.greenMap.has(i)) {
      return this.greenMap.get(i)!;
    }
    const blackChars = Array.from(this.blackLists[i]);
    const yellowChars = Array.from(this.yellowLists[i]);
    const excludedChars = [...blackChars, ...yellowChars];
    if (excludedChars.length === 0) {
      return '[a-z]';
    }
    return `[^${[...blackChars, ...yellowChars].join('')}]`;
  }

  buildWholeRegexp(): RegExp {
    const segments = ['^'];
    for (let i = 0; i < this.length; i++) {
      segments.push(this.buildSingleRegexp(i));
    }
    segments.push('$');
    return new RegExp(segments.join(''));
  }

  buildSearchPattern(): string {
    const chars: string[] = [];
    for (let i = 0; i < this.length; i++) {
      if (this.greenMap.has(i)) {
        chars[i] = this.greenMap.get(i)!;
      } else {
        chars[i] = '?';
      }
    }
    return chars.join('');
  }

  updateStatus(word: string, answers: Answer[]): void {
    for (let i = 0; i < this.length; i++) {
      const ch = word.charAt(i);
      if (answers[i] === 'E') {
        for (let j = 0; j < this.length; j++) {
          this.blackLists[j].add(ch);
        }
        this.yellowLists[i].delete(ch);
      } else if (answers[i] === 'Y') {
        this.yellowLists[i].add(ch);
        this.blackLists[i].add(ch);
      } else if (answers[i] === 'G') {
        this.greenMap.set(i, ch);
      }
    }
  }

  findCandidate(unique: boolean): string {
    if (this.wordList.length === 0) return '';
    if (unique) {
      const candidates = this.wordList.map((word) => {
        const uniqueChars = new Set(word.split(''));
        return {
          word,
          count: uniqueChars.size,
        };
      });
      candidates.sort((a, b) => b.count - a.count);
      const best = candidates[0];
      const filteredCandidates = candidates.filter(
        (pair) => pair.count === best.count
      );
      const rnd = Math.floor(Math.random() * filteredCandidates.length);
      // console.log('possible words: ', filteredCandidates.map(c => c.word));
      return filteredCandidates[rnd].word;
    } else {
      const rnd = Math.floor(Math.random() * this.wordList.length);
      return this.wordList[rnd];
    }
  }

  async guess(first = '') {
    await this.init();

    const strategy = {
      isFirstAttempt: true,
      unique: true,
    };
    while (this.greenMap.size < this.length) {
      const word =
        strategy.isFirstAttempt && first
          ? first
          : this.findCandidate(strategy.unique);
      if (word.length === 0) throw 'game over';
      strategy.isFirstAttempt = false;

      console.log(`trying '${word}'`);
      const answers = await this.check(word);

      if (answers.length === 0) {
        continue;
      }

      console.log(visualize(answers));

      const greenCount = answers.filter((ans) => ans === 'G').length;
      if (greenCount === this.length) {
        this.updateStatus(word, answers);
        break;
      }
      this.updateStatus(word, answers);
      this.filter();
      writeDict(this.wordList);
    }

    const chars: string[] = [];
    for (let i = 0; i < this.length; i++) {
      chars[i] = this.greenMap.get(i)!;
    }
    return chars.join('');
  }

  filter() {
    const rules: RegExp[] = [];
    for (let i = 0; i < this.length; i++) {
      for (const ch of this.yellowLists[i].values()) {
        rules.push(new RegExp(ch));
      }
    }
    rules.push(this.buildWholeRegexp());
    // console.log(rules);

    let result = this.wordList;
    for (let i = 0; i < rules.length; i++) {
      const regex = rules[i];
      result = result.filter((word) => regex.test(word));
    }

    this.wordList = result;
  }
}
