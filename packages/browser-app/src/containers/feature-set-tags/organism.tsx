import React from 'react';
import * as v from 'validation.ts'
import { Tags } from '@story-teller/shared'
import isForm from '../../is-form';
import { OrganismPropsType } from './types';
import { InputMultiSelect } from '../../components/input-multi-select';
import uuid from 'uuid';

const Organism = isForm<any, any>({
  schema: v.object({
    featureId: v.string,
    tags: v.array(Tags.aggregate)
  })
}, ({ feature, tags }: OrganismPropsType) => {

  return (
    <InputMultiSelect
      label="Tags"
      name="Tags"
      addNewOption={(label) => {
        const id = uuid()
        return ({
          key: id,
          label: label,
          value: id
        })
      }}
      options={tags.map((tag) => ({
        value: tag.id,
        label: tag.name,
        key: tag.id,
      }))}
    />
  )
})

export default Organism