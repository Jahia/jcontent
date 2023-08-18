import React from 'react';
import PropTypes from 'prop-types';
import {Accordion, SecondaryNav} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {getRegistryTarget} from '../JContent.utils';

const ContentNavigation = ({accordionItems, accordionItemTarget, mode, siteKey, handleNavigation, header, isReversed}) => {
    const {t} = useTranslation('jcontent');

    const onSetOpenedItem = newMode => {
        if (newMode && mode !== newMode) {
            const accordion = accordionItems.find(item => newMode === item.key);

            const path = localStorage.getItem('jcontent-previous-location-' + siteKey + '-' + newMode) || accordion.getRootPath(siteKey);
            const viewMode = localStorage.getItem('jcontent-previous-tableView-viewMode-' + siteKey + '-' + newMode) || accordion?.tableConfig?.defaultViewMode || 'flatList';

            handleNavigation(newMode, path, viewMode);
        }
    };

    // If existing mode (excluding search) is not enabled, default to the first available accordion
    const enabledAccordionItems = accordionItems.filter(accordionItem => !accordionItem.isEnabled || accordionItem.isEnabled(siteKey));
    const modeEnabled = enabledAccordionItems.some(item => mode === item.key);
    if (!modeEnabled && !mode.includes('search') && enabledAccordionItems.length > 0) {
        onSetOpenedItem(enabledAccordionItems[0].key);
    }

    return (
        <SecondaryNav defaultSize={{height: '100%', width: '245px'}}
                      header={header}
                      isReversed={isReversed}
        >
            <Accordion isReversed={isReversed}
                       openedItem={mode}
                       onSetOpenedItem={onSetOpenedItem}
            >
                {enabledAccordionItems.map(accordionItem => {
                    let props = {
                        id: accordionItem.key,
                        label: t(accordionItem.label),
                        icon: accordionItem.icon,
                        'data-registry-key': accordionItem.type + ':' + accordionItem.key,
                        'data-registry-target': getRegistryTarget(accordionItem, accordionItemTarget)
                    };
                    return accordionItem.component ? <accordionItem.component key={accordionItem.key} {...props}/> : accordionItem.render(props, accordionItem);
                })}
            </Accordion>
        </SecondaryNav>
    );
};

ContentNavigation.propTypes = {
    mode: PropTypes.string,
    siteKey: PropTypes.string.isRequired,
    accordionItems: PropTypes.array.isRequired,
    accordionItemTarget: PropTypes.string,
    handleNavigation: PropTypes.func.isRequired,
    header: PropTypes.element.isRequired,
    isReversed: PropTypes.bool
};

export default ContentNavigation;
