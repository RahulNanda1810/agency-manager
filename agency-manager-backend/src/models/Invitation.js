const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ["org_admin", "member"],
      default: "member"
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending"
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

invitationSchema.index({ orgId: 1, email: 1 });
invitationSchema.index({ token: 1 });
invitationSchema.index({ expiresAt: 1 });

module.exports =
  mongoose.models.Invitation ||
  mongoose.model("Invitation", invitationSchema);
