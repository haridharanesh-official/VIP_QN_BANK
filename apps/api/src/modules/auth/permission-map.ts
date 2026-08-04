import { MemberRole } from "@prisma/client";
export const reviewerRoles: readonly MemberRole[] = [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.HOD, MemberRole.CONTENT_REVIEWER];
export const managerRoles: readonly MemberRole[] = [MemberRole.OWNER, MemberRole.ADMIN];
export const contentRoles: readonly MemberRole[] = Object.values(MemberRole);
