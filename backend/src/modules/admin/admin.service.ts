import { Types } from "mongoose"

import { AppError } from "../../utils/http-error"
import { ExperimentModel } from "../experiments/experiment.model"
import { ReportModel } from "../reports/report.model"
import { UserModel } from "../users/user.model"
import { ListUsersQueryDto, UpdateUserRoleDto } from "./admin.dto"

export async function listUsers(query: ListUsersQueryDto) {
  const skip = (query.page - 1) * query.limit

  const [items, total] = await Promise.all([
    UserModel.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .select("-passwordHash -refreshTokenHash")
      .lean(),
    UserModel.countDocuments({}),
  ])

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  }
}

export async function updateUserRole(id: string, input: UpdateUserRoleDto) {
  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      $set: {
        role: input.role,
      },
    },
    { new: true, runValidators: true }
  )
    .select("-passwordHash -refreshTokenHash")
    .lean()

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND")
  }

  return user
}

export async function deleteUser(id: string, requesterUserId: string) {
  if (id === requesterUserId) {
    throw new AppError("You cannot delete your own account", 400, "SELF_DELETE_BLOCKED")
  }

  const user = await UserModel.findByIdAndDelete(id)

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND")
  }

  const userObjectId = new Types.ObjectId(id)

  await Promise.all([
    ExperimentModel.deleteMany({ userId: userObjectId }),
    ReportModel.deleteMany({ userId: userObjectId }),
  ])
}

export async function getAdminAnalytics() {
  const [totalUsers, totalExperiments, totalReports, usersByRole] = await Promise.all([
    UserModel.countDocuments({}),
    ExperimentModel.countDocuments({}),
    ReportModel.countDocuments({}),
    UserModel.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]),
  ])

  const roleCounts = usersByRole.reduce<Record<string, number>>((acc, row) => {
    acc[row._id] = row.count
    return acc
  }, {})

  return {
    totalUsers,
    totalExperiments,
    totalReports,
    usersByRole: {
      student: roleCounts.student ?? 0,
      instructor: roleCounts.instructor ?? 0,
      admin: roleCounts.admin ?? 0,
    },
  }
}
