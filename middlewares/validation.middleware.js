import { signinFormSchema, signupFormSchema } from "../utils/schema.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const signupFormValidation = async (req, res, next) => {
  try {
    await signupFormSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    //If validation passes, proceed with signup logic
    next();
  } catch (error) {
    console.log(error);
    const errors = error.inner.map((err) => ({
      field: err.path,
      message: err.message,
    }));
    res
      .status(400)
      .json(new ApiError(400, "One or more validation error", errors).toJSON());
  }
};
export const signinFormValidation = async (req, res, next) => {
  try {
    await signinFormSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    //If validation passes, proceed with signup logic
    next();
  } catch (error) {
    console.log(error);
    const errors = error.inner.map((err) => ({
      field: err.path,
      message: err.message,
    }));
    res
      .status(400)
      .json(new ApiError(400, "One or more validation error", errors).toJSON());
  }
};

export const accessTokenValidation = async (req, res, next) => {
  // const { accessToken } = req.cookies;
  const tokenHeader = req.headers["authorization"];
  const accessToken = tokenHeader && tokenHeader.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json(new ApiError(401, `Access Token is Missing`));
  }
  try {
    const payload = jwt.verify(accessToken, "awesome");
    req.user = payload;
    next();
  } catch (error) {
    return res
      .status(403)
      .json(new ApiError(403, "Forbidden: Invalid access token"));
  }
};

export const refreshTokenValidation = async (req, res, next) => {
  console.log(req);
  const refreshToken = req.cookies["refreshToken"];
  console.log(refreshToken);
  if (!refreshToken) {
    return res.status(401).json(new ApiError(401, `Refresh Token is Missing`));
  }
  try {
    const payload = jwt.verify(refreshToken, "emosewa");
    console.log(payload);
    req.user = payload;
    next();
  } catch (error) {
    return res
      .status(403)
      .json(new ApiError(403, "Forbidden: Invalid refresh token"));
  }
};
