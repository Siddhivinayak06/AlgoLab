export const USER_ROLES = ["student", "instructor", "admin"] as const

export type UserRole = (typeof USER_ROLES)[number]
