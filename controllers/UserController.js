import User from '../models/User.js'
import { isEmailExist, isEmailExistWithUserId } from '../libraries/isEmailExist.js'
import bcrypt from 'bcryptjs'

const index = async (req, res) => {
  try {
    let search = {
      fullname: { $regex: `^${req.query.search}`, $options: 'i' }
    }

    let options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10
    }

    const users = await User.paginate(search, options);

    if (!users) { throw { code: 404, message: "USER_NOT_FOUND" } }

    return res.status(200).json({
      status: true,
      total: users.length,
      users
    })
  } catch (err) {
    if (!err.code) { err.code = 500 }
    return res.status(err.code).json({
      status: false,
      message: err.message
    })
  }
}

const show = async (req, res) => {
  try {
    if (!req.params.id) {throw {code: 428, message: "ID required"}}

    const user = await User.findById(req.params.id);

    if (!user) { throw { code: 404, message: "USER_NOT_FOUND" } }

    return res.status(200).json({
      status: true,
      user
    })
  } catch (err) {
    if (!err.code) { err.code = 500 }
    return res.status(err.code).json({
      status: false,
      message: err.message
    })
  }
}

const store = async (req, res) => {
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
    const emailExist = await isEmailExist(email);
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
      throw { code: 500, message: "USER_CREATE_FAILED" };
    }

    return res.status(200).json({
      status: true,
      message: "USER_CREATE_SUCCESS",
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

const update = async (req, res) => {
  try {
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = req.body.password;
    const password_confirmation = req.body.password_confirmation;
    const role = req.body.role;

    if (!req.params.id) {throw {code: 428, message: "ID required"}}
    if (!fullname) {
      throw { code: 428, message: "Field Fullname required" };
    }
    if (!email) {
      throw { code: 428, message: "Email required" };
    }

    // check if password match
    if (password) {
      if (password !== password_confirmation) {
        throw { code: 428, message: "PASSWORD_MUST_MATCH" };
      }
    }

    // check if email exist
    const emailExist = await isEmailExistWithUserId(req.params.id, email);
    if (emailExist) {
      throw { code: 409, message: "EMAIL_EXIST" };
    }

    let fields = {}
    fields.fullname = fullname
    fields.email = email
    fields.role = role

    if (req.body.password) {
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(password, salt);
      fields.password = hash
    }

    const user = await User.findByIdAndUpdate(req.params.id, fields, { new: true });

    if (!user) {
      throw { code: 500, message: "USER_UPDATE_FAILED" };
    }

    return res.status(200).json({
      status: true,
      message: "USER_UPDATE_SUCCESS",
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

const destroy = async (req, res) => {
  try {
    if (!req.params.id) {throw {code: 428, message: "ID required"}}

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw { code: 500, message: "USER_DELETE_FAILED" };
    }

    return res.status(200).json({
      status: true,
      message: "USER_DELETE_SUCCESS",
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

export { index, store, update, show, destroy }