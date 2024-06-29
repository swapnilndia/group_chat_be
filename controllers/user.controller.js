import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const signup_controller = async (req, res) => {
  const { name, email, phone, password } = req.body;
  console.log(name, email, phone, password);
  try {
    const createUser = await User.create({ name, email, phone, password });
    console.log(createUser);
    if (!createUser) {
      return res
        .status(400)
        .json(new ApiError(400, `User with Email: ${email} is not created`));
    }

    return res
      .status(201)
      .json(new ApiResponse(201, "New user created successfully").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );
    console.log(error);
  }
};

export const signin_controller = async (req, res) => {
  const { accessToken, refreshToken, id } = req.body;
  console.log(accessToken, refreshToken);
  try {
    const updateUser = await User.update(
      { accessToken, refreshToken },
      {
        where: {
          id,
        },
      }
    );
    if (updateUser[0] < 1) {
      return res.status(400).json(new ApiError(400, `Unable to Signin`));
    }
    // Set the refresh token in a cookie with secure and httpOnly options
    res.cookie("refreshToken", refreshToken);

    return res
      .status(200)

      .json(
        new ApiResponse(200, "User Signin successfully", {
          accessToken,
        }).toJSON()
      );
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );
    console.log(error);
  }
};

export const signout_controller = async (req, res) => {
  console.log(req.user);
  const { id } = req.user;
  try {
    const updateUser = await User.update(
      { accessToken: null, refreshToken: null },
      {
        where: {
          id,
        },
      }
    );
    if (updateUser[0] < 1) {
      return res.status(400).json(new ApiError(400, `Unable to Signout`));
    }
    // Set the refresh token in a cookie with secure and httpOnly options
    // res.cookie("accessToken", "", {
    //   httpOnly: true,
    //   secure: true, // Set 'secure' to true in production if using HTTPS
    //   sameSite: "strict", // Optionally specify sameSite attribute
    // });
    // res.cookie("refreshToken", "", {
    //   httpOnly: true,
    //   secure: true, // Set 'secure' to true in production if using HTTPS
    //   sameSite: "strict", // Optionally specify sameSite attribute
    // });
    res.clearCookie("refreshToken");

    return res
      .status(200)

      .json(new ApiResponse(200, "User Signout successfully", {}).toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );
    console.log(error);
  }
};

export const getUserInfo_controller = async (req, res) => {
  const { id } = req.user;
  try {
    const userInfo = await User.findByPk(id, {
      attributes: ["id", "name", "email", "phone", "createdAt", "updatedAt"],
    });
    if (!userInfo) {
      return res.status(400).json(new ApiError(400, `Unable to Signin`));
    }
    return res.status(200).json(
      new ApiResponse(200, "User info retrived successfully", {
        userInfo,
      }).toJSON()
    );
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );
    console.log(error);
  }
};

export const refresh_controller = async (req, res) => {
  const { id, accessToken } = req.user;
  try {
    const updateUser = await User.update(
      { accessToken },
      {
        where: {
          id,
        },
      }
    );
    if (updateUser[0] < 1) {
      return res
        .status(400)
        .json(new ApiError(400, `Unable to update Access token`));
    }
    const userInfo = await User.findByPk(id);
    return res.status(200).json(
      new ApiResponse(200, "Token successfully refreshed", {
        accessToken,
      }).toJSON()
    );
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    );
    console.log(error);
  }
};
