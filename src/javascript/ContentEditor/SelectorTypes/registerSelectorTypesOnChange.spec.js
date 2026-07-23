import {registerSelectorTypesOnChange} from './registerSelectorTypesOnChange';
import {getFields} from '~/ContentEditor/utils/fields.utils';

describe('dependentProperties onChange', () => {
    const pageConstraints = [
        {value: {string: 'jnt:page'}, displayValue: 'jnt:page'},
        {value: {string: 'jmix:mainResource'}, displayValue: 'jmix:mainResource'}
    ];
    const staleConstraints = [{value: {string: 'stale'}, displayValue: 'stale'}];

    let handler;
    let sections;
    let linkTypeField;
    let onChangeContext;

    const deferred = () => {
        let resolve;
        const promise = new Promise(r => {
            resolve = r;
        });
        return {promise, resolve};
    };

    const flush = () => new Promise(resolve => {
        setTimeout(resolve, 0);
    });

    const getLinknodeConstraints = () => getFields(sections).find(f => f.name === 'nt_linknode').valueConstraints;

    beforeEach(() => {
        registerSelectorTypesOnChange({
            add: (type, key, definition) => {
                if (key === 'dependentProperties') {
                    handler = definition;
                }
            }
        });

        linkTypeField = {
            name: 'nt_linkType',
            propertyName: 'j:linkType',
            nodeType: 'nt:test',
            selectorOptions: [],
            valueConstraints: []
        };
        sections = [{
            name: 'content',
            fieldSets: [{
                name: 'nt:test',
                fields: [
                    linkTypeField,
                    {
                        name: 'nt_linknode',
                        propertyName: 'j:linknode',
                        nodeType: 'nt:test',
                        selectorOptions: [{name: 'dependentProperties', value: 'j:linkType'}],
                        valueConstraints: []
                    }
                ]
            }]
        }];
        onChangeContext = {
            sections,
            formik: {values: {}},
            onSectionsUpdate: jest.fn(),
            mode: 'create',
            nodeTypeName: 'nt:test',
            nodeData: {uuid: 'parent-uuid'},
            lang: 'en',
            uilang: 'en',
            client: {query: jest.fn()}
        };
    });

    it('should update the dependent field constraints from the query result', async () => {
        onChangeContext.client.query.mockResolvedValue({data: {forms: {fieldConstraints: pageConstraints}}});

        handler.onChange(undefined, 'internal', linkTypeField, onChangeContext);
        await flush();

        expect(getLinknodeConstraints()).toEqual(pageConstraints);
        expect(onChangeContext.onSectionsUpdate).toHaveBeenCalledTimes(1);
    });

    it('should ignore a stale response resolving after a newer one', async () => {
        const first = deferred();
        const second = deferred();
        onChangeContext.client.query
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);

        handler.onChange(undefined, 'none', linkTypeField, onChangeContext);
        handler.onChange('none', 'internal', linkTypeField, onChangeContext);

        // The newer request resolves first...
        second.resolve({data: {forms: {fieldConstraints: pageConstraints}}});
        await flush();
        expect(getLinknodeConstraints()).toEqual(pageConstraints);

        // ...then the older one; its result must not overwrite the newer constraints
        first.resolve({data: {forms: {fieldConstraints: staleConstraints}}});
        await flush();
        expect(getLinknodeConstraints()).toEqual(pageConstraints);
        expect(onChangeContext.onSectionsUpdate).toHaveBeenCalledTimes(1);
    });
});
