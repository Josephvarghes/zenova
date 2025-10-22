import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const bmrLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  bmr: {
    type: Number,
    required: true,
    min: 0,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
  height: {
    type: Number,
    required: true,
    min: 0,
  },
  age: {
    type: Number,
    required: true,
    min: 10,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
  calculatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

bmrLogSchema.index({ userId: 1, calculatedAt: -1 });
bmrLogSchema.plugin(toJSON);

const BmrLog = mongoose.model('bmrLogs', bmrLogSchema);
export default BmrLog;