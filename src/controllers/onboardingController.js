// controllers/onboardingController.js
import User from '~/models/userModel';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';

export const saveProfile = async (req, res) => {
  try {
    const { 
      name, 
      dob, 
      height, 
      weight, 
      gender, 
      dietType, 
      lifestyle, 
      medicalCondition, 
      location 
    } = req.body;

    // Get user ID from authenticated request
    const userId = req.user.id;

    // Validate required fields (extra safety)
    const requiredFields = ['name', 'dob', 'height', 'weight', 'gender', 'dietType', 'lifestyle'];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        return res.status(400).json({
          success: false,
          data: {},
          message: `${field} is required`,
        });
      }
    }

    // Validate gender
    const allowedGenders = ['male', 'female', 'other'];
    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Gender must be male, female, or other',
      });
    }

    // Validate dietType
    const allowedDietTypes = ['non-veg', 'veg', 'vegan'];
    if (!allowedDietTypes.includes(dietType)) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Diet type must be non-veg, veg, or vegan',
      });
    }

    // Validate lifestyle
    const allowedLifestyles = ['very_active', 'active', 'sedentary'];
    if (!allowedLifestyles.includes(lifestyle)) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Lifestyle must be very_active, active, or sedentary',
      });
    }

    // Prepare update object
    const updateData = {
      fullName: name, // map 'name' from UI to 'fullName' in DB
      dob: new Date(dob),
      height: parseFloat(height),
      weight: parseFloat(weight),
      gender,
      dietType,
      lifestyle,
      medicalCondition: medicalCondition || undefined,
    };

    // Add location if provided
    if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      updateData.location = {
        type: 'Point',
        coordinates: location.coordinates.map(coord => parseFloat(coord)),
      };
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: updatedUser,
      message: 'Profile saved successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to save profile',
    });
  }
};

export default {
  saveProfile,
};