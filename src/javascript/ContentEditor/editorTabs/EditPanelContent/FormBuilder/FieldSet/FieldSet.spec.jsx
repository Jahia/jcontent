import React from 'react';
import {shallowWithTheme} from '@jahia/test-framework';
import {dsGenericTheme} from '@jahia/design-system-kit';
import {FieldSet} from './FieldSet';
import {useFormikContext} from 'formik';

jest.mock('formik');

describe('FieldSet component', () => {
    let props;
    let formikContext;
    beforeEach(() => {
        props = {
            fieldset: {
                displayName: 'FieldSet1',
                dynamic: false,
                readOnly: false,
                visible: true,
                fields: [
                    {displayName: 'field1', name: 'field1', visible: true},
                    {displayName: 'field2', name: 'field2', visible: true}
                ]
            }
        };
        formikContext = {
            values: {}
        };
        useFormikContext.mockReturnValue(formikContext);
    });

    it('should display FieldSet name', () => {
        const cmp = shallowWithTheme(
            <FieldSet {...props}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.debug()).toContain(props.fieldset.displayName);
    });

    it('should display Field for each field in the FieldSet', () => {
        const cmp = shallowWithTheme(
            <FieldSet {...props}/>,
            {},
            dsGenericTheme
        );

        props.fieldset.fields.forEach(field => {
            expect(cmp.find({field}).exists()).toBe(true);
        });
    });

    it('should display not readOnly toggle for dynamic FieldSet when editor is not locked', () => {
        props.fieldset.dynamic = true;
        props.fieldset.hasEnableSwitch = true;

        const cmp = shallowWithTheme(
            <FieldSet {...props}/>,
            {},
            dsGenericTheme
        );

        const toggleCmp = cmp.find('WithStyles(ToggleCmp)');
        expect(toggleCmp.exists()).toBe(true);
        expect(toggleCmp.props().readOnly).toBe(false);
    });

    it('should display readOnly toggle for dynamic FieldSet when editor is locked', () => {
        props.fieldset.dynamic = true;
        props.fieldset.readOnly = true;
        props.fieldset.hasEnableSwitch = true;

        const cmp = shallowWithTheme(
            <FieldSet {...props}/>,
            {},
            dsGenericTheme
        );

        const toggleCmp = cmp.find('WithStyles(ToggleCmp)');
        expect(toggleCmp.exists()).toBe(true);
        expect(toggleCmp.props().readOnly).toBe(true);
    });

    it('should not display toggle for non dynamic FieldSet', () => {
        props.fieldset.dynamic = false;

        const cmp = shallowWithTheme(
            <FieldSet {...props}/>,
            {},
            dsGenericTheme
        );

        expect(cmp.find('WithStyles(ToggleCmp)').exists()).toBe(false);
    });

    describe('a sparse field set such as jmix:exif', () => {
        const toggle = cmp => cmp.find('[data-sel-role="fieldset-show-empty-jmix:exif"]');

        beforeEach(() => {
            props.fieldset = {
                name: 'jmix:exif',
                displayName: 'Available EXIF data',
                dynamic: false,
                readOnly: false,
                visible: true,
                fields: [
                    {displayName: 'Make', name: 'j:make', visible: true},
                    {displayName: 'Model', name: 'j:model', visible: true},
                    {displayName: 'Flash', name: 'j:flash', visible: true}
                ]
            };
            formikContext.values = {'j:make': 'Canon', 'j:model': '', 'j:flash': undefined};
        });

        const build = () => shallowWithTheme(<FieldSet {...props}/>, {}, dsGenericTheme);

        it('shows only the fields that hold a value', () => {
            const fields = build().find('FieldContainer');

            expect(fields.length).toBe(1);
            expect(fields.at(0).props().field.name).toBe('j:make');
        });

        it('reveals every field once the button is clicked', () => {
            const cmp = build();

            toggle(cmp).simulate('click');
            cmp.update();

            expect(cmp.find('FieldContainer').length).toBe(3);
        });

        it('goes back to only the filled fields when clicked again', () => {
            const cmp = build();

            toggle(cmp).simulate('click');
            cmp.update();
            toggle(cmp).simulate('click');
            cmp.update();

            expect(cmp.find('FieldContainer').length).toBe(1);
        });

        it('counts a multiple field as filled only when an entry is not empty', () => {
            props.fieldset.fields = [
                {displayName: 'Empty list', name: 'j:emptyList', visible: true},
                {displayName: 'Filled list', name: 'j:filledList', visible: true}
            ];
            formikContext.values = {'j:emptyList': ['', ''], 'j:filledList': ['', 'something']};

            const fields = build().find('FieldContainer');

            expect(fields.length).toBe(1);
            expect(fields.at(0).props().field.name).toBe('j:filledList');
        });

        it('treats the IPTC field set the same way', () => {
            props.fieldset.name = 'jmix:iptc';
            const cmp = shallowWithTheme(<FieldSet {...props}/>, {}, dsGenericTheme);

            expect(cmp.find('FieldContainer').length).toBe(1);
            expect(cmp.find('[data-sel-role="fieldset-show-empty-jmix:iptc"]').exists()).toBe(true);
        });

        it('leaves other field sets showing every field', () => {
            props.fieldset.name = 'jmix:somethingElse';
            const cmp = build();

            expect(cmp.find('FieldContainer').length).toBe(3);
            expect(toggle(cmp).exists()).toBe(false);
        });
    });
});
