import React from 'react';
import {shallow} from 'enzyme';
import {Button} from '@jahia/moonstone';
import {ButtonRenderer, ButtonRendererNoLabel} from './getButtonRenderer';

describe('getButtonRenderer', () => {
    it('should name an icon-only button after its label', () => {
        const cmp = shallow(<ButtonRendererNoLabel actionKey="refresh" buttonLabel="label.refresh"/>);
        expect(cmp.find(Button).prop('label')).toBeNull();
        expect(cmp.find(Button).prop('aria-label')).toBe('translated_label.refresh');
    });

    it('should add no aria-label to a button that shows its label', () => {
        const cmp = shallow(<ButtonRenderer actionKey="refresh" buttonLabel="label.refresh"/>);
        expect(cmp.find(Button).prop('aria-label')).toBeUndefined();
    });
});
