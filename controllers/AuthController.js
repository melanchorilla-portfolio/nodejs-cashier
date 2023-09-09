import User from "../models/User.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

const env = dotenv.config().parsed;

const generateAccessToken = async (payload) => {
    return jsonwebtoken.sign(
        payload,
        env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: env.JWT_ACCESS_TOKEN_EXPIRE }
    )
}

const generateRefreshToken = async (payload) => {
    return jsonwebtoken.sign(
        payload,
        env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: env.JWT_REFRESH_TOKEN_EXPIRE }
    )
}

const register = async (req, res) => {
  try {
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = req.body.password;
    const password_confirmation = req.body.password_confirmation;
    const role = req.body.role;

    if (!fullname) {
      throw { code: 428, message: "Field Fullname required" };
    }
    if (!email) {
      throw { code: 428, message: "Email required" };
    }
    if (!password) {
      throw { code: 428, message: "Password required" };
    }

    // check if password match
    if (password !== password_confirmation) {
      throw { code: 428, message: "PASSWORD_MUST_MATCH" };
    }

    // check if email exist
    const emailExist = await User.findOne({ email: email });
    if (emailExist) {
      throw { code: 409, message: "EMAIL_EXIST" };
    }

    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname: fullname,
      email: email,
      password: hash,
      role: role,
    });
    const user = await newUser.save();

    if (!user) {
      throw { code: 500, message: "USER_REGISTER_FAILED" };
    }

    return res.status(200).json({
      status: true,
      message: "USER_REGISTER_SUCCESS",
      user,
    });
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    return res.status(err.code).json({
      status: false,
      message: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email) {
      throw { code: 428, message: "Email required" };
    }
    if (!password) {
      throw { code: 428, message: "Password required" };
    }

    // check if email exist
    const user = await User.findOne({ email: email });
    if (!user) {
      throw { code: 404, message: "EMAIL_NOT_FOUND" };
    }

    // check if password match
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw { code: 428, message: "PASSWORD_WRONG" };
    }

    // generate token
    // const token = jsonwebtoken.sign(
    //   { id: user._id, role: user.role },
    //   env.JWT_ACCESS_TOKEN_SECRET,
    //   {
    //     expiresIn: env.JWT_ACCESS_TOKEN_EXPIRE,
    //   }
    // );

    const payload = { id: user._id, role: user.role }
    const accessToken = await generateAccessToken(payload)
    const refreshToken = await generateRefreshToken(payload)

    return res.status(200).json({
      status: true,
      message: "LOGIN_SUCCESS",
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    return res.status(err.code).json({
      status: false,
      message: err.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const reqRefreshToken = req.body.refreshToken;
    
    if (!reqRefreshToken) { throw {code: 428, message: "Refresh Token is required" } }

    const verify = jsonwebtoken.verify(reqRefreshToken, env.JWT_REFRESH_TOKEN_SECRET);
    if (!verify) { throw {code: 428, message: "REFRESH_TOKEN_INVALID" } }
    
    const payload = { _id: verify._id, role: verify.role }
    const accessToken = await generateAccessToken(payload)
    const refreshToken = await generateRefreshToken(payload)

    return res.status(200).json({
      status: true,
      message: "REFRESH_TOKEN_SUCCESS",
      accessToken,
      refreshToken
    });
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    return res.status(err.code).json({
      status: false,
      message: err.message,
    });
  }
};

export { register, login, refreshToken };
