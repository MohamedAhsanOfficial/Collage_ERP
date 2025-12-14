const { initialize, close, getDbPath } = require('../db');

async function main() {
  await initialize();
  console.log('Database schema is up to date at', getDbPath());
  await close();
}

main().catch((error) => {
  console.error('Migration failed', error);
  process.exit(1);
});
