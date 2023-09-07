import {Field} from './field';

export class MultipleLeftRightField extends Field {
    addNewValue(newValue: string, force = false) {
        this.get().find('.moonstone-listHolder').first().contains(newValue).click();
        return this;
    }

    removeValue(newValue: string, force = false) {
        this.get().find('.moonstone-listHolder').last().contains(newValue).click();
        return this;
    }
}
