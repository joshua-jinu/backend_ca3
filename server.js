const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8080;
const SECRET_KEY = "ak37ffj30smr8kw7";

const users = [
  { username: "user", password: "user123", role: "user" },
  { username: "user", password: "user123", role: "user123" },
  { username: "admin", password: "admin123", role: "admin" },
  { username: "admin", password: "admin123", role: "admin123" },
];

app.use(express.json());

app.post("/login", (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(401).send({
        message: "username, password and role are required",
        success: false,
      });
    }

    const user = users.find(
      (u) => u.username == username && u.password == password && u.role == role
    );

    if (!user) {
      return res
        .status(401)
        .send({ message: "user not found", success: false });
    }

    const token = jwt.sign({ username, role }, SECRET_KEY, {
      expiresIn: "15m",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .send(token);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Internal Server Error", success: false });
  }
});

app.use((req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).send({ error: "Unauthorized", success: false });
    }

    const token = auth.split(" ")[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err)
        return res.status(401).send({ error: "Unauthorized", success: false });
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.log(error.message);
    return res.status(401).send({ error: "Unauthorized", success: false });
  }
});

app.get("/profile", (req, res) => {
  try {
    return res.status(200).send({ message: "Welcome to your profile!" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Internal Server Error", success: false });
  }
});

app.get("/admin-dashboard", (req, res) => {
  try {
    if (req.user.role == "admin" || req.user.role == "admin123")
      return res
        .status(200)
        .send({ message: "Welcome to the admin dashboard!" });
    return res.status(403).send({ error: "Forbidden" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Internal Server Error", success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
