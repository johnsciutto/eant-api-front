const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const PORT = process.env.PORT || 2000;

app.get('/:name?', (req, res) => {
  const name = req.params.name || 'home';

  const title = name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();

  res.render('home', { title });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
