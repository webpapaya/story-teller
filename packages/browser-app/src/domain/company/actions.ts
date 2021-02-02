import { Company } from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const createCompany = fetchViaHTTP(Company.actions.createCompany)

export const renameCompany = fetchViaHTTP(Company.actions.rename)

export const whereCompanies = fetchViaHTTP(Company.queries.where)
