import React from 'react';
import {registry} from '@jahia/ui-extender';
import {addContextMenuTargetToActions} from '@jahia/jcontent';
import {CustomBar} from './CustomBar';
import i18next from 'i18next';
import {PickerDialog} from './PickerDialog';
import {PageHeader} from './PageHeader';

export default function () {
    i18next.loadNamespaces('accordion-config');

    registry.add('callback', 'accordion-config', {
        targets: ['jahiaApp-init:60'],
        callback: function () {
            const pageAccordion = registry.get('accordionItem', 'pages');
            registry.add('accordionItem', 'accordion-config', pageAccordion, {
                targets: ['jcontent:998'],
                label: 'test1',
                icon: window.jahia.moonstone.toIconComponent('<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6V5A2 2 0 0 0 17 3H15A2 2 0 0 0 13 5V6H11V5A2 2 0 0 0 9 3H7A2 2 0 0 0 5 5V6H3V20H21V6M19 18H5V8H19Z" /></svg>'),
                requireModuleInstalledOnSite: 'jcontent-test-module',
                isEnabled: function (siteKey) {
                    return siteKey !== 'systemsite';
                }
            });

            // Register a test accordion that exercises tableConfig features:
            // contextualMenu, header.showStatus, and columns
            const contextualMenu = 'tableConfigTestMenu';
            const menuTarget = 'tableConfigTestMenuActions';
            const menuActionWithRenderer = registry.get('action', 'menuAction');
            registry.add('action', contextualMenu, menuActionWithRenderer, {
                menuTarget,
                menuItemProps: {isShowIcons: true}
            });
            addContextMenuTargetToActions(menuTarget, ['edit', 'export']);

            const contentFoldersAccordion = registry.get('accordionItem', 'content-folders');
            registry.add('accordionItem', 'tableconfig-test', contentFoldersAccordion, {
                targets: ['jcontent:999'],
                label: 'tableconfig-test',
                isEnabled: siteKey => siteKey !== 'systemsite',
                tableConfig: {
                    ...contentFoldersAccordion.tableConfig,
                    contextualMenu,
                    header: {showStatus: false},
                    columns: ['publicationStatus', 'selection', 'name', 'type', 'lastModified', 'visibleActions']
                }
            });
        }
    });

    registry.add('pageBuilderBoxConfig', 'defaultValueTest', {
        Bar: CustomBar,
        isBarAlwaysDisplayed: true,
        borderColor: 'rgba(224, 24, 45)',
        targets: [{id: 'cent:defaultValueTest', priority: 0}]
    });

    registry.add('pageBuilderBoxConfig', 'withCustomBar', {
        Bar: CustomBar,
        isBarAlwaysDisplayed: true,
        borderColor: 'rgba(224, 24, 45)',
        targets: [{id: 'cemix:withCustomBar', priority: 0}]
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

    registry.add('pageHeader', 'customHeaderA', {
        Component: () => {
            return (<PageHeader value="This is a first simple page header"/>);
        },
        targets: ['pageBuilderHeader:1']
    });

    registry.add('pageHeader', 'customHeaderB', {
        Component: () => {
            return (<PageHeader value="This is a second simple page header"/>);
        },
        targets: ['pageBuilderHeader:2']
    });
}
