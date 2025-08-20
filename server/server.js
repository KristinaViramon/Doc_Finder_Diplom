require('dotenv').config();
const express = require('express');
const sequelize = require('./db');
const models = require('./models/models')
const path = require('path');
const app = express();
const router = require('./routes/base');
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const PORT = process.env.PORT;

app.use(express.json())
app.use('/api', router)
app.use('/static', express.static(path.resolve(__dirname, 'static')));
app.use(errorHandler)
app.get('/api/test', (req, res) => {
  res.send('API is reachable!');
});
const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => console.log('Сервер запущен' + PORT));
    } catch (e) {
        console.log(e);
    }
};
start();