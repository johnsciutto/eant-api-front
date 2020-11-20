const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const PORT = process.env.PORT || 2000;

app.get('/', (req, res) => {
  const heading = 'Movie Catalog';

  const movies = [{
    _id: 'sdfsfgrerfdfdaf',
    title: 'The Matrix',
    year: 1999,
    genere: 'Science Fiction',
  }, {
    _id: 'sdfsf3411erfdfdaf',
    title: 'The Matrix Reloaded',
    year: 2007,
    genere: 'Fantasy',
  }];

  res.render('panel', { heading, movies });
});

app.get('/contacto', (req, res) => {
  res.render('contacto');
});

app.get('/:name?', (req, res) => {
  const name = req.params.name || 'home';

  const title = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  res.render('home', { title });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
