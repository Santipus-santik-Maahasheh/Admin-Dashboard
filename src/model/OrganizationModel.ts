import { Schema, model } from 'mongoose';

/**
 * A tenant. Every Admin/Employee belongs to exactly one Organization;
 * SuperAdmin (the platform/vendor operator) belongs to none.
 */
const organizationSchema = new Schema({
  name: { type: String, required: true, trim: true },
  // URL/login-friendly unique handle, e.g. "acme-corp".
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active',
  },
  // The Admin who created/owns the org (set after the first admin is created).
  owner: { type: Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

export const OrganizationModel = model('Organization', organizationSchema);
