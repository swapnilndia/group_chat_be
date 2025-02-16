import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import {
  hashPasswordFunction,
  verifyPasswordFunction,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/helperFunctions.js";

export const signupMiddleware = async (req, res, next) => {
  const { email, password, phone } = req.body;
  try {
    const emailExists = await User.findOne({ where: { email } });
    const phoneExists = await User.findOne({ where: { phone } });

    if (emailExists || phoneExists) {
      return res
        .status(409)
        .json(
          new ApiError(
            409,
            `User with Email: ${email} or Mobile: ${phone} already exist`
          )
        );
    }
    const hashedPassword = await hashPasswordFunction(password);
    req.body.password = hashedPassword;
    console.log(req.body);
    next();
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, `Something went wrong`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );
  }
};
export const signinMiddleware = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const checkUserExists = await User.findOne({ where: { email } });

    if (!checkUserExists) {
      return res
        .status(404)
        .json(
          new ApiError(404, `User with Email: ${email} was not found`).toJSON()
        );
    }
    console.log(checkUserExists);
    const matchPassword = await verifyPasswordFunction(
      password,
      checkUserExists.dataValues.password
    );
    console.log(matchPassword);
    if (!matchPassword) {
      return res
        .status(401)
        .json(new ApiError(401, `Email or Password does not match`).toJSON());
    }
    const accessToken = generateAccessToken({
      email,
      user_id: checkUserExists.dataValues.user_id,
    });
    const refreshToken = generateRefreshToken({
      email,
      user_id: checkUserExists.dataValues.user_id,
    });
    req.body.accessToken = accessToken;
    req.body.refreshToken = refreshToken;
    req.body.user_id = checkUserExists.dataValues.user_id;
    next();
  } catch (error) {
    console.log("middleware", error);
    return res.status(500).json(
      new ApiError(500, `Something went wrong`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );
  }
};
export const refreshMiddleware = async (req, res, next) => {
  const { email, user_id } = req.user;
  try {
    const newAccessToken = generateAccessToken({
      email,
      user_id,
    });
    req.user.accessToken = newAccessToken;
    next();
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, `Something went wrong`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );
  }
};
