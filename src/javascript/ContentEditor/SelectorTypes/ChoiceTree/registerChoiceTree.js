import {ChoiceTree} from './ChoiceTree';

export const registerChoiceTree = ceRegistry => {
    ceRegistry.add('selectorType', 'ChoiceTree', {
        dataType: ['String'],
        labelKey: 'jcontent:label.contentEditor.selectorTypes.choiceTree.displayValue',
        properties: [
            {name: 'description', value: 'jcontent:label.contentEditor.selectorTypes.choiceTree.description'},
            {name: 'iconStart', value: 'ViewTree'}
        ],
        cmp: ChoiceTree,
        supportMultiple: true
    });
};
