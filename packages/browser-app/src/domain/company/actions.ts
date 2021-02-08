import { Company } from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'
import { buildPermissionSelector } from '../build-permission-selector'

export const createCompany = fetchViaHTTP(Company.actions.createCompany)

export const renameCompany = fetchViaHTTP(Company.actions.rename)
export const canRenameCompany = buildPermissionSelector(Company.actions.rename)

export const whereCompanies = fetchViaHTTP(Company.queries.where)
