import { Schema, model } from "mongoose";
import { UserDocument } from "../types/user.interface";
import validator from "validator";
import bcryptjs from "bcryptjs";

const userSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: [true, "Email is required"],
        validate: [validator.isEmail, "invalid email"],
        createIndexes: {unique: true},
    },
    username: {
        type: String,
        required: [true, "Username is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
    },
},
{
    timestamps: true,
}
);

//need to isolate logic for handling password from the user controller
//before "save", hash the password with bcrypt, then save, then if login is attempted, compare passwords with validatePassword method
// use function keyword, not an arrow function so that the "this" keyword refers to the correct scope (the current object)
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err as Error);
    }
});

userSchema.methods.validatePassword = function (password: string) {
    return bcryptjs.compare(password, this.password);
};

export default model("User", userSchema); 