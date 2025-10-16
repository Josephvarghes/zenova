import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '~/config/config';
import Role from './roleModel.js';
import APIError from '~/utils/apiError.js';
import httpStatus from 'http-status';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // optional email
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // optional phone
    },
    password: {
      type: String,
      required: true,
      private: true,
    },
    avatar: {
      type: String,
      default: 'avatar.png',
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    // In userModel.js — add inside the schema object
    height: {
      type: Number, // in cm
    },
    weight: {
      type: Number, // in kg
    },
    gender: {
      type: String, // 'male', 'female', 'other'
    },
    dietType: {
      type: String, // 'non-veg', 'veg', 'vegan'
    },
    lifestyle: {
      type: String, // 'very_active', 'active', 'sedentary'
    },
    medicalCondition: {
      type: String, // 'stress', 'none', 'diabetes', etc.
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number], // [longitude, latitude]
    },
    dob: {
      type: Date, // date of birth
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles',
      },
    ], 
	isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password; // never send password in response
      },
    },
  }
);

// Virtual field for avatar URL
userSchema.virtual('avatarUrl').get(function () {
  return config.IMAGE_URL + '/' + this.avatar;
});

// Password hash middleware
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }
  next();
});

// Instance method for password check
userSchema.methods.isPasswordMatch = function (password) {
  return bcrypt.compareSync(password, this.password);
};

/** Static helpers */
userSchema.statics.getUserById = function (id) {
  return this.findById(id);
};

userSchema.statics.getUserByIdWithRoles = function (id) {
  return this.findById(id).populate('roles', 'name description');
};

userSchema.statics.getUserByUserName = function (userName) {
  return this.findOne({ userName });
};

userSchema.statics.getUserByEmail = function (email) {
  return this.findOne({ email });
};

// Create user with basic validation
userSchema.statics.createUser = async function (body) {
  if (await this.findOne({ userName: body.userName })) {
    throw new APIError('User name already exists', httpStatus.BAD_REQUEST);
  }
  if (body.email && (await this.findOne({ email: body.email }))) {
    throw new APIError('Email already exists', httpStatus.BAD_REQUEST);
  }
  if (body.phone && (await this.findOne({ phone: body.phone }))) {
    throw new APIError('Phone already exists', httpStatus.BAD_REQUEST);
  }
  if (body.roles) {
    for (const rid of body.roles) {
      if (!(await Role.findById(rid))) {
        throw new APIError('Role does not exist', httpStatus.BAD_REQUEST);
      }
    }
  }
  return this.create(body);
};

// Update user
userSchema.statics.updateUserById = async function (userId, body) {
  const user = await this.findById(userId);
  if (!user) throw new APIError('User not found', httpStatus.NOT_FOUND);

  if (body.userName && (await this.findOne({ userName: body.userName, _id: { $ne: userId } }))) {
    throw new APIError('User name already exists', httpStatus.BAD_REQUEST);
  }
  if (body.email && (await this.findOne({ email: body.email, _id: { $ne: userId } }))) {
    throw new APIError('Email already exists', httpStatus.BAD_REQUEST);
  }
  if (body.phone && (await this.findOne({ phone: body.phone, _id: { $ne: userId } }))) {
    throw new APIError('Phone already exists', httpStatus.BAD_REQUEST);
  }

  Object.assign(user, body);
  return user.save();
};

const User = mongoose.model('users', userSchema);
export default User;
