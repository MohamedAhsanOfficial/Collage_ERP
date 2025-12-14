const path = require('path');
const express = require('express');
const db = require('./db');

const app = express();
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

app.get('/', async (req, res) => {
  const assignments = await db.getAssignments();
  res.render('index', {
    assignments,
    message: req.query.message,
    error: req.query.error
  });
});

app.post('/assignments', async (req, res) => {
  const title = req.body.title ? req.body.title.trim() : '';
  const description = req.body.description ? req.body.description.trim() : '';
  const dueDate = req.body.dueDate;
  if (!title || !dueDate) {
    const info = encodeURIComponent('Enter both a title and a due date.');
    return res.redirect(`/?error=${info}`);
  }
  await db.addAssignment(title, description, dueDate);
  res.redirect('/?message=' + encodeURIComponent('Saved the assignment.'));
});

app.get('/api/assignments', async (req, res) => {
  const assignments = await db.getAssignments();
  res.json(assignments);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 4000;

async function start() {
  await db.initialize();
  app.listen(port, () => {
    console.log(`Assignment tracker listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
