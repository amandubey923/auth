import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: { type: String, required: true, minlength: 6 },
  resetPasswordTokenHash: String,
  resetPasswordExpires: Date
}, { timestamps: true });

export default mongoose.model('User', userSchema);
