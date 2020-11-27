const express = require('express');
const exphbs = require('express-handlebars');
const axios = require('axios').default;

const { BACK_URL } = process.env;

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const PORT = process.env.PORT || 2000;

app.get('/favicon.ico', (req, res) => {
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('No favicon to show');
});

app.route('/')
  .get(async (req, res) => {
    const heading = 'Movie Catalog';

    const { data: movies } = await axios.get(`${BACK_URL}/peliculas`);

    res.render('panel', { heading, movies });
  })
  .post(async (req, res) => {
    await axios({
      method: 'post',
      url: `${BACK_URL}/peliculas`,
      data: req.body,
    });
    res.redirect('/');
  });

app.get('/contact', (req, res) => { res.render('contacto'); });

app.route('/add')
  .get((req, res) => {
    res.render('formulario', { action: 'Add' });
  });

app.route('/change/:id')
  .get(async (req, res) => {
    const { id } = req.params;
    const { data } = await axios.get(`${BACK_URL}/peliculas/${id}`);
    res.render('formulario', {
      method: 'POST',
      action: 'Change',
      ...data,
    });
  })
  .post(async (req, res) => {
    await axios({
      method: 'put',
      url: `${BACK_URL}/peliculas/${req.params.idModificar}`,
      data: req.body,
    });
    res.redirect('/');
  });

app.route('/delete/:id')
  .get(async (req, res) => {
    const { id } = req.params;
    const { data } = await axios.get(`${BACK_URL}/peliculas/${id}`);
    res.render('formulario', {
      action: 'Delete',
      method: 'DELETE',
      fields: 'disabled',
      ...data,
    });
  })
  // TODO: Hacer funcionar este endpoint
  .delete(async (req, res) => {
    // check if the user is authenticated
    await axios({
      method: 'delete',
      url: `${BACK_URL}/peliculas/${req.params.id}`,
      data: {
        flag: 'DELETE-ONE',
      },
    });
    res.redirect('/');
  });

app.get('/:name?', (req, res) => {
  const name = req.params.name || 'home';

  const title = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  res.render('home', { title });
});

app.listen(PORT, () => console.log(`Front-End working on port ${PORT}...`));
