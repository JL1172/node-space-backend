import { execSync } from 'node:child_process';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import 'dotenv/config';
dotenv.config({ path: '../.env' });

const staged_files: string | string[] = execSync(
  'git diff --staged --name-only --diff-filter=d',
  { encoding: 'utf-8' },
)
  .split('\n')
  .filter((n) => n);

const blacklisted_patterns: RegExp[] = [
  new RegExp(process.env.DATABASE_PASSWORD),
  new RegExp(process.env.DATABASE_USER),
];

async function scan_staged(): Promise<void> {
  try {
    console.log('Staging Files...\n');
    console.log(staged_files);
    if (!process.env.DATABASE_PASSWORD || !process.env.DATABASE_USER) {
      console.log('Properly Expose .env Variables');
      process.exit(1);
    }
    for (const file of staged_files) {
      for (const pattern of blacklisted_patterns) {
        if (
          file !== 'scripts/pre-commit.ts' &&
          (pattern.test(fs.readFileSync(file, { encoding: 'utf-8' })) ||
            file === '.env')
        ) {
          console.log(
            `Error Making Commit: sensitive file [${file}] with blacklisted pattern`,
            `\n${fs.readFileSync(file, { encoding: 'utf-8' })}`,
          );
          process.exit(1);
        }
      }
    }
    console.log('Scanned All Files Successfully');
  } catch (err: unknown) {
    console.log(`Error Scanning Files: ${err}`);
    process.exit(1);
  }
}

scan_staged();
