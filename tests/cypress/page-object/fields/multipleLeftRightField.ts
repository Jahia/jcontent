import {Field} from './field';

export class MultipleLeftRightField extends Field {
    // Scrolled explicitly rather than relying on a preceding section being collapsed: this
    // field's existence in the DOM doesn't depend on that, only where it sits on the page, and a
    // collapse can itself be flaky (see ContentEditor.closeSection's own retry).
    addNewValue(newValue: string, force = false) {
        this.get().scrollIntoView();
        this.get().find('.moonstone-valueList_wrapper').first().contains(newValue).click({force});
        return this;
    }

    removeValue(newValue: string, force = false) {
        this.get().scrollIntoView();
        this.get().find('.moonstone-valueList_wrapper').last().contains(newValue).click({force});
        return this;
    }
}
