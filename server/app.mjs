import express from "express";

const app = express();
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/posts", (req, res) => {
  return res.json("create posts successfully");
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
