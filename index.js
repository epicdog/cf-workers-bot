require('dotenv').config();
const express = require('express');

const config = require('./config.json');
const PORT = process.env.PORT || '5000';
const app = express();

app.get('/', (req, res) => res.redirect(config.discord));
app.listen(PORT, () => console.log('Server started!'));