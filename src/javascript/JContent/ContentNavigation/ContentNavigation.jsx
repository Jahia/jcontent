import React from 'react';
import PropTypes from 'prop-types';
import {Accordion, SecondaryNav} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {getRegistryTarget} from '../JContent.utils';

const ContentNavigation = ({accordionItems, accordionItemTarget, mode, siteKey, handleNavigation, header, isReversed}) => {
    const {t} = useTranslation('jcontent');
    return (
        <SecondaryNav defaultSize={{height: '100%', width: '245px'}}
                      header={header}
                      isReversed={isReversed}
        >
            <Accordion isReversed={isReversed}
                       openedItem={mode}
                       onSetOpenedItem={id => id && mode !== id && handleNavigation(id, accordionItems.find(item => id === item.key).getRootPath(siteKey))}
            >
                {accordionItems.filter(accordionItem => !accordionItem.isEnabled || accordionItem.isEnabled(siteKey)).map(accordionItem => {
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
