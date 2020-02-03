import React from 'react';
import PropTypes from 'prop-types';
import {Accordion, AccordionItem} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {registry} from '@jahia/ui-extender';

const ContentNavigation = ({mode, handleNavigation}) => {
    const {t} = useTranslation('jcontent');
    let items = registry.find({type: 'accordionItem', target: 'jcontent'});
    return (
        <Accordion isReversed openByDefault={mode}>
            {items.map(item => (
                <AccordionItem key={item.key} id={item.key} label={t(item.label)} icon={item.icon} onClickToOpen={() => handleNavigation(item.key, '')}>
                    {item.render()}
                </AccordionItem>
            ))}
        </Accordion>
    );
};

ContentNavigation.propTypes = {
    mode: PropTypes.string,
    handleNavigation: PropTypes.func.isRequired
};

export default ContentNavigation;
