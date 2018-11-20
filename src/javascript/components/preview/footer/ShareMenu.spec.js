import React from 'react';
import ShareMenu from './ShareMenu';
import { shallowWithStore } from 'enzyme-redux';
import { createMockStore } from 'redux-test-utils';

describe('ShareMenu', () => {
  let props;
  let store;

  beforeEach(() => {
    props = {};
    store = {
      selection: [{}]
    };
  });

  it('should no trhow an error', () => {
    const cmp = shallowWithStore(<ShareMenu {...props}/>, createMockStore(store)).dive().dive().dive();
    expect(cmp).toBeTruthy();
  });

  it('should open the menu when clicking on the button', () => {
    const cmp = shallowWithStore(<ShareMenu {...props}/>, createMockStore(store)).dive().dive().dive();

    expect(cmp.find('WithStyles(Menu)').props().open).toBe(false);

    cmp.find('WithStyles(Button)').simulate('click', {currentTarget: 'currentTarget'});
    cmp.update();

    expect(cmp.find('WithStyles(Menu)').props().open).toBe(true);
  })
});
