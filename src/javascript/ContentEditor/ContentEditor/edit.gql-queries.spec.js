import {print} from 'graphql';
import {EditFormQuery, EditFormSectionsFragment} from './edit.gql-queries';

// The section selection is duplicated by out-of-repo consumers (the content-versioning version-history
// panel), so it is extracted into EditFormSectionsFragment and spread into EditFormQuery. These tests
// guard the extraction: the fragment must stay a valid, spreadable GqlEditorForm selection, and
// EditFormQuery must keep selecting the exact same section → fieldSet → field shape it did inline.
describe('edit.gql-queries', () => {
    describe('EditFormSectionsFragment', () => {
        const printed = print(EditFormSectionsFragment);

        it('is a named fragment on GqlEditorForm', () => {
            expect(printed).toContain('fragment EditFormSections on GqlEditorForm');
        });

        it('selects the full section → fieldSet → field shape', () => {
            // Nesting markers — enough to catch an accidentally dropped level or attribute.
            for (const field of [
                'sections',
                'expanded',
                'fieldSets',
                'dynamic',
                'activated',
                'hasEnableSwitch',
                'readOnly',
                'fields',
                'errorMessage',
                'i18n',
                'requiredType',
                'selectorType',
                'declaringNodeType',
                'selectorOptions',
                'valueConstraints',
                'displayValueKey',
                'defaultValues'
            ]) {
                expect(printed).toContain(field);
            }
        });
    });

    describe('EditFormQuery', () => {
        const printed = print(EditFormQuery);

        it('spreads the sections fragment and bundles its definition', () => {
            expect(printed).toContain('...EditFormSections');
            expect(printed).toContain('fragment EditFormSections on GqlEditorForm');
        });

        it('keeps the top-level form fields selected directly', () => {
            for (const field of ['name', 'displayName', 'description', 'hasPreview', 'showAdvancedMode']) {
                expect(printed).toContain(field);
            }
        });

        it('still bundles the NodeData fragment', () => {
            expect(printed).toContain('...NodeData');
            expect(printed).toContain('fragment NodeData on JCRQuery');
        });
    });
});
