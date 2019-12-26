import React from 'react';
import { Tags, v } from '@story-teller/shared'
import isForm from '../../is-form';
import { OrganismPropsType } from './types';
import { InputMultiSelect } from '../../components/input-multi-select';
import uuid from 'uuid';
import { Tag } from '../../domain/tags/types';
import { Button } from '../../components/button';
import { InputHidden } from '../../components/input-hidden';
import { useTranslations } from './translations';

const tagToOption = (tag: Tag, label?: string) => ({
  key: tag.id,
  search: tag.name,
  label: label || tag.name,
  value: tag
})

const Organism = isForm<any, OrganismPropsType>({
  schema: v.record({
    featureId: v.string,
    tags: v.array(Tags.aggregate)
  }),
  defaultValues: {
    tags: []
  }
}, ({ feature, tags, fields, onSubmit }) => {
  const {t} = useTranslations()
  return (
    <form onSubmit={onSubmit}>
      <InputHidden
        defaultValue={feature.originalId}
        name="featureId"
        {...fields.featureId}
      />
      <InputMultiSelect
        label={t('tags')}
        name="tags"
        selectedOptions={feature.tags.map((option) => tagToOption(option))}
        addNewOption={(label) => tagToOption({
          id: uuid(),
          name: label,
          color: '#001100'
        }, t('nonExistingTag', { label }))}
        {...fields.tags}
        options={tags.map((option) => tagToOption(option))}
      />
      <Button type="submit">{t('submit')}</Button>
    </form>
  )
})

export default Organism