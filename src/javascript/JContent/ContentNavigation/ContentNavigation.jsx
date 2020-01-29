import React from 'react';
import {Accordion, AccordionItem} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {registry} from '@jahia/ui-extender';

const ContentNavigation = () => {
    const {t} = useTranslation('jcontent');
    let items = registry.find({type: 'accordionItem', target: 'jcontent'});
    return (
        <Accordion isReversed>
            {items.map(item =>
                <AccordionItem key={item.key} id={item.key} label={t(item.label)} icon={item.icon}/>
            )}
        </Accordion>
    );
};

export default ContentNavigation;
