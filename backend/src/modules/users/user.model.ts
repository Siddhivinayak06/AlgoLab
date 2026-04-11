import { InferSchemaType, model, Schema } from "mongoose"

import { USER_ROLES } from "../../constants/roles"

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "student",
      required: true,
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

userSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.passwordHash
    delete ret.refreshTokenHash
    return ret
  },
})

export type UserDocument = InferSchemaType<typeof userSchema>

export const UserModel = model<UserDocument>("User", userSchema)
