const express = require("express");

const bolgStats = require("./routes/blogs-routes");
const HttpError = require("./models/http-error");

const app = express();
const port = 3000;

app.use("/api", bolgStats);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.listen(port);
