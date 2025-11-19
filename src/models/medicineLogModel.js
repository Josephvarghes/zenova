import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const medicineLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'medicines',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Taken', 'Missed'],
    required: true,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

medicineLogSchema.index({ userId: 1, date: -1 });
medicineLogSchema.plugin(toJSON);

const MedicineLog = mongoose.model('medicineLogs', medicineLogSchema);
export default MedicineLog;