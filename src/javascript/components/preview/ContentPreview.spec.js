import React from 'react';
import ContentPreview from './ContentPreview';
import { shallowWithStore } from 'enzyme-redux';
import { createMockStore } from 'redux-test-utils';

describe('Content preview', () => {
  let props;
  let store;

  beforeEach(() => {
    props = {
      layoutQuery: {},
      layoutQueryParams: {}
    };
    store = {
      selection: [],
      previewMode: 'pdf',
      previewModes: [],
      language: 'fr'
    };
  });

  it('should no trhow an error', () => {
    const cmp = shallowWithStore(<ContentPreview {...props}/>, createMockStore(store)).dive().dive().dive();
    expect(cmp).toBeTruthy();
  });
});
