const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//@desc Register a user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req,res) =>{
    const {username, email, password} = req.body;
    if(!username || !email || !password){
        res.status(400);
        throw new Error("All fields are mandatory");
    }
    //Before registering a new user check do we already have a user with existing email in our db or not
    const userAvailable = await User.findOne({email});//email passed as an object
    if(userAvailable){
        res.status(400);
        throw new Error("User already registered!");
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);//10 is no. of saltOrRounds
    console.log("Hashed password: ", hashedPassword);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    console.log(`User created ${user}`);
    if(user){
        res.status(201).json({_id: user.id, email: user.email});
    }else{
        res.status(400);
        throw new Error("User data is not valid")
    }
    res.json({message: "Register the user"});
});

//@desc Login user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req,res) =>{
    const { email, password } =req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("All fields are mandatory");
    }
    const user = await User.findOne({email});
    //compare password with hashedPassword
    if(user && (await bcrypt.compare(password, user.password))){
        //now we need to provide an access token in response
        const accessToken = jwt.sign({
            user: {//payload(user information)
                username: user.username,
                email: user.email,
                id: user.id,
            },
        }, process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "25m"}
        );
        res.status(200).json({accessToken});
    }else{
        res.status(401);
        throw new Error("email or password is not valid");
    }
});

//@desc Current user info
//@route POST /api/users/current
//@access private
const currentUser = asyncHandler(async (req,res) =>{
    res.json(req.user);
});


module.exports = { registerUser, loginUser, currentUser };