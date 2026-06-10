import {Field} from './field';

export class MultipleLeftRightField extends Field {
    addNewValue(newValue: string, force = false) {
        this.get().find('.moonstone-valueList_wrapper').first().contains(newValue).click({force});
        return this;
    }

    removeValue(newValue: string, force = false) {
        this.get().find('li[role="right-list"]').contains(newValue).closest('li').find('.moonstone-listItem_iconEnd').click({force});
        return this;
    }
}
