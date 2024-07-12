import { signinFormSchema, signupFormSchema } from "../utils/schema.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import GroupMember from "../models/groupMember.model.js";
const A_TOKEN = process.env.ACCESS_TOKEN_SECRET;
const R_TOKEN = process.env.REFRESH_TOKEN_SECET;
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
    const payload = jwt.verify(accessToken, A_TOKEN);
    req.user = payload;
    next();
  } catch (error) {
    return res
      .status(403)
      .json(new ApiError(403, "Forbidden: Invalid access token"));
  }
};

export const refreshTokenValidation = async (req, res, next) => {
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken) {
    return res.status(401).json(new ApiError(401, `Refresh Token is Missing`));
  }
  try {
    const payload = jwt.verify(refreshToken, R_TOKEN);
    req.user = payload;
    next();
  } catch (error) {
    return res
      .status(403)
      .json(new ApiError(403, "Forbidden: Invalid refresh token"));
  }
};

export const authorizeAdminAccess = async (req, res, next) => {
  const { user_id } = req.user;
  const { group_id } = req.params;
  try {
    const fetchUser = await GroupMember.findOne({
      where: {
        user_id,
        group_id,
      },
    });
    if (!fetchUser) {
      return res
        .status(401)
        .json(new ApiError(401, `User is not found in Group`));
    }
    if (!fetchUser.dataValues.is_admin) {
      return res
        .status(403)
        .json(
          new ApiError(
            401,
            `User does not have sufficient permissions to perform this task`
          )
        );
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
  }
};

export const checkGroupAuthorizationLevel = async (req, res, next) => {
  const { user_id } = req.user;
  const { group_id } = req.params;
  try {
    const fetchUser = await GroupMember.findOne({
      where: {
        user_id,
        group_id,
      },
    });
    if (!fetchUser) {
      return res
        .status(401)
        .json(new ApiError(401, `User is not found in Group`));
    }
    if (!fetchUser.dataValues.is_admin) {
      req.isUserGroupAdmin = false;
      next();
    } else {
      req.isUserGroupAdmin = true;
      next();
    }
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
  }
};
