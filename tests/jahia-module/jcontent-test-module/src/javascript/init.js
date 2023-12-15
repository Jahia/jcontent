import {registry} from '@jahia/ui-extender';
import {CustomBar} from './CustomBar';
import i18next from 'i18next';
import {PickerDialog} from './PickerDialog';

export default function () {
    i18next.loadNamespaces('accordion-config');

    registry.add('callback', 'accordion-config', {
        targets: ['jahiaApp-init:60'],
        callback: function () {
            const pageAccordion = window.jahia.uiExtender.registry.get('accordionItem', 'pages');
            window.jahia.uiExtender.registry.add('accordionItem', 'accordion-config', pageAccordion, {
                targets: ['jcontent:998'],
                label: 'test1',
                icon: window.jahia.moonstone.toIconComponent('<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6V5A2 2 0 0 0 17 3H15A2 2 0 0 0 13 5V6H11V5A2 2 0 0 0 9 3H7A2 2 0 0 0 5 5V6H3V20H21V6M19 18H5V8H19Z" /></svg>'),
                requireModuleInstalledOnSite: 'jcontent-test-module',
                isEnabled: function (siteKey) {
                    return siteKey !== 'systemsite';
                }
            });
        }
    });

    registry.add('pageBuilderBoxConfig', 'defaultValueTest', {
        Bar: CustomBar,
        isBarAlwaysDisplayed: true,
        borderColors: {hover: 'rgba(224, 24, 45)', selected: 'var(--color-purple)'},
        targets: [{id: 'cent:defaultValueTest', priority: 0}]
    });

    registry.add('externalPickerConfiguration', 'test', {
        requireModuleInstalledOnSite: 'jcontent-test-module',
        pickerConfigs: ['file'],
        selectableTypes: ['rep:root'],
        keyUrlPath: 'zzzz',
        pickerInput: {
            emptyLabel: 'Nothing selected'
        },
        pickerDialog: {
            cmp: PickerDialog,
            label: 'Custom picker',
            description: 'Custom picker description'
        }
    });
}
