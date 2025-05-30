const User = require("./../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// User SignUp
const userSignUp = async function (req, res) {
  try {
    const { username, email, password } = req.body;
    if (!email) {
      throw new Error("Please provide the email");
    }
    if (!password) {
      throw new Error("Please provide the password");
    }
    if (!username) {
      throw new Error("Please provide the username");
    }

    const user = await User.findOne({ email });
    if (user) {
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const data = {
      ...req.body,
      password: hashedPassword,
    };

    const userData = new User(data);
    const saveUser = await userData.save();

    res.status(200).json({
      data: saveUser,
      success: true,
      error: false,
      message: "User Created Successfully",
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      error: true,
      success: false,
    });
  }
};

// User SignIn

const UserSignIn = async function (req, res) {
  try {
    const { email, password } = req.body;
    if (!email) {
      throw new Error("Please provide email");
    }
    if (!password) {
      throw new Error("Please provide password");
    }

    const user = await User.findOne({  email });
    if (!user) {
      throw new Error("User not exists");
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (checkPassword) {
      const tokenData = {
        _id: user._id,
        email: user.email,
      };

      const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });

      const tokenOption = {
        httpOnly: true,

        secure: true,
        sameSite: "None",
      };

      res.cookie("token", token, tokenOption).json({
        message: "Login Successful",
        data: token,
        success: true,
        error: false,
      });
    } else {
      throw new Error("Password Not Matched");
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
      error: true,
      success: false,
    });
  }
};

// User Detail

const userDetail = async function (req, res) {
  try {
    const user = await User.findById(req.userId);
    // console.log(user);
    res.status(200).json({
      message: "User detail",
      data: user,
      error: false,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      error: true,
      success: false,
    });
  }
};

// User Logout
const userLogout = async function (req, res) {
  try {
    const tokenOption = {
      httpOnly: true, // The cookie cannot be accessed via JavaScript
      secure: true, // Only use secure cookies in production (over HTTPS)
      sameSite: "None", // Required when using secure cookies across different domains
    };
    res.clearCookie("token", tokenOption);
    return res.json({
      message: "Logged Out Successfully",
      error: false,
      success: true,
      data: [],
    });
  } catch (err) {
    // Error handling
    return res.status(500).json({
      message: err.message || "An error occurred during logout.",
      error: true,
      success: false,
    });
  }
};

module.exports = {
  userSignUp,
  UserSignIn,
  userDetail,
  userLogout,
};
