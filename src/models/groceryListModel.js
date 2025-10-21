// src/models/groceryListModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const groceryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.1,
  },
  unit: {
    type: String,
    required: true, // 'kg', 'g', 'pcs', 'litre', etc.
  },
}, { _id: false });

const groceryListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  items: [groceryItemSchema],
  generatedFromPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mealPlans',
  },
  sentToMaid: {
    type: Boolean,
    default: false,
  },
  orderedViaZepto: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

groceryListSchema.index({ userId: 1, createdAt: -1 });
groceryListSchema.plugin(toJSON);

const GroceryList = mongoose.model('groceryLists', groceryListSchema);
export default GroceryList;