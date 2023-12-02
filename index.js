const express = require('express');
const bodyParser = require('body-parser');
const { dbConnect } = require('./config/dbConnect');
const dotenv = require('dotenv').config();
const authRouter = require('./routes/auth.route');
const productRouter = require('./routes/product.route');
const cookieParser = require("cookie-parser")
const morgan = require('morgan')
const { notFound, errorHandler } = require('./middlewares/errorHandler')

const PORT = process.env.PORT || 4000

const app = express();
app.use(bodyParser.json())
app.use(cookieParser())

dbConnect()

app.use(morgan('dev'))
app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.all('*', notFound);
// error handling middleware
app.use(errorHandler)
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
