import React from 'react';
import {registry} from '@jahia/ui-extender';
import {useHistory} from 'react-router-dom';
import {PrimaryNavItem} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentApp from './JContentApp';
import Collections from '@jahia/moonstone/dist/icons/Collections';
import contentManagerRoutes from './JContent/JContent.routes';
import jContentActions from './JContent/JContent.actions';
import jContentAccordionItems from './JContent/JContent.accordion-items';
import {jContentAppRoot} from './JContent/JContent.app-root';
import {jContentReduxReducers} from './JContent/JContent.redux';
import {fileuploadReduxReducers} from './JContent/ContentRoute/ContentLayout/Upload/Upload.redux';
import {previewReduxReducers} from './JContent/preview.redux';
import {copypasteReduxReducers} from './JContent/actions/copyPaste/copyPaste.redux';
import {filesGridReduxReducers} from './JContent/ContentRoute/ContentLayout/FilesGrid/FilesGrid.redux';
import {paginationReduxReducers} from './JContent/ContentRoute/ContentLayout/pagination.redux';
import {sortReduxReducers} from './JContent/ContentRoute/ContentLayout/sort.redux';
import {contentSelectionReduxReducers} from './JContent/ContentRoute/ContentLayout/contentSelection.redux';

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

registry.add('callback', 'jContent', {
    targets: ['jahiaApp-init:1'],
    callback: () => {
        registry.add('topNavGroup', 'jcontentGroupItem', {
            targets: ['nav-root-top:2'],
            render: () => <CmmNavItem key="jcontentGroupItem"/>
        });
        registry.add('route', 'route-jcontent', {
            targets: ['nav-root-top:2'],
            path: `${ROUTE}/:siteKey/:lang/:mode`, // Catch everything that's jcontent and let the app resolve correct view
            defaultPath: SYSTEM_SITE_ROUTE,
            render: () => <JContentApp/>
        });

        contentManagerRoutes(registry);
        jContentActions(registry);

        jContentReduxReducers(registry);
        fileuploadReduxReducers(registry);
        previewReduxReducers(registry);
        copypasteReduxReducers(registry);
        filesGridReduxReducers(registry);
        paginationReduxReducers(registry);
        sortReduxReducers(registry);
        contentSelectionReduxReducers(registry);

        jContentAccordionItems(registry);
        jContentAppRoot(registry);
    }
});
console.debug('%c jContent is activated', 'color: #3c8cba');
