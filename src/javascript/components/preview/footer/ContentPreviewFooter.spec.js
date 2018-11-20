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

  it('should render something when preview mode is live', () => {
    const cmp = shallow(<ContentPreviewFooter {...props}/>);
    expect(cmp.find('WithStyles(Grid)').exists()).toBe(true);
  })

  it('should render something when preview mode is edit', () => {
    props.previewMode = 'edit';
    const cmp = shallow(<ContentPreviewFooter {...props}/>);
    expect(cmp.find('WithStyles(Grid)').exists()).toBe(true);
  })

  it('should render nothing when preview mode is not edit nor live', () => {
    props.previewMode = 'toto';
    const cmp = shallow(<ContentPreviewFooter {...props}/>);
    expect(cmp.debug()).toBe('');
  })

  
});
