const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const authRouter = require("./routes/auth");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.use(authRouter);
const client = new Client({
  user: 'postgres',
  host: 'ridebud.c3ugimlwujc3.ap-south-1.rds.amazonaws.com',
  database: 'ridebud',
  password: 'poilkjmnb55',
  port: 5432,
});

client.connect();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


  app.listen(PORT, "0.0.0.0", () => {
    console.log(`connected at port ${PORT}`);
  });
  