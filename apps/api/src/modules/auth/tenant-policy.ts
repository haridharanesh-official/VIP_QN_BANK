export function tenantRecordAccessible(requestInstitutionId: string, recordInstitutionId: string | null): boolean { return recordInstitutionId === requestInstitutionId; }
