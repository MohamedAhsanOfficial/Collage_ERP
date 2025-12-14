const { initialize, addAssignment, getAssignments, close } = require('../db');

async function main() {
  await initialize();
  const dueDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  await addAssignment('CI/CD smoke test', 'validate that the store can add a task', dueDate);
  const raw = await getAssignments();
  if (!raw.length) {
    throw new Error('No assignments found after adding a record');
  }
  console.log('assignment tracker test passes with', raw.length, 'records');
  await close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
