const User = require('../models/buyer/User');
const Product=require('../models/seller/Product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controller function to handle user registration
exports.registerUser = async (req, res) => {
    try {
        const { firstname, lastname, username, email, password, profileImage, phoneNumber, age, gender, location } = req.body;
        // console.log(username,email,password,confirmPassword);

        // Check if the required fields are provided
        if (!firstname || !lastname || !username || !email || !password || !phoneNumber || !age || !gender || !location) {
            return res.status(400).json({ error: 'Please provide all the information' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password.toString(), 10);

        // Create a new user instance
        const newUser = new User({ firstname, lastname, username, email, password: hashedPassword, profileImage, phoneNumber, age, gender, location });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user: ', error);
        res.status(500).json({ error: error.message || 'An error occurred while registering user' });
    }
};

// Controller function to handle user login 
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Ensure that the JWT_SECRET is provided and valid
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'JWT secret is missing or invalid' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in user: ', error);
        res.status(500).json({ error: 'An error occurred while logging in user' });
    }
};

// Controller function to get user details
exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'An error occurred while fetching user details' });
    }
};

// Controller function to update user details
exports.updateUserDetails = async (req, res) => {
    try {
        const userId = req.userId;
        const { username, email } = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId, { username, email }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user details: ', error);
        res.status(500).json({ error: 'An error occurred while updating user details ' });
    }
};

// Controller function to delete user account
exports.deleteUserAccount = async (req, res) => {
    try {
        const userId = req.userId;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({ error: 'An error occurred while deleting user account' });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        //clear the JWT token on the client-side
        res.clearCookie('token');
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user: ', error);
        res.status(500).json({ error: 'An error occurred while logging out user' });
    }
};

//adding product id into user schema

exports.adding= async (req, res) => {
    try {
        // Fetch all seller information
        const products= await Product.find();

        if (!products || products.length === 0) {
            return res.status(400).json({ error: 'No products found' });
        }

        // Create an array to hold seller IDs
        const productId = products.map(product => product._id);

        // Find existing SellerData document
        let productData = await User.findOne();

        // If SellerData document doesn't exist, create a new one
        if (!productData) {
            productData= new User({ productId});
        } else {
            // If SellerData document exists, update the sellerIds array
            productData.productId = productId;
        }

        // Save the seller data instance
        await User.save();

        res.status(200).json({ message: 'Seller data fetched successfully', data: products });
    } catch (error) {
        console.error('Error fetching seller details: ', error);
        res.status(500).json({ error: error.message || "An error occurred while fetching seller details"});
    }
};

// Other controller functions for user-related operations
