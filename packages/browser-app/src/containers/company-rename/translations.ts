import { FluentResource } from '@fluent/bundle'
import { buildI18n } from '../../utils/i18n'

const en = new FluentResource(`
-company=Company

heading=Create { -company }
name=Name
createCompany=Create { -company }
`)

const de = new FluentResource(`
-company=Firma

heading=Neue { -company } erstellen
name=Name
createCompany=Neue Firma erstellen
`)

export const useTranslations = buildI18n({ en, de })
