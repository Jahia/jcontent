import React from 'react';

import {Image} from '@jahia/moonstone';

import {shallowWithTheme, mount} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {ReferenceCard} from './ReferenceCard';

describe('reference card empty', () => {
    let defaultProps;

    beforeEach(() => {
        defaultProps = {
            emptyLabel: 'totoprops',
            emptyIcon: <Image/>,
            onClick: jest.fn(),
            classes: {}
        };
    });

    it('should display the label', () => {
        const cmp = shallowWithTheme(
            <ReferenceCard {...defaultProps}/>,
            {},
            dsGenericTheme
        ).dive();

        expect(cmp.debug()).toContain(defaultProps.emptyLabel);
    });

    it('should not set trigger onClick when clicking on the button when isReadOnly', () => {
        const cmp = shallowWithTheme(
            <ReferenceCard {...defaultProps} isReadOnly/>,
            {},
            dsGenericTheme
        ).dive();

        cmp.find('button').simulate('click');

        expect(defaultProps.onClick).not.toHaveBeenCalled();
    });
});

describe('reference card filled', () => {
    let defaultProps;

    beforeEach(() => {
        defaultProps = {
            field: {},
            fieldData: {
                thumbnail: 'my-thumpnail-url',
                displayName: 'name part',
                type: 'type part',
                name: 'system name',
                info: 'info part'
            },
            id: 'yoloID'
        };

        window.contextJsParameters = {
            contextPath: ''
        };
    });

    it('should display the url from field data', () => {
        const cmp = mount(
            <ReferenceCard {...defaultProps}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('img').props().src).toBe(
            defaultProps.fieldData.thumbnail
        );
    });

    it('should display the name part from field data', () => {
        const cmp = shallowWithTheme(
            <ReferenceCard {...defaultProps}/>,
            {},
            dsGenericTheme
        ).dive();

        expect(cmp.debug()).toContain(defaultProps.fieldData.displayName);
    });

    it('should display the info part from field data', () => {
        const cmp = shallowWithTheme(
            <ReferenceCard {...defaultProps}/>,
            {},
            dsGenericTheme
        ).dive();
        expect(cmp.debug()).toContain(defaultProps.fieldData.info);
    });

    it('should display the system name part from field data', () => {
        const cmp = shallowWithTheme(
            <ReferenceCard {...defaultProps}/>,
            {},
            dsGenericTheme
        ).dive();
        expect(cmp.debug()).toContain(defaultProps.fieldData.name);
    });

    it('should display the type part from field data', () => {
        const cmp = shallowWithTheme(
            <ReferenceCard {...defaultProps}/>,
            {},
            dsGenericTheme
        ).dive();
        expect(cmp.debug()).toContain(defaultProps.fieldData.type);
    });

    it('should be in read only', () => {
        defaultProps.isReadOnly = true;
        const cmp = shallowWithTheme(
            <ReferenceCard {...defaultProps}/>,
            {},
            dsGenericTheme
        ).dive();
        expect(cmp.find('#yoloID').prop('disabled')).toBe(true);
    });

    it('should NOT be in read only', () => {
        const cmp = shallowWithTheme(
            <ReferenceCard {...defaultProps}/>,
            {},
            dsGenericTheme
        ).dive();
        expect(cmp.find('#yoloID').prop('disabled')).toBe(false);
    });

    it('should send onClick event when clicking on the component', () => {
        defaultProps.onClick = jest.fn();
        const cmp = shallowWithTheme(
            <ReferenceCard {...defaultProps}/>,
            {},
            dsGenericTheme
        ).dive();

        const mockEvent = {currentTarget: {blur: () => {}}};
        cmp.find('#yoloID').simulate('click', mockEvent);

        expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it('should not send onClick event when clicking on isReadOnly component', () => {
        defaultProps.onClick = jest.fn();
        defaultProps.isReadOnly = true;
        const cmp = shallowWithTheme(
            <ReferenceCard {...defaultProps}/>,
            {},
            dsGenericTheme
        ).dive();

        cmp.find('#yoloID').simulate('click');

        expect(defaultProps.onClick).not.toHaveBeenCalled();
    });
});
