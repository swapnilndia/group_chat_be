import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const hashPasswordFunction = async (password) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

export const verifyPasswordFunction = async (password, hashedPassword) => {
  const response = await bcrypt.compare(password, hashedPassword);
  return response;
};

export const generateAccessToken = ({ email, id }) => {
  const accessToken = jwt.sign({ email, id }, "awesome", { expiresIn: "1h" });
  return accessToken;
};
export const generateRefreshToken = ({ email, id }) => {
  const refreshToken = jwt.sign({ email, id }, "emosewa", { expiresIn: "1d" });
  return refreshToken;
};
