import React from 'react';
import ContentPreviewFooter from './ContentPreviewFooter';
import { shallow } from 'enzyme';

describe('Content preview footer', () => {
  let props;

  beforeEach(() => {
    props = {
      previewMode: 'live',
      selection: [{
        displayName: 'display name'
      }],
      imageControlElementId: 'imageControlElementId',

      t: jest.fn(),
      handleFullScreen: jest.fn(),
      ellipsisText: jest.fn(),
      screenModeButtons: jest.fn(),
      downloadButton: jest.fn()
    };
  });

  it('should no trhow an error', () => {
    const cmp = shallow(<ContentPreviewFooter {...props}/>);
    expect(cmp).toBeTruthy();
  });
});
