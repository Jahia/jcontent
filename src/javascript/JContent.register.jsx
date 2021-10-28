import React from 'react';
import {registry} from '@jahia/ui-extender';
import {useHistory} from 'react-router-dom';
import {Collections, PrimaryNavItem} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentApp from './JContentApp';
import {jContentRoutes} from './JContent/JContent.routes';
import {jContentActions} from './JContent/JContent.actions';
import {jContentAccordionItems} from './JContent/JContent.accordion-items';
import {jContentAppRoot} from './JContent/JContent.app-root';
import {buildUrl, jContentRedux} from './JContent/JContent.redux';
import {fileuploadRedux} from './JContent/ContentRoute/ContentLayout/Upload/Upload.redux';
import {previewRedux} from './JContent/preview.redux';
import {copypasteRedux} from './JContent/actions/copyPaste/copyPaste.redux';
import {filesGridRedux} from './JContent/ContentRoute/ContentLayout/FilesGrid/FilesGrid.redux';
import {paginationRedux} from './JContent/ContentRoute/ContentLayout/pagination.redux';
import {sortRedux} from './JContent/ContentRoute/ContentLayout/sort.redux';
import {contentSelectionRedux} from './JContent/ContentRoute/ContentLayout/contentSelection.redux';
import {pagesModeRedux} from './JContent/ContentRoute/ToolBar/PagesModeSelector/PagesModeSelector.redux';
import JContentConstants from './JContent/JContent.constants';
import {useDispatch, useSelector} from 'react-redux';
import {useApolloClient} from 'react-apollo';
import {initClipboardWatcher} from './JContent/actions/copyPaste/localStorageHandler';
import {useNodeChecks} from '@jahia/data-helper';
import {structuredViewRedux} from './JContent/ContentRoute/ContentLayout/StructuredView/StructuredView.redux';

export default function () {
    const CmmNavItem = () => {
        const history = useHistory();
        const {t} = useTranslation('jcontent');
        const client = useApolloClient();
        const dispatch = useDispatch();
        const {site, language, path, mode, params} = useSelector(state => ({
            language: state.language,
            site: state.site,
            path: state.jcontent.path,
            mode: state.jcontent.mode,
            params: state.jcontent.params
        }));

        const permissions = useNodeChecks({
            path: `/sites/${site}`,
            language: language
        }, {
            requiredSitePermission: [JContentConstants.accordionPermissions.pagesAccordionAccess, JContentConstants.accordionPermissions.contentFolderAccordionAccess, JContentConstants.accordionPermissions.mediaAccordionAccess, JContentConstants.accordionPermissions.additionalAccordionAccess, JContentConstants.accordionPermissions.formAccordionAccess]
        });

        if (permissions.loading) {
            return null;
        }

        let defaultMode = '';

        if (permissions.node?.site.pagesAccordionAccess) {
            defaultMode = JContentConstants.mode.PAGES;
        } else if (permissions.node?.site.contentFolderAccordionAccess) {
            defaultMode = JContentConstants.mode.CONTENT_FOLDERS;
        } else if (permissions.node?.site.mediaAccordionAccess) {
            defaultMode = JContentConstants.mode.MEDIA;
        } else if (permissions.node?.site.formAccordionAccess) {
            defaultMode = JContentConstants.mode.FORMS;
        } else if (permissions.node?.site.additionalAccordionAccess) {
            defaultMode = JContentConstants.mode.APPS;
        }

        return (
            <PrimaryNavItem key="/jcontent"
                            role="jcontent-menu-item"
                            isSelected={history.location.pathname.startsWith('/jcontent') && history.location.pathname.split('/').length > 3}
                            label={t('label.name')}
                            icon={<Collections/>}
                            onClick={() => {
                                history.push(buildUrl({site, language, mode: mode || defaultMode, path, params}));
                                initClipboardWatcher(dispatch, client);
                            }}/>
        );
    };

    registry.add('primary-nav-item', 'jcontentGroupItem', {
        targets: ['nav-root-top:2'],
        requiredPermission: 'jContentAccess',
        render: () => <CmmNavItem/>
    });

    registry.add('route', 'route-jcontent', {
        targets: ['main:2'],
        path: '/jcontent/:siteKey/:lang/:mode', // Catch everything that's jcontent and let the app resolve correct view
        render: () => registry.get('route', 'requireCoreLicenseRoot').render() || <JContentApp/>
    });

    jContentRoutes(registry);
    jContentActions(registry);

    fileuploadRedux(registry);
    previewRedux(registry);
    copypasteRedux(registry);
    structuredViewRedux(registry);
    filesGridRedux(registry);
    paginationRedux(registry);
    sortRedux(registry);
    contentSelectionRedux(registry);
    pagesModeRedux(registry);
    jContentAccordionItems(registry);
    jContentRedux(registry);
    jContentAppRoot(registry);
}
