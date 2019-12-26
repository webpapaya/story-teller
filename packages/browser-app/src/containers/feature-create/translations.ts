import { FluentResource } from '@fluent/bundle'
import { buildI18n } from '../../utils/i18n'

const en = new FluentResource(`
title = Title
description = Description
submit = Create feature
`)

const de = new FluentResource(`
title = Titel
description = Beschreibung
submit = Neues Funktionalität erstellen
`)

export const useTranslations = buildI18n({ en, de })
