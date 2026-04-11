import { InferSchemaType, model, Schema } from "mongoose"

const experimentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    algorithm: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      default: "visualizer",
      trim: true,
    },
    arraySize: {
      type: Number,
      required: true,
      min: 1,
    },
    executionTime: {
      type: Number,
      required: true,
      min: 0,
    },
    comparisons: {
      type: Number,
      required: true,
      min: 0,
    },
    operations: {
      type: Number,
      required: true,
      min: 0,
    },
    dataType: {
      type: String,
      default: "random",
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

experimentSchema.index({ userId: 1, createdAt: -1 })
experimentSchema.index({ userId: 1, algorithm: 1, arraySize: 1 })

export type ExperimentDocument = InferSchemaType<typeof experimentSchema>

export const ExperimentModel = model<ExperimentDocument>("Experiment", experimentSchema)
