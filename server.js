require("dotenv").config();
const ConnectionDB = require("./database");
const express = require("express");
const cors = require("cors");
const path = require("path");
require('./models/Patient');
const helmet = require('helmet')
// require('./models/Posts');
ConnectionDB();

const app = express()

const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

//Available Routes
app.use("/api/auth", require("./routes/patient/auth"))


app.listen(port, () => {
  console.log(` backend listening at http://localhost:${port}`)
})