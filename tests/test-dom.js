import { execFileSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const out = execFileSync(CHROME_PATH, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--dump-dom',
  'http://localhost:5000/'
], { encoding: 'utf-8' });

console.log('DOM Output Length:', out.length);
console.log('Contains appRoot content:', out.includes('Every drop, a bridge to life'));
console.log('Contains main navigation:', out.includes('Find Donors'));
