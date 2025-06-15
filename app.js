const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  console.log('Root route hit on temporary server!');
  res.send('Hello from temporary Render backend!');
});

app.listen(PORT, () => {
  console.log(`Temporary server running on port ${PORT}`);
}); 