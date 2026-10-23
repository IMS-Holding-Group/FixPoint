const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { detectImageType } = require('../server/middleware/upload');

test('image upload detection accepts supported signatures only', () => {
  assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0, 0, 0, 0, 0])), 'jpg');
  assert.equal(detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'png');
  assert.equal(detectImageType(Buffer.from('<script>alert(1)</script>')), null);
});

test('production seed contains no accounts or fixed credentials', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.js'), 'utf8');
  assert.doesNotMatch(source, /bcrypt|password_hash|INSERT INTO user|INSERT INTO report/);
});

test('schema bootstrap cannot drop existing tables', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
  assert.doesNotMatch(source, /DROP\s+TABLE/i);
  assert.match(source, /CREATE TABLE IF NOT EXISTS department/);
});

test('sensitive local files stay ignored', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf8');
  for (const entry of ['.env', '*.key', '*.pem', 'TEST_ACCOUNTS.md', 'storage/uploads/']) assert.match(source, new RegExp(entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});
