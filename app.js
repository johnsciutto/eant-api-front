const express = require('express');
const exphbs = require('express-handlebars');
const axios = require('axios').default;
const jwt = require('jsonwebtoken');

const { BACK_URL } = process.env;

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const PORT = process.env.PORT || 2000;

app.get('/favicon.ico', (req, res) => {
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('No favicon to show');
});

app.route('/')
  .get(async (req, res) => {
    try {
      if (!req.headers.cookie) {
        return res.render('login');
      }
      const { cookie } = req.headers;

      let auth = '';
      let decodedToken = '';
      if (cookie && cookie.slice(0, 5) === '_auth') {
        auth = cookie.slice(6);
        if (auth === false || auth === 'false') {
          res.clearCookie('_auth');
          return res.render('login');
        }
        decodedToken = await jwt.verify(auth, process.env.JWT_SECRET);
      }

      if (cookie && auth) {
        const heading = 'Movie Catalog';
        const { data: movies } = await axios({
          method: 'get',
          url: `${BACK_URL}/movies`,
          headers: {
            Cookie: cookie,
          },
        });
        if (decodedToken.admin) {
          return res.render('admin-panel', { heading, movies });
        }
        return res.render('panel', { heading, movies });
      }
      res.render('login');
    } catch (error) {
      throw new Error(error);
    }
  });

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: `${BACK_URL}/auth/signup`,
      data: req.body,
    });

    if (data.ok) {
      res.cookie('_auth', data.validToken, {
        expires: new Date(2022, 0, 1),
      });
      return res.redirect('/');
    }
    res.render('signup', { message: data.message });
  } catch (error) {
    throw new Error(error);
  }
});

app.post('/authenticate', async (req, res) => {
  // Do  a call to the backend, either get a cookie or not.

  const { data } = await axios({
    method: 'post',
    url: `${BACK_URL}/auth/login`,
    data: req.body,
  });

  if (data.ok) {
    const { token } = data;

    res.setHeader('Set-Cookie', [`_auth=${token}; expires=${new Date(2022, 1, 1).toUTCString()}`]);
    return res.redirect('/');
  }

  return res.render('login', { message: data.message });
});

app.get('/contact', (req, res) => { res.render('contacto'); });

app.route('/add')
  .get((req, res) => {
    if (!req.headers.cookie) {
      return res.render('login');
    }
    res.render('formulario', { action: 'Add', method: 'POST' });
  })
  .post(async (req, res) => {
    await axios({
      method: 'post',
      url: `${BACK_URL}/movies`,
      data: req.body,
      headers: {
        cookie: req.headers.cookie,
      },
    });
    res.redirect('/');
  });

app.route('/change/:id')
  .get(async (req, res) => {
    if (!req.headers.cookie) {
      return res.render('login');
    }
    const { id } = req.params;
    const { data } = await axios.get(`${BACK_URL}/movies/${id}`, {
      headers: {
        cookie: req.headers.cookie,
      },
    });
    res.render('formulario', {
      method: 'POST',
      action: 'Change',
      ...data,
    });
  })
  .post(async (req, res) => {
    await axios({
      method: 'put',
      url: `${BACK_URL}/movies/${req.params.id}`,
      data: req.body,
      headers: {
        cookie: req.headers.cookie,
      },
    });
    res.redirect('/');
  });

app.route('/delete/:id')
  .get(async (req, res) => {
    if (!req.headers.cookie) {
      return res.render('login');
    }
    const { id } = req.params;
    const { data } = await axios.get(`${BACK_URL}/movies/${id}`, {
      headers: {
        cookie: req.headers.cookie,
      },
    });

    res.render('formulario', {
      action: 'Delete',
      method: 'POST',
      fields: 'disabled',
      ...data,
    });
  })
  .post(async (req, res) => {
    await axios({
      method: 'delete',
      url: `${BACK_URL}/movies/${req.params.id}`,
      data: {
        flag: 'DELETE-ONE',
      },
      headers: {
        cookie: req.headers.cookie,
      },
    });
    res.redirect('/');
  });

app.get('/logout', async (req, res) => {
  res.clearCookie('_auth');
  res.redirect('/');
});

app.get('/:name?', (req, res) => {
  const name = req.params.name || 'home';

  const title = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  res.render('home', { title });
});

app.listen(PORT, () => console.log(`Front-End working on port ${PORT}...`));
