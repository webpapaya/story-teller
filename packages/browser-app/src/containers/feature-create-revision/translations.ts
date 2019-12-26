import { FluentResource } from '@fluent/bundle'
import { buildI18n } from '../../utils/i18n'

const en = new FluentResource(`
title = Title
description = Description
reason = Reason
submit = Create new revision
`)

const de = new FluentResource(`
title = Titel
description = Beschreibung
reason = Grund
submit = Neue Version erstellen
`)

export const useTranslations = buildI18n({ en, de })
