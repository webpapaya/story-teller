import React from 'react';
import { storiesOf } from '../../storybook';
import Diagram from '.';

storiesOf('Diagram', module)
  .add('default', () => (
    <Diagram
      reactions={[
        {useCaseFrom: 'useCase1', event: '' },
        {useCaseFrom: 'useCase2', event: '', useCaseTo: 'useCase1'},
        {useCaseFrom: 'useCase3', event: '', useCaseTo: 'useCase2'},
        {useCaseFrom: 'useCase4', event: '', useCaseTo: 'useCase2'},

        {useCaseFrom: 'useCase20', event: '' },
        {useCaseFrom: 'useCase21', event: '', useCaseTo: 'useCase20'},

        {useCaseFrom: 'useCase5', event: '' },
        {useCaseFrom: 'useCase6', event: '', useCaseTo: 'useCase5'},
        {useCaseFrom: 'useCase7', event: '', useCaseTo: 'useCase6'},
        {useCaseFrom: 'useCase8', event: '', useCaseTo: 'useCase6'},
        {useCaseFrom: 'useCase9', event: '', useCaseTo: 'useCase6'},
        {useCaseFrom: 'useCase9', event: '', useCaseTo: 'useCase6'},
        {useCaseFrom: 'useCase10', event: '', useCaseTo: 'useCase6'},
        {useCaseFrom: 'useCase11', event: '', useCaseTo: 'useCase6'},
      ]}
    />
  ))
