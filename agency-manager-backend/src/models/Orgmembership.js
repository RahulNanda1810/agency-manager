const mongoose = require("mongoose");

const orgMembershipSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["org_admin", "member"],
      default: "member"
    }
  },
  { timestamps: true }
);

orgMembershipSchema.index({ orgId: 1, userId: 1 }, { unique: true });

module.exports =
  mongoose.models.OrgMembership ||
  mongoose.model("OrgMembership", orgMembershipSchema);

