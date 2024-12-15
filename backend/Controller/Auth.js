const User = require('../Models/UserModel.js');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signup = async (req, res, next) => {
  const { username, email, password , role } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword , role });
  try {
    await newUser.save();
    res.status(201).json('User created successfully!');
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_TOKKEN);

    // Prepare the user data without password
    const { password: pass, ...rest } = validUser._doc;

    // Check if the request is over HTTPS (secure environment)
    const isSecure = req.protocol === 'https'; // Check if it's an HTTPS request

    // Set cookie with secure flag conditionally
    res.cookie('access_token', token, {
      httpOnly: true, // Prevent access to cookie from JavaScript
      secure: isSecure, // Only set secure flag on HTTPS
      sameSite: 'strict', // 'lax' or 'strict' based on your requirements
      maxAge: 3600000, // Optional: set cookie expiration time (1 hour)
    });

    
    console.log(rest)
    // Send the response separately after cookie has been set
    return res.status(200).json(rest);

  } catch (error) {
    next(error);
  }
};


const GetAllUsers = async (req, res, next) => {
  try {
    // Assuming you have a Users model
    const users = await User.find(); // Fetch all users
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    // Error handling
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

const DeleteUserById = async (req, res, next) => {
  try {
    const { id } = req.query; // Get user ID from request parameters
    const deletedUser = await User.findByIdAndDelete(id); // Find and delete user by ID

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

const EditUserById = async (req, res, next) => {
  try {
    const { id } = req.query; // Get user ID from request parameters
    const updates = req.body; // Get updated data from request body
    console.log(req.body)
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to edit user",
      error: error.message,
    });
  }
};



module.exports = {
    signup,signin,GetAllUsers,DeleteUserById,EditUserById
}