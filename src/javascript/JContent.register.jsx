import React from 'react';
import {registry} from '@jahia/ui-extender';
import {PrimaryNavItem, Tag} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import JContentApp from './JContentApp';
import {jContentRoutes} from './JContent/JContent.routes';
import {jContentActions} from './JContent/JContent.actions';
import {jContentAccordionItems} from './JContent/JContent.accordion-items';
import {jContentAppRoot} from './JContent/JContent.app-root';
import {cmGoto, cmOpenPaths, jContentRedux, setTableViewMode} from './JContent/redux/JContent.redux';
import {fileuploadRedux} from './JContent/ContentRoute/ContentLayout/Upload/Upload.redux';
import {previewRedux} from './JContent/redux/preview.redux';
import {copypasteRedux} from './JContent/actions/copyPaste/copyPaste.redux';
import {filesGridRedux} from './JContent/redux/filesGrid.redux';
import {paginationRedux} from './JContent/redux/pagination.redux';
import {sortRedux} from './JContent/redux/sort.redux';
import {selectionRedux} from '~/JContent/redux/selection.redux';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {DragLayer} from '~/JContent/dnd/DragLayer';
import hashes from './localesHash!';
import CategoryManagerApp from './CategoryManagerApp';
import {extractPaths} from '~/JContent/JContent.utils';
import {getTargetSiteLanguageForSwitch} from '~/utils/getTargetSiteLanguageForSwitch';
import {Redirect} from 'react-router';
import {booleanValue} from '~/ContentEditor/SelectorTypes/Picker/Picker.utils';
import {batchActions} from 'redux-batched-actions';
import SvgJContent from '~/icons/JContent';
import {compareStagingAndLiveRedux} from './JContent/redux/compareStagingAndLive.redux';

window.jahia.localeFiles = window.jahia.localeFiles || {};
window.jahia.localeFiles.jcontent = hashes;

