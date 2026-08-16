import type { AuthUser } from "../modules/auth/auth.types";
declare global { namespace Express { interface Request { requestId?: string; authUser?: AuthUser; developmentInstitutionId?: string; institutionId?: string; memberRole?: string } } }
export {};
