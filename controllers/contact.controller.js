import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Contact from "../models/contact.model.js";
import User from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";

export const addUserToContacts_controller = async (req, res) => {
  const { contact_user_id } = req.body;
  const { user_id } = req.user;

  try {
    // Generate a UUID as connectionKey
    const connectionKey = uuidv4();

    // Create contact entry from userA to userB with connectionKey
    const addedUserContact = await Contact.create({
      contact_user_id: contact_user_id,
      user_id,
      status: "accepted", // Initial status for userA
      connectionKey, // Assign connectionKey
    });

    // Create reverse contact entry from userB to userA with same connectionKey
    const addedReverseContact = await Contact.create({
      contact_user_id: user_id,
      user_id: contact_user_id,
      status: "pending", // Initial status for userB
      connectionKey, // Assign the same connectionKey
    });

    if (addedUserContact && addedReverseContact) {
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
      .json(new ApiError(404, "User was not found").toJSON());
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
    // Fetch user's contacts where status is accepted
    const listOfUserContacts = await User.findByPk(user_id, {
      attributes: ["user_id", "name", "email", "phone"],
      include: [
        {
          model: User,
          as: "Contacts",
          through: {
            // where: { status: "accepted" }, // Only include accepted contacts
            attributes: ["contact_id", "connectionKey", "status"], // Include contact_id and connectionKey
          },
          attributes: ["user_id", "name", "email", "phone"], // Attributes to include from the associated User model
        },
      ],
      raw: false,
      nest: true,
    });

    if (listOfUserContacts) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Fetched list of contacts",
            listOfUserContacts
          ).toJSON()
        );
    }

    return res
      .status(404)
      .json(new ApiError(404, "User was not found").toJSON());
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
    // Remove contact entry where userA added userB
    const removeUser = await Contact.destroy({
      where: {
        contact_user_id: contact_user_id,
        user_id,
      },
    });

    // Also remove the reverse contact entry where userB added userA
    const removeReverseContact = await Contact.destroy({
      where: {
        contact_user_id: user_id,
        user_id: contact_user_id,
      },
    });

    if (removeUser !== 0 && removeReverseContact !== 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, "User removed from contact").toJSON());
    }

    return res
      .status(404)
      .json(new ApiError(404, "User was not found").toJSON());
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

export const acceptContactInvitation_controller = async (req, res) => {
  const { user_id } = req.user;
  const { contact_id } = req.params; // Assuming contact_id is passed in the URL params

  try {
    // Find the contact where contact_id matches and userB is the contact_user_id
    const contact = await Contact.findOne({
      where: {
        contact_id,
        contact_user_id: user_id,
        status: "pending", // Ensure it's a pending invitation
      },
    });

    if (!contact) {
      return res
        .status(404)
        .json(new ApiError(404, "Contact invitation not found").toJSON());
    }

    // Update the status to 'accepted'
    contact.status = "accepted";
    await contact.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Contact invitation accepted", contact).toJSON()
      );
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
