const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//register
const register = async (req, res) => {
    try {
        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //create new user
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            phone: req.body.phone,
        });

        const user = await User.findOne({ email: req.body.email });
        if (user) return res.status(403).json("Email Exists");

        //save new user
        await newUser.save();
        return res.status(201).json(newUser);
    } catch (err) {
        return res.status(500).json(err);
    }
};

//Login
const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json("Wrong credentials!");

        const validated = await bcrypt.compare(req.body.password, user.password);
        if (!validated) return res.status(400).json("Wrong credentials!");

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET);

        const { password, isAdmin, ...otherDetails } = user._doc;

        return res.cookie("access_token", token,
            { httpOnly: true, }
        ).status(200).json({ details: { ...otherDetails }, isAdmin });

    } catch (error) {
        return res.status(500).json(err);
    }
};

//Logout
const logout = async (req, res) => {
    try {
        const authHeader = req.headers['cookie'];
        if (!authHeader) return res.sendStatus(204); // No content                                                                                                                   
        // Clear the cookie by setting it to an expired date
        res.cookie('token', '', { expires: new Date(0), httpOnly: true, secure: false }); // Set secure: true if using HTTPS
        return res.json({ message: 'Logged out' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred during logout' });
    }
}

module.exports = {
    register,
    login,
    logout
}