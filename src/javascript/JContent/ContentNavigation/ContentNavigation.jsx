import React from 'react';
import PropTypes from 'prop-types';
import {Accordion, SecondaryNav} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';

const ContentNavigation = ({accordionItems, mode, siteKey, handleNavigation, header}) => {
    const {t} = useTranslation();
    return (
        <SecondaryNav header={header}>
            <Accordion isReversed
                       openedItem={mode}
                       onSetOpenedItem={id => id && mode !== id && handleNavigation(id, accordionItems.find(item => id === item.key).defaultPath(siteKey))}
            >
                {accordionItems.filter(accordionItem => !accordionItem.isEnabled || accordionItem.isEnabled(siteKey)).map(accordionItem => {
                    let props = {
                        id: accordionItem.key,
                        label: t(accordionItem.label),
                        icon: accordionItem.icon
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
    handleNavigation: PropTypes.func.isRequired,
    header: PropTypes.element.isRequired
};

export default ContentNavigation;
