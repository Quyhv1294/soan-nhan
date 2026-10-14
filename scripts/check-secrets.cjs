// Inspect staged files only; never print matching credentials.
const { execFileSync } = require('node:child_process');
const files = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const patterns = [
  /\bAIza[0-9A-Za-z_-]{30,}\b/,
  /\bgh[pousr]_[0-9A-Za-z]{20,}\b/,
  /\bgithub_pat_[0-9A-Za-z_]{20,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:sk-proj-|sk-ant-api)[0-9A-Za-z_-]{16,}/,
  /\bsb_secret_[0-9A-Za-z_-]{20,}/,
];
const issues = [];
for (const file of files) {
  if (/(?:^|\/)\.env(?:\.|$)/.test(file) && file !== '.env.example') { issues.push(`${file}: environment file must stay local`); continue; }
  const content = execFileSync('git', ['show', `:${file}`], { maxBuffer: 20_000_000 });
  if (content.includes(0)) continue;
  content.toString('utf8').split(/\r?\n/).forEach((line, i) => {
    if (patterns.some((pattern) => pattern.test(line))) issues.push(`${file}:${i + 1}: possible credential; value hidden`);
  });
}
if (issues.length) { console.error(issues.join('\n')); process.exit(1); }
console.log(`No known credential patterns in ${files.length} staged files. Environment files remain excluded.`);
