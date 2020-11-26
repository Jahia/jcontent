import React from 'react';
import FileSize from './FileSize';
import {shallow} from '@jahia/test-framework';

describe('FileSize', () => {
    it('should show the size', () => {
        const mockNode = {
            children: {
                nodes: [
                    {
                        data: {
                            size: 100
                        }
                    }
                ]
            }
        };
        const wrapper = shallow(<FileSize node={mockNode}/>);
        expect(wrapper).toBeTruthy();
        const text = wrapper.text();
        expect(text).toContain('100');
    });

    it('should render an empty text', () => {
        const emptyNode = {
            children: {
                nodes: []
            }
        };
        const wrapper = shallow(<FileSize node={emptyNode}/>);
        const text = wrapper.text();
        expect(text).toBe('');
    });

    it('should render an empty text when node has 0 child', () => {
        const nodeWithEmptyChildren = {};
        const wrapper = shallow(<FileSize node={nodeWithEmptyChildren}/>);
        const text = wrapper.text();
        expect(text).toBe('');
    });

    it('should show the unit', () => {
        const mockNode = {
            children: {
                nodes: [
                    {
                        data: {
                            size: 1024
                        }
                    }
                ]
            }
        };
        const wrapper = shallow(<FileSize node={mockNode}/>);
        const text = wrapper.text();
        expect(text.toLowerCase()).toContain('kb');
    });
});
