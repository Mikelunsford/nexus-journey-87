const express = require('express');
const router = express.Router();

// Example route: Home page
router.get('/', (req, res) => {
  res.send('Welcome to Nexus Journey!');
});

// Example route: Docs page
router.get('/docs', (req, res) => {
  res.send('Documentation coming soon!');
});

module.exports = router;
