import {print} from 'graphql';
import {EditFormQuery, EditFormSectionsFragment} from './edit.gql-queries';

// Return the selectionSet.selections of the named field reached by walking `path` from the
// operation's root selection set (e.g. ['forms', 'editForm']). Lets tests assert what is selected
// *directly* on a field, rather than substring-matching the whole printed document — the latter can
// not tell a top-level `name` from a `name` nested inside a spread fragment.
const selectionsAt = (document, path) => {
    const operation = document.definitions.find(def => def.kind === 'OperationDefinition');
    let selectionSet = operation.selectionSet;
    for (const name of path) {
        const field = selectionSet.selections.find(sel => sel.kind === 'Field' && sel.name.value === name);
        selectionSet = field.selectionSet;
    }

    return selectionSet.selections;
};

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

        it('keeps the top-level form fields selected directly on editForm', () => {
            // Assert against the editForm selection set specifically — name/displayName/description
            // also live inside the spread fragment, so a substring match on the printed query would
            // still pass if they were dropped from the top level. Direct Field selections would not.
            const directFields = selectionsAt(EditFormQuery, ['forms', 'editForm'])
                .filter(sel => sel.kind === 'Field')
                .map(sel => sel.name.value);
            for (const field of ['name', 'displayName', 'description', 'hasPreview', 'showAdvancedMode']) {
                expect(directFields).toContain(field);
            }
        });

        it('spreads EditFormSections directly on editForm', () => {
            const spreads = selectionsAt(EditFormQuery, ['forms', 'editForm'])
                .filter(sel => sel.kind === 'FragmentSpread')
                .map(sel => sel.name.value);
            expect(spreads).toContain('EditFormSections');
        });

        it('still bundles the NodeData fragment', () => {
            expect(printed).toContain('...NodeData');
            expect(printed).toContain('fragment NodeData on JCRQuery');
        });
    });
});
