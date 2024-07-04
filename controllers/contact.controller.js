import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Contact from "../models/contact.model.js";
import User from "../models/user.model.js";

export const addUserToContacts_controller = async (req, res) => {
  const { contact_user_id } = req.body;
  const { user_id } = req.user;
  console.log(contact_user_id, user_id);
  try {
    const addedUserContact = await Contact.create({
      contact_user_id: contact_user_id,
      user_id,
    });

    if (addedUserContact) {
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "User added to contact",
            addedUserContact
          ).toJSON()
        );
    }
    return res
      .status(404)
      .json(new ApiError(404, "User  was not found").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.error(error);
  }
};

export const getListOfContacts_controller = async (req, res) => {
  const { user_id } = req.user;
  try {
    const listOfUserContacts = await User.findByPk(user_id, {
      attributes: ["user_id", "name", "email", "phone"],
      include: {
        model: User,
        as: "Contacts",
        through: {
          attributes: [],
        },
        attributes: ["user_id", "name", "email", "phone"], // Adjust attributes as needed
      },
    });

    if (listOfUserContacts) {
      return res
        .status(201)
        .json(
          new ApiResponse(
            200,
            "fetched list of contacts",
            listOfUserContacts
          ).toJSON()
        );
    }
    return res
      .status(404)
      .json(new ApiError(404, "User  was not found").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.error(error);
  }
};

export const removeUserFromContacts_controller = async (req, res) => {
  const { contact_user_id } = req.body;
  const { user_id } = req.user;
  try {
    const removeUser = await Contact.destroy({
      where: {
        contact_user_id: contact_user_id,
        user_id,
      },
    });
    console.log(removeUser);
    if (removeUser) {
      return res
        .status(201)
        .json(
          new ApiResponse(201, "User removed from contact", removeUser).toJSON()
        );
    }
    return res
      .status(404)
      .json(new ApiError(404, "User  was not found").toJSON());
  } catch (error) {
    res.status(500).json(
      new ApiError(500, "Something went wrong", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }).toJSON()
    );
    console.error(error);
  }
};