export default function () {
    const JContentNavItem = props => {
        const dispatch = useDispatch();
        const {t} = useTranslation('jcontent');
        const {site, language, mode, pathname} = useSelector(state => ({
            language: state.language,
            site: state.site,
            mode: state.jcontent.mode,
            pathname: state.router.location.pathname
        }), shallowEqual);

        let accordions = registry.find({type: 'accordionItem', target: 'jcontent'});
        const nodeChecks = useNodeChecks({
            path: `/sites/${site}`,
            language: language
        }, {
            requiredSitePermission: [...new Set(accordions.filter(acc => acc.requiredSitePermission).map(acc => acc.requiredSitePermission))],
            getSiteLanguages: true
        });

        if (nodeChecks.loading || !nodeChecks.checksResult) {
            return null;
        }

        let defaultMode = accordions.find(acc => nodeChecks.node?.site[acc.requiredSitePermission])?.key;

        const newLanguage = getTargetSiteLanguageForSwitch(nodeChecks.node, language);

        return (
            <PrimaryNavItem key="/jcontent"
                            {...props}
                            isSelected={pathname.startsWith('/jcontent') && pathname.split('/').length > 3}
                            label={t('label.name')}
                            icon={<SvgJContent/>}
                            onClick={() => {
                                const storedMode = localStorage.getItem('jcontent-previous-mode-' + site);
                                const newMode = (mode && accordions.find(acc => acc.key === mode)) ? mode : (storedMode || defaultMode);
                                const newPath = localStorage.getItem('jcontent-previous-location-' + site + '-' + newMode) || '';
                                const newTemplate = localStorage.getItem('jcontent-previous-template-' + site + '-' + newMode) || '';
                                const accordion = registry.get('accordionItem', newMode);
                                const viewMode = localStorage.getItem('jcontent-previous-tableView-viewMode-' + site + '-' + newMode) || accordion?.tableConfig?.defaultViewMode || 'flatList';

                                const paths = extractPaths(site, newPath, newMode).slice(0, -1);
                                dispatch(batchActions([
                                    cmOpenPaths(paths),
                                    cmGoto({app: 'jcontent', site, language: newLanguage, mode: newMode, path: newPath, template: newTemplate, params: {}}),
                                    setTableViewMode(viewMode)
                                ]));
                            }}/>
        );
    };

    const CategoryManagerNavItem = props => {
        const dispatch = useDispatch();
        const {t} = useTranslation('jcontent');
        const {language, pathname} = useSelector(state => ({
            language: state.language,
            pathname: state.router.location.pathname
        }), shallowEqual);

        const permissions = useNodeChecks({
            path: '/sites/systemsite'
        }, {
            requiredPermission: 'categoryManager'
        });

        if (permissions.loading || !permissions.checksResult) {
            return null;
        }

        return (
            <PrimaryNavItem key="/category-manager"
                            {...props}
                            isSelected={pathname.startsWith('/category-manager')}
                            label={t('label.categoryManager.name')}
                            icon={<Tag/>}
                            onClick={() => {
                                const newPath = localStorage.getItem('category-manager-previous-location') || '';
                                const paths = extractPaths('systemsite', newPath, 'category').slice(0, -1);
                                dispatch(batchActions([
                                    cmOpenPaths(paths),
                                    cmGoto({app: 'category-manager', language, mode: 'category', path: newPath, params: {}})
                                ]));
                            }}/>
        );
    };

    registry.add('primary-nav-item', 'jcontent', {
        targets: ['nav-root-top:2'],
        requiredPermission: 'jContentAccess',
        render: () => <JContentNavItem/>
    });

    registry.add('route', 'route-jcontent', {
        targets: ['main:2'],
        path: '/jcontent/:siteKey/:lang/:mode', // Catch everything that's jcontent and let the app resolve correct view
        render: () => registry.get('route', 'requireCoreLicenseRoot').render() || <JContentApp/>
    });

    registry.add('primary-nav-item', 'category-manager', {
        targets: ['nav-root-top:4.1'],
        requiredPermission: 'categoryManager',
        requiredPermissionPath: '/sites/systemsite/categories',
        render: () => <CategoryManagerNavItem/>
    });

    registry.add('route', 'route-category-manager', {
        targets: ['main:3'],
        path: '/category-manager/:lang/:mode', // Catch everything that's jcontent and let the app resolve correct view
        requiredPermission: 'categoryManager',
        requiredPermissionPath: '/sites/systemsite/categories',
        render: () => <CategoryManagerApp/>
    });
    if (booleanValue(contextJsParameters.config.jcontent?.hideLegacyPageComposer)) {
        registry.add('route', 'pageBuilderToPageComposerRoute', {
            targets: ['main:-1'],
            path: '/page-composer/default/:lang/sites/:siteKey/:path',
            render: props => (
                <Redirect
                to={`/jcontent/${props.match.params.siteKey}/${props.match.params.lang}/pages/${props.match.params.path.substring(0, props.match.params.path.lastIndexOf('.'))}`}/>
            )
        });
    }

    registry.add('app', 'dnd', {
        targets: ['root:2'],
        render: next => (
            <DndProvider debugMode={(!process.env.NODE_ENV || process.env.NODE_ENV === 'development')}
                         backend={HTML5Backend}
            >
                <DragLayer/>
                {next}
            </DndProvider>
        )
    });

    jContentRoutes(registry);
    jContentActions(registry);

    fileuploadRedux(registry);
    previewRedux(registry);
    copypasteRedux(registry);
    filesGridRedux(registry);
    paginationRedux(registry);
    sortRedux(registry);
    selectionRedux(registry);
    compareStagingAndLiveRedux(registry);
    jContentAccordionItems(registry);
    jContentRedux(registry);
    jContentAppRoot(registry);

    return import('./shared').then(m => {
        window.jahia.jcontent = m;
    });
}
