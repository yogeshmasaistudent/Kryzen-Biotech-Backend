const { Router } = require("express");
const bcrypt = require("bcrypt");
const { UserModel } = require("../model/schema");
const userRouter = Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// user/register
userRouter.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  console.log("signBody", req.body);

  try {
    const userPresent = await UserModel.findOne({ where: { email } });
    if (userPresent) {
      return res.status(200).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 4);
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });
    res.send("Sign up successful");
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong, please try again later");
  }
});

// user/login
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("logBody", req.body);

  try {
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPassMatch = await bcrypt.compare(password, user.password);
    if (!isPassMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userID: user.id }, process.env.KEY, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send("Something went wrong in Login, please try again later");
  }
});

module.exports = { userRouter };
