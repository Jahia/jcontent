import React, {Suspense} from 'react';
import {registry} from '@jahia/registry';
import {useHistory} from 'react-router-dom';
import {PrimaryNavItem} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import ContentMediaManagerApp8 from './ContentManagerApp8';
import Collections from '@jahia/moonstone/dist/icons/Collections';

const ROUTE = '/cmm';

console.log('Register everything cmm');

const CmmNavItem = () => {
    const history = useHistory();
    const {t} = useTranslation('content-media-manager');
    return (
        <PrimaryNavItem key={ROUTE}
                        isSelected={history.location.pathname.endsWith(ROUTE)}
                        label={t('label.name')}
                        icon={<Collections/>}
                        onClick={() => history.push(ROUTE)}/>
    );
};

registry.add('cmmGroupItem', {
    type: 'topNavGroup',
    target: ['nav-root-top:2'],
    render: () => <CmmNavItem/>
});
// Make this async
registry.add('route-cmm', {
    type: 'route',
    target: ['nav-root-top:2'],
    path: '/cmm',
    defaultPath: '/cmm',
    render: () => <Suspense fallback="loading ..."><ContentMediaManagerApp8/></Suspense>
});
