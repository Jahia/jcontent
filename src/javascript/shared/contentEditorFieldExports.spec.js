import {FieldContainer} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Field/Field.container';
import {filterFieldSets} from '~/ContentEditor/editorTabs/EditPanelContent/FormBuilder/Sections/filterFieldSets';
import {resolveSelectorType} from '~/ContentEditor/SelectorTypes/resolveSelectorType';

/**
 * The symbols `shared/index.js` re-exports so a module can render a Content Editor field itself.
 *
 * These are a public API: `shared/index.js` is what `@jahia/jcontent` resolves to over module
 * federation. A module building a per-language editing screen mounts `FieldContainer` once per
 * language, so a rich text field stays rich text and a date stays a date picker instead of
 * degrading to a plain input.
 *
 * Worth a test for the same reason the side panel exports are: nothing inside jContent imports
 * through that barrel, so moving or renaming any of these still builds here, and the consumer only
 * finds out at RUNTIME, in another repository, as `undefined`.
 *
 * Imports the same modules by the same paths rather than reading the barrel, which pulls in
 * ContentTree, @jahia/icons and material-ui for no gain here - see `sidePanelExports.spec.js` for
 * the measurement behind that choice.
 */
describe('the content editor field exports', () => {
    it('exposes the field renderer', () => {
        // Not a function: FieldContainer is wrapped in React.memo, so React hands back an exotic
        // object. Asserted as defined rather than by its `$$typeof`, which is React's own internal.
        expect(FieldContainer).toBeDefined();
    });

    it('exposes the fieldset filter the renderer is driven from', () => {
        // Which fieldsets a reader would actually see: hidden, empty and not-yet-activated ones
        // dropped. A consumer listing a section's fields has to agree with the editor about that,
        // or it offers fields the editor does not show.
        expect(typeof filterFieldSets).toBe('function');
    });

    it('exposes the selector type resolver', () => {
        // How a field's value is adapted into what its editor expects - the same answer the editor
        // itself uses, rather than a consumer's second guess at it.
        expect(typeof resolveSelectorType).toBe('function');
    });
});
