import { FluentResource } from '@fluent/bundle'
import { buildI18n } from '../../utils/i18n'

const en = new FluentResource(`
startDate=Start Date
endDate=End Date
submit=Request Vacation
cancel=Cancel
`)

const de = new FluentResource(`
startDate=Startdatum
endDate=Enddatum
submit=Urlaub beantragen
cancel=Abbrechen
`)

export const useTranslations = buildI18n({ en, de })
