/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
const log4js = require('log4js')
const cors = require("cors");
const express = require("express");
const NodeCache = require("node-cache");
const routes = require("./routes");

// Cache service used to not overfload gdemo /dbsvc user endpoint
const ttl = 60 * 60 * 1; // cache for 1 Hour
const cache = new NodeCache({
  stdTTL: ttl,
  checkperiod: ttl * 0.2,
  useClones: false,
});

const PORT = 8050;

log4js.configure({
  appenders: {
    out: { type: "console" },
  },
  categories: {
    default: { appenders: ["out"], level: "debug" },
  },
});

const handleMyErrors = (err, req, res, next) => {
  logger.debug(err.toString());
  res.status(err.response && err.response.status || err.statusCode || 500).json({
      type: 'Error', 
      message: err.message || err.response.data && err.response.data.error_description || 'Unqualified Error', 
      description: err.toString()
  })
} 

const app = express();
const logger = log4js.getLogger("default");

app.use(
  log4js.connectLogger(logger, {
    level: "auto",
    statusRules: [
      { from: 200, to: 299, level: "info" },
      { codes: [303, 304], level: "warning" },
      { from: 400, to: 499, level: "error" },
    ],
    // include the Express request ID in the logs
    format: (req, res, format) =>
      format(
        `:remote-addr - ":method :url ${JSON.stringify(
          req.body
        )} HTTP/:http-version" :status`
      ),
  })
);
app.use(cors());
app.options("*", cors());
app.use(express.json());

app.use("/", routes);

//Error Handling middleware
app.use(handleMyErrors)

app.listen(PORT, () => logger.debug(`API listening on port ${PORT}`));
