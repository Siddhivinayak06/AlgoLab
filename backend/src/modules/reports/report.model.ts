import { InferSchemaType, model, Schema } from "mongoose"

const reportSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    experimentId: {
      type: Schema.Types.ObjectId,
      ref: "Experiment",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      default: "application/pdf",
    },
    size: {
      type: Number,
      required: true,
    },
    pdfData: {
      type: Buffer,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

reportSchema.index({ userId: 1, createdAt: -1 })

export type ReportDocument = InferSchemaType<typeof reportSchema>

export const ReportModel = model<ReportDocument>("Report", reportSchema)
