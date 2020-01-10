import ContentManagerConstants from '../../../../../ContentManager.constants';
import * as _ from 'lodash';

const buildBreadcrumbItems = (path, data, mode, t, site) => {
    let rootPath = '/sites/' + site;
    let breadcrumbs = [];
    // First we build first element depending on the mode (files & contents are already in the results of the query)
    if (mode === ContentManagerConstants.mode.BROWSE && path.lastIndexOf('contents') === -1) {
        breadcrumbs.push({
            uuid: 'pages_id',
            name: t('content-media-manager:label.contentManager.browsePages'),
            path: rootPath,
            type: 'jnt:virtualsite'
        });
    }

    // Then we build the other objects based on paths returned by the query
    data.jcr.nodeByPath.ancestors.forEach(ancestor => {
        breadcrumbs.push({
            path: ancestor.path,
            name: ancestor.path.endsWith('contents') ? t('content-media-manager:label.contentManager.browseFolders') : (ancestor.path.endsWith('files') ? t('content-media-manager:label.contentManager.browseFiles') : ancestor.displayName),
            type: ancestor.type.name,
            uuid: ancestor.uuid
        });
    });
    // To not have two Browse Pages breadcrumbs as we already added it
    // push the last path of the object we browse to
    if (!path.endsWith(site)) {
        breadcrumbs.push({
            path: path,
            name: path.endsWith('contents') ? t('content-media-manager:label.contentManager.browseFolders') : (path.endsWith('files') ? t('content-media-manager:label.contentManager.browseFiles') : data.jcr.nodeByPath.displayName),
            type: data.jcr.nodeByPath.primaryNodeType.name,
            uuid: data.jcr.nodeByPath.uuid
        });
    }

    return breadcrumbs;
};

function getLastParent(breadcrumbs) {
    let lastParent = _.findLastIndex(breadcrumbs, breadcrumb => breadcrumb.type === 'jnt:page' ||
        breadcrumb.type === 'jnt:contentFolder' || breadcrumb.type === 'jnt:folder' || breadcrumb.type === 'jmix:cmContentTreeDisplayable' || breadcrumb.type === 'jmix:visibleInContentTree');
    return lastParent;
}

export {buildBreadcrumbItems, getLastParent};
