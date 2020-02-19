import React from 'react';
import {registry} from '@jahia/ui-extender';
import {useHistory} from 'react-router-dom';
import {PrimaryNavItem} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentApp from './JContentApp';
import Collections from '@jahia/moonstone/dist/icons/Collections';
import {jContentRoutes} from './JContent/JContent.routes';
import {jContentActions} from './JContent/JContent.actions';
import {jContentAccordionItems} from './JContent/JContent.accordion-items';
import {jContentAppRoot} from './JContent/JContent.app-root';
import {jContentRedux} from './JContent/JContent.redux';
import {fileuploadRedux} from './JContent/ContentRoute/ContentLayout/Upload/Upload.redux';
import {previewRedux} from './JContent/preview.redux';
import {copypasteRedux} from './JContent/actions/copyPaste/copyPaste.redux';
import {filesGridRedux} from './JContent/ContentRoute/ContentLayout/FilesGrid/FilesGrid.redux';
import {paginationRedux} from './JContent/ContentRoute/ContentLayout/pagination.redux';
import {sortRedux} from './JContent/ContentRoute/ContentLayout/sort.redux';
import {contentSelectionRedux} from './JContent/ContentRoute/ContentLayout/contentSelection.redux';
import JContentConstants from './JContent/JContent.constants';

const ROUTE = '/jcontent';
const SYSTEM_SITE_ROUTE = `${ROUTE}/${window.contextJsParameters.siteKey}/${window.contextJsParameters.locale}/${JContentConstants.mode.PAGES}`;

const CmmNavItem = () => {
    const history = useHistory();
    const {t} = useTranslation('jcontent');
    return (
        <PrimaryNavItem key={ROUTE}
                        isSelected={history.location.pathname.startsWith(ROUTE) && history.location.pathname.split('/').length > 3}
                        label={t('label.name')}
                        icon={<Collections size="big"/>}
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

        jContentRoutes(registry);
        jContentActions(registry);

        fileuploadRedux(registry);
        previewRedux(registry);
        copypasteRedux(registry);
        filesGridRedux(registry);
        paginationRedux(registry);
        sortRedux(registry);
        contentSelectionRedux(registry);
        jContentAccordionItems(registry);
        jContentRedux(registry);
        jContentAppRoot(registry);
    }
});
console.debug('%c jContent is activated', 'color: #3c8cba');
