const express = require("express");
const { createProxyMiddleware, fixRequestBody  } = require("http-proxy-middleware");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is Working");
});

app.use(
    "/api/users",
    createProxyMiddleware({
      target: `${process.env.USER_SERVICE}/api/users`,
      changeOrigin: true,
      //pathRewrite: { "^/users/login": "/auth/login" },
      on: {
        proxyReq: fixRequestBody, 
      },
    })
);

app.use(
  "/api/blood",
  createProxyMiddleware({
    target: `${process.env.BLOOD_SERVICE}/api/blood`,
    changeOrigin: true,
    //pathRewrite: { "^/users/login": "/auth/login" },
    on: {
      proxyReq: fixRequestBody, 
    },
  })
);

app.use(
  "/api/events",
  createProxyMiddleware({
    target: `${process.env.EVENT_SERVICE}/api/events`,
    changeOrigin: true,
    //pathRewrite: { "^/users/login": "/auth/login" },
    on: {
      proxyReq: fixRequestBody, 
    },
  })
);


app.listen(process.env.PORT, () => console.log(`API Gateway running on port ${process.env.PORT}`));
