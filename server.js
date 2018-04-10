const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const employeesRouter = require('./api/employees.js');
const menusRouter = require('./api/menus.js');

const PORT = process.env.PORT || 4000;
const app = express();


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/api/menus', menusRouter);
app.use('/api/employees', employeesRouter);

app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});

module.exports = app;
