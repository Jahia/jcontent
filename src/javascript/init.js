import {registry} from '@jahia/ui-extender';
import register from './JContent.register';
import {register as ceRegister} from './ContentEditor/register';
import {MoreVert} from '@jahia/moonstone';
import {Constants} from './ContentEditor/SelectorTypes/Picker/Picker.constants';
import React from 'react';
import {assignActionAndMenuTargets} from './JContent.assignActionAndMenuTargets';

export default function () {
    registry.add('callback', 'jContent', {
        targets: ['jahiaApp-init:1'],
        callback: () => {
            register();
            ceRegister();
            assignActionAndMenuTargets();
        }
    });

    registry.add('callback', 'updateAccordionTargetsFromPickerConfigurations', {
        targets: ['jahiaApp-init:999'],
        callback: () => {
            const registeredPickerConfigurations = registry.find({type: Constants.pickerConfig});
            registeredPickerConfigurations.forEach(pickerConfig => {
                pickerConfig.accordions?.forEach((value, index) => {
                    const accordionItem = registry.get('accordionItem', value);
                    if (accordionItem.targets) {
                        accordionItem.targets.push({id: pickerConfig.key, priority: 50 + (index * 10)});
                    } else {
                        accordionItem.targets = [{id: pickerConfig.key, priority: 50 + (index * 10)}];
                    }
                });
            });
            // Update actions targets
            registry.add('action', 'contentPickerMenu', registry.get('action', 'menuAction'), {
                buttonIcon: <MoreVert/>,
                buttonLabel: 'jcontent:label.contentManager.contentPreview.moreOptions',
                menuTarget: 'contentItemPickerContextActions',
                menuItemProps: {
                    isShowIcons: true
                }
            });
        }
    });
}
