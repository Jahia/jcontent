import React from 'react';
import {registry} from '@jahia/ui-extender';
import {useHistory} from 'react-router-dom';
import {PrimaryNavItem} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentApp from './JContentApp';
import Collections from '@jahia/moonstone/dist/icons/Collections';
import contentManagerRoutes from './JContent/JContent.routes';
import jContentActions from './JContent/JContent.actions';
import jContentAccordionItems from './JContent/JContentAccordionItems';

const ROUTE = '/jcontent';
const SYSTEM_SITE_ROUTE = `${ROUTE}/${window.contextJsParameters.siteKey}/${window.contextJsParameters.locale}/browse`;

const CmmNavItem = () => {
    const history = useHistory();
    const {t} = useTranslation('jcontent');
    return (
        <PrimaryNavItem key={ROUTE}
                        isSelected={history.location.pathname.startsWith(ROUTE) && history.location.pathname.split('/').length > 3}
                        label={t('label.name')}
                        icon={<Collections/>}
                        onClick={() => history.push(SYSTEM_SITE_ROUTE)}/>
    );
};

registry.add('topNavGroup', 'jcontentGroupItem', {
    targets: ['nav-root-top:2'],
    render: () => <CmmNavItem key="jcontentGroupItem"/>
});

// Make this async
registry.add('route', 'route-jcontent', {
    targets: ['nav-root-top:2'],
    path: `${ROUTE}/:siteKey/:lang/:mode`, // Catch everything that's jcontent and let the app resolve correct view
    defaultPath: SYSTEM_SITE_ROUTE,
    render: () => <JContentApp/>
});

contentManagerRoutes(registry);
jContentActions(registry);
jContentAccordionItems(registry);

console.debug('%c Content Media Manager is activated', 'color: #3c8cba');
