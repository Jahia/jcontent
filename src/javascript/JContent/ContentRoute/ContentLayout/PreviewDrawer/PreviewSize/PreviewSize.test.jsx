import React from 'react';
import PreviewSize from './PreviewSize';
import {shallow} from '@jahia/test-framework';

describe('PreviewSize', () => {
    it('should show dimension and size', () => {
        const mockNode = getMockNode();
        const wrapper = shallow(<PreviewSize node={mockNode}/>);
        expect(wrapper.text()).toContain('100');
        expect(wrapper.text()).toContain('30 x 20');
    });

    it('should render empty text with no width', () => {
        let mockNode = getMockNode();
        mockNode.width = null;
        const wrapper = shallow(<PreviewSize node={mockNode}/>);
        expect(wrapper.text()).toBe('');
    });

    it('should render empty text with no height', () => {
        let mockNode = getMockNode();
        mockNode.height = null;
        const wrapper = shallow(<PreviewSize node={mockNode}/>);
        expect(wrapper.text()).toBe('');
    });

    it('should render empty text with no node', () => {
        let mockNode = {};
        const wrapper = shallow(<PreviewSize node={mockNode}/>);
        expect(wrapper.text()).toBe('');
    });

    it('should show the unit', () => {
        let mockNode = getMockNode();
        mockNode.children.nodes[0].data.size = 36585;
        const wrapper = shallow(<PreviewSize node={mockNode}/>);
        expect(wrapper.text()).toContain('35.73 KB');
    });
});

function getMockNode() {
    return {
        width: {value: 30},
        height: {value: 20},
        children: {
            nodes: [
                {data: {size: 100}}
            ]
        }
    };
}
