import React from 'react';
import * as v from 'validation.ts'
import { Tags } from '@story-teller/shared'
import isForm from '../../is-form';
import { OrganismPropsType } from './types';
import { InputMultiSelect } from '../../components/input-multi-select';
import uuid from 'uuid';
import { Tag } from '../../domain/tags/types';
import { Button } from '../../components/button';
import { InputHidden } from '../../components/input-hidden';

const tagToOption = (tag: Tag, label?: string) => ({
  key: tag.id,
  search: tag.name,
  label: label || tag.name,
  value: tag
})

const Organism = isForm<any, OrganismPropsType>({
  schema: v.object({
    featureId: v.string,
    tags: v.array(Tags.aggregate)
  }),
  defaultValues: {
    tags: []
  }
}, ({ feature, tags, onValueChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <InputHidden
        defaultValue={feature.originalId}
        name="featureId"
        onChange={onValueChange}
      />
      <InputMultiSelect
        label="Tags"
        name="tags"
        selectedOptions={feature.tags.map((option) => tagToOption(option))}
        addNewOption={(label) => tagToOption({
          id: uuid(),
          name: label,
          color: '#001100'
        }, `"${label}" does not exist and will be created`)}
        onChange={onValueChange}
        options={tags.map((option) => tagToOption(option))}
      />
      <Button type="submit">Set Tags</Button>
    </form>
  )
})

export default Organism