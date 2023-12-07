import {Field} from "./field";
import {Button, getComponentByRole, getComponentBySelector} from "@jahia/cypress";
import {Menu} from "@jahia/cypress";
/**
 * Applies to radio choice list and checkbox choice list selector types
 * Not for choice list dropdowns
 */
export class ToggleChoiceList extends Field {

    labelSel = 'label';
    inputSel = 'input';

    assertVisible(label: string) {
        return this.get().scrollIntoView()
            .contains(this.labelSel, label).should('be.visible');
    }

    assertSelected(label: string) {
        return this.assertVisible(label)
            .find(this.inputSel).should('have.attr', 'checked');
    }

    assertNotSelected(label: string) {
        return this.assertVisible(label)
            .find(this.inputSel).should('not.have.attr', 'checked');
    }

    select(label: string) {
        this.assertVisible(label)
            .find(this.inputSel).should('be.visible').click();
    }
}

export class RadioChoiceList extends ToggleChoiceList {

    labelSel = 'label.moonstone-radio-container';
    inputSel = 'input.moonstone-radio_input';
}

export class CheckboxChoiceList extends ToggleChoiceList {

    labelSel = 'label.moonstone-checkboxItem';
    inputSel = 'input.moonstone-checkbox_input';

    contextMenu() {
        getComponentByRole(Button,'content-editor/field/Choicelist', this).click();
        return getComponentBySelector(Menu, `#menuHolder ${Menu.defaultSelector}`);
    }
}
