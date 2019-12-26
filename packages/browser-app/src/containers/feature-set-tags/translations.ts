import { FluentResource } from '@fluent/bundle'
import { buildI18n } from '../../utils/i18n'

const en = new FluentResource(`
tags = Tags
submit = Set Tags
nonExistingTag = "{$label}" does not exist and will be created
`)

const de = new FluentResource(`
tags = Tags
submit = Tags setzen
nonExistingTag = "{$label}" existiert noch nicht und wird beim speichern erstellt
`)

export const useTranslations = buildI18n({ en, de })
