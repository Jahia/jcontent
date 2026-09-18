import React from 'react';
import * as _ from 'lodash';
import ellipsize from 'ellipsize';
import JContentConstants from './JContent.constants';
import {getIcon} from '@jahia/icons';
import {Layers, Tag} from '@jahia/moonstone';
import {registry} from '@jahia/ui-extender';
import {GetAncestorsQueryById, GetAncestorsQueryByPath} from '~/JContent/JContentUtils.gql-queries';
import rison from 'rison';

export const getNewNodePath = (oldPath, oldAncestorPath, newAncestorPath) => {
    if (_.startsWith(oldPath, oldAncestorPath + '/') || oldPath === oldAncestorPath) {
        let relativePath = oldPath.substring(oldAncestorPath.length, oldPath.length);
        return (newAncestorPath + relativePath);
    }

    return oldPath;
};

export const hasMixin = (node, mixin) => {
    if (node.mixinTypes) {
        return node.mixinTypes.some(t => t.name === mixin);
    }

    let mixinTypesProperty = node.properties?.find(prop => prop.name === 'jcr:mixinTypes');
    if (mixinTypesProperty) {
        return mixinTypesProperty.values?.includes(mixin);
    }

    return false;
};

export const hasProperty = (node, propertyName) => {
    let propertyValue = _.find(node.properties, property => property.name === propertyName);
    return propertyValue !== undefined;
};

export const isDescendant = (path, ancestorPath) => {
    return Boolean(path) && path.startsWith(ancestorPath + '/');
};

export const canEditInPageBuilder = (path, nodes, site) => {
    // A reference is never editable in Page Builder, wherever it resolves to
    if (isFromReference(path, nodes)) {
        return false;
    }

    // By default, a node is editable when it belongs to the currently selected site
    if (isDescendant(path, `/sites/${site}`)) {
        return true;
    }

    // Extension point: projects can register additional editable roots so their content
    // gets Page Builder boxes even though it lives outside the currently selected site
    // (e.g. a shared content repository site mounted in the Contents accordion).
    // Each entry provides either a `rootPath` string or a `matches(path, {nodes, site})`
    // predicate returning a boolean.
    return registry.find({type: 'pageBuilderEditableRoot'})
        .some(entry => (typeof entry.matches === 'function' ?
            entry.matches(path, {nodes, site}) :
            Boolean(entry.rootPath) && isDescendant(path, entry.rootPath)));
};

// This determines if the node is included as part of content reference in which case we don't want to have a box for it.
const isFromReference = (path, nodes) => {
    if (path.includes('@/')) {
        // Note that parent path cannot be checked directly as parent is not jnt:contentReference but jnt:list or other (/somepath/content-ref@/list/node)
        // Note that we also check to make sure that what we find is a discoverable node in the tree
        const split = path.split('@/');
        return nodes[split[0]]?.primaryNodeType.name === 'jnt:contentReference';
    }

    return false;
};

export const isDescendantOrSelf = (path, ancestorOrSelfPath) => {
    return (path === ancestorOrSelfPath || isDescendant(path, ancestorOrSelfPath));
};

export const isMarkedForDeletion = node => {
    return hasMixin(node, 'jmix:markedForDeletion');
};

export const isAutoPublished = node => {
    return hasMixin(node, 'jmix:autoPublish');
};

export const isWorkInProgress = (node, lang) => {
    if (node.wipStatus) {
        switch (node.wipStatus.value) {
            case 'ALL_CONTENT':
                return true;
            case 'LANGUAGES':
                return _.includes(node.wipLangs.values, lang);
            default:
                return false;
        }
    }

    return false;
};

export const extractPaths = (siteKey, path, mode) => {
    let pathBase = '/sites/' + siteKey + (mode === JContentConstants.mode.MEDIA ? '/files' : '');
    let pathParts = path.replace(pathBase, '').split('/');
    let paths = [];
    if (path.startsWith(pathBase)) {
        for (let i in pathParts) {
            if (i > 0) {
                paths.push(paths[i - 1] + '/' + pathParts[i]);
            } else {
                paths.push(pathBase);
            }
        }
    }

    return paths;
};

export const ellipsizeText = (text, maxLength) => {
    return ellipsize(text, maxLength || 100, {chars: [' ', '&']});
};

export const removeFileExtension = filename => {
    if (filename.lastIndexOf('.') > 0) {
        return filename.substr(0, filename.lastIndexOf('.'));
    }

    return filename;
};

export const getNewCounter = nodes => {
    let max = 0;
    nodes.forEach(node => {
        let name = removeFileExtension(node.name);
        let extracted = name.match(/\d{1,15}$/g);
        if (extracted !== null) {
            let counter = Number.parseInt(extracted[0], 10);
            if (counter > max) {
                max = counter;
            }
        }
    });
    return max + 1;
};

export const allowDoubleClickNavigation = (nodeType, subNodes, fcn, node = null) => {
    if (['jnt:page', 'jnt:folder', 'jnt:contentFolder'].includes(nodeType) ||
        (subNodes && subNodes > 0) ||
        (node && isCMISFolder(node))) {
        return fcn;
    }

    return function () {};
};

export const getDefaultLocale = lang => {
    return ['en', 'fr', 'de'].includes(lang) ? lang : 'en';
};

export const getLanguageLabel = (languages, currentLang) => {
    return _.find(languages, function (language) {
        if (language.language === currentLang) {
            return language;
        }
    }) || {
        language: currentLang,
        displayName: Intl.DisplayNames ? new Intl.DisplayNames([contextJsParameters.language], {type: 'language'}).of(currentLang.split('_')[0]) : currentLang.split('_')[0]
    };
};

export const uppercaseFirst = string => {
    return string.charAt(0).toUpperCase() + string.substr(1);
};

export const getNodeTypeIcon = typeName => {
    if (typeName === 'jnt:category') {
        return <Tag/>;
    }

    const Icon = getIcon(typeName) || Layers;
    return <Icon/>;
};

export const isObject = item => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

export const isSafeProp = key => {
    return !['__proto__', 'prototype', 'constructor'].includes(key);
};

export const mergeDeep = (target, ...sources) => {
    if (!sources.length) {
        return target;
    }

    const source = sources.shift();

    const mergeProps = ([propKey, value]) => {
        if (!isSafeProp(propKey)) {
            return;
        }

        if (isObject(value)) {
            if (!target[propKey]) {
                Object.assign(target, {[propKey]: {}});
            }

            mergeDeep(target[propKey], value);
        } else {
            Object.assign(target, {[propKey]: source[propKey]});
        }
    };

    if (isObject(target) && isObject(source)) {
        Object.entries(source).forEach(mergeProps);
    }

    return mergeDeep(target, ...sources);
};

export const arrayValue = value => {
    return (typeof value === 'string') ? value.split(',') : value;
};

export const booleanValue = v => {
    if (typeof v === 'string') {
        return v === 'true';
    }

    if (typeof v === 'function') {
        return v();
    }

    return Boolean(v);
};

export const getCanDisplayItemParams = node => {
    const folders = ['jnt:contentFolder', 'jnt:folder'];
    const params = {};

    if (folders.includes(node.primaryNodeType.name)) {
        params.folderNode = node;
    } else {
        params.selectionNode = node;
    }

    return params;
};

export const getAccordionItem = (accordion, accordionItemProps) => {
    if (accordionItemProps && accordion && accordionItemProps[accordion.key]) {
        // Avoid proto pollution by creating an empty object with no Object.prototype
        const emptyObj = Object.create(null);
        return mergeDeep(emptyObj, accordion, accordionItemProps[accordion.key]);
    }

    return accordion;
};

export const getAccordionItems = (accordionItemTarget, accordionItemProps) => {
    const accordionItems = registry.find({type: 'accordionItem', target: accordionItemTarget});

    if (accordionItemProps) {
        return accordionItems.map(item => {
            return getAccordionItem(item, accordionItemProps);
        });
    }

    return accordionItems;
};

export const getName = node => {
    return (node.displayName && ellipsizeText(node.displayName, 50)) || node.name;
};

export const pathExistsInTree = (path, tree, pathAccessor) => {
    if (Array.isArray(tree)) {
        for (const node of tree) {
            if (pathExistsInTree(path, node, pathAccessor)) {
                return true;
            }
        }

        return false;
    }

    if ((pathAccessor && pathAccessor(tree) === path) || tree.path === path) {
        return true;
    }

    if (tree.subRows) {
        return pathExistsInTree(path, tree.subRows, pathAccessor);
    }

    return false;
};

export const isPathChildOfAnotherPath = (child, parent) => {
    if (child === parent) {
        return false;
    }

    const parentTokens = parent.split('/').filter(i => i.length);
    const childTokens = child.split('/').filter(i => i.length);
    return parentTokens.every((t, i) => childTokens[i] === t);
};

export const getRegistryTarget = function (item, target) {
    const foundTarget = item.targets.find(t => t.id === target || t.id.startsWith(target + '-'));
    return foundTarget.id + ':' + foundTarget.priority;
};

export const buildUrl = ({site, language, mode, path, params}) => {
    let registryItem = registry.get('accordionItem', mode);
    if (registryItem?.getUrlPathPart) {
        path = registryItem.getUrlPathPart(site, path, registryItem);
    }

    // Special chars in folder naming
    path = path.replaceAll(/[^/]/g, encodeURIComponent);

    let queryString = _.isEmpty(params) ? '' : '?params=' + rison.encode_uri(params);
    return '/jcontent/' + [site, language, mode].join('/') + path + queryString;
};

export const expandTree = (variables, client) => {
    return client.query({query: variables.path ? GetAncestorsQueryByPath : GetAncestorsQueryById, variables}).then(res => {
        let node = res.data.jcr.node;
        const params = {selectionNode: node};
        const acc = registry.find({type: 'accordionItem', target: 'jcontent'}).find(acc => acc.canDisplayItem?.(params));
        const mode = acc.key;
        const site = node.site.name;
        const parentPath = acc.getPathForItem(node);
        const viewType = acc.getViewTypeForItem ? acc.getViewTypeForItem(node) : null;
        const ancestorPaths = _.map(node.ancestors, ancestor => ancestor.path);

        return {mode, parentPath, ancestorPaths, viewType, site};
    });
};

export const clickHandler = {
    handleEvent(e, fcn) {
        e.preventDefault();
        e.stopPropagation();
        if (e.nativeEvent.detail === 1 && !this.timeout) {
            this.timeout = setTimeout(() => {
                this.timeout = undefined;
                fcn();
            }, 300);
        } else if (e.nativeEvent.detail === 2) {
            clearTimeout(this.timeout);
            this.timeout = undefined;
        }
    }
};

export const findAvailableBoxConfig = node => {
    // Take the first matching config
    // Only check the primaryNodeType and mixins added on the node
    const mixinTypesName = node.mixinTypes?.map(mixin => mixin.name) || [];
    const nodeTypes = [...mixinTypesName, node.primaryNodeType.name];
    let configs = [];
    nodeTypes.forEach(nodeType => {
        configs.push(...registry.find({type: 'pageBuilderBoxConfig', target: nodeType}));
    });
    return configs.shift();
};

export const getTitle = (t, item, prefix = 'jContent') => {
    return item.label ? `${prefix} - ${t(item.label)}` : `${prefix} - ${item.key}`;
};

/**
 * The named children among a parent's module entries, as [{name, nodeTypes}].
 *
 * An entry without node types is dropped: the rendering omits the attribute when neither the view
 * nor the definition constrains the placeholder, and the editor has nothing to create from.
 *
 * @param {Array} entries the module entries collected for one parent
 * @returns {{name: string, nodeTypes: string[]}[]} the creatable named children
 */
export const toNamedPlaceholders = entries => (entries || [])
    .filter(entry => entry.placeholder && entry.path !== '*' && !entry.path?.startsWith('/'))
    .filter(entry => entry.nodeTypes?.length > 0)
    .map(entry => ({name: entry.path, nodeTypes: entry.nodeTypes}));

export const JahiaRenderedModulesUtil = {
    jahiaAreas: {},
    jahiaModules: {},
    capturedPath: undefined,
    setModules(modules, capturedPath) {
        this.jahiaModules = modules;
        this.capturedPath = capturedPath;
    },
    // Whether the node sits inside the page whose rendering produced the current capture. Outside
    // that subtree an absent entry means "never rendered", not "the view exposes nothing" - a
    // content folder is never rendered, so its nodes are rendered one at a time instead.
    hasRenderingFor: function (path) {
        return Boolean(path && this.capturedPath) &&
            (path === this.capturedPath || path.startsWith(this.capturedPath + '/'));
    },
    addModule: function (path, data) {
        this.jahiaModules[path] = data;
    },
    getModule: function (path) {
        return this.jahiaModules[path];
    },
    addArea: function (path, elemAttrs) {
        this.jahiaAreas[path] = elemAttrs;
    },
    isJahiaArea: function (path) {
        const p = Array.isArray(path) ? path : [path];
        return p.some(value => Boolean(this.jahiaAreas[value]));
    },
    getArea: function (path) {
        return this.jahiaAreas[path];
    },
    // The types creatable as an unnamed child of a module, out of the captured rendering.
    //
    // Wildcard placeholders that all carry nodetypes answer on their own: they hold the contribute
    // types, which the module element does not. Every other shape falls back to the module's own
    // nodetypes, written from the definition's unnamed-child constraints - so a view that renders
    // its children itself, and therefore emits no wildcard placeholder at all, still names what it
    // accepts. Returns undefined for a module that was never rendered, which is not the same answer
    // as an empty list.
    resolveNodeTypes: function (path) {
        const moduleInfo = this.getModule(path);

        if (!moduleInfo) {
            return undefined;
        }

        const wildcardPlaceholders = moduleInfo.filter(item => item.placeholder && item.path === '*');
        const placeholderNodeTypes = wildcardPlaceholders.flatMap(item => item.nodeTypes ?? []);

        if (wildcardPlaceholders.length > 0 && wildcardPlaceholders.every(item => item.nodeTypes?.length > 0)) {
            return [...new Set(placeholderNodeTypes)];
        }

        const ownNodeTypes = moduleInfo
            .filter(item => !item.placeholder && item.path === '*')
            .flatMap(item => item.nodeTypes ?? []);

        return [...new Set([...ownNodeTypes, ...placeholderNodeTypes])];
    },
    // The named children still creatable under a node, as [{name, nodeTypes}]. A placeholder is
    // what the view emits for a child that does not exist yet, so an occupied name is absent by
    // construction.
    getNamedPlaceholders: function (path) {
        return toNamedPlaceholders(this.getModule(path));
    },
    /**
     * Collect the module information out of one rendering.
     *
     * @param {Document} dom the parsed rendering
     * @param {string} rootPath the node that was rendered
     * @param {boolean} standalone whether that node was rendered on its own, which is how a node
     * outside a page is read. It then carries no module wrapper, so a placeholder with no module
     * ancestor is its own. A page render instead nests every placeholder under the module element
     * of its parent, and its root element is a mainmodule, which this selector never matches - so
     * a parentless placeholder there belongs to no node this capture models, and the page route has
     * always dropped it. Adopting it would hand the page its own named create actions.
     * @returns {object} placeholders and wildcard node types, keyed by parent path
     */
    parseModuleInfo: function (dom, rootPath, standalone = false) {
        const placeholdersByParent = {};

        dom.querySelectorAll('[jahiatype="module"]').forEach(element => {
            const modulePath = element.getAttribute('path');
            const elemType = element.getAttribute('type');
            const nodeTypes = element.getAttribute('nodetypes')?.split(' ');
            const limit = element.getAttribute('listlimit') ?? undefined;

            if (modulePath !== '*' && modulePath !== rootPath && (elemType === 'area' || elemType === 'absoluteArea')) {
                this.addArea(modulePath, {elemType, nodeTypes, limit: Number(limit)});
            }

            if (elemType === 'placeholder') {
                const ancestor = element.parentElement?.closest('[jahiatype="module"]');
                const ancestorPath = ancestor?.getAttribute('path') ?? (standalone ? rootPath : undefined);
                if (ancestorPath) {
                    if (!placeholdersByParent[ancestorPath]) {
                        placeholdersByParent[ancestorPath] = [];
                    }

                    placeholdersByParent[ancestorPath].push({
                        path: element.getAttribute('path'),
                        nodeTypes: element.getAttribute('nodetypes')?.split(' '),
                        placeholder: true
                    });
                }
            } else if (!placeholdersByParent[modulePath]) {
                placeholdersByParent[modulePath] = [];
                if (nodeTypes) {
                    placeholdersByParent[modulePath].push({
                        path: '*',
                        nodeTypes,
                        placeholder: false
                    });
                }
            }
        });

        return placeholdersByParent;
    },
    extractModuleInfoFromRenderedPage: function (pagePath, language, template) {
        const renderMode = 'editframe';
        const encodedPath = pagePath.replaceAll(/[^/]/g, encodeURIComponent) + (template === '' ? '' : `.${template}`);
        const url = `${globalThis.contextJsParameters.contextPath}/cms/${renderMode}/default/${language}${encodedPath}.html?redirect=false`;
        console.debug(`Fetching html for ${url} to extract module information.`);

        return fetch(url, {
            method: 'get'
        }).then(resp => {
            return resp.text();
        }).then(resp => {
            const dom = new DOMParser().parseFromString(resp, 'text/html');
            this.setModules(this.parseModuleInfo(dom, pagePath), pagePath);
        }).catch(e => {
            console.error('Failed to capture areas for page', e);
        });
    }
};

export const resolveUrlForLiveOrPreview = (url, isLive, serverName) => {
    // Strip host from absolute URL — path is identical across all server names for the same site
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    const port = location.port ? `:${location.port}` : '';

    const isCurrentDomain = !isLive || !serverName || serverName === location.hostname;
    const isLocalServer = serverName === 'localhost';

    let resolvedUrl = '';
    if (isCurrentDomain) {
        resolvedUrl = `${location.protocol}//${location.hostname}${port}${path}`;
    } else if (isLocalServer) {
        resolvedUrl = `${location.protocol}//localhost${port}${path}`;
    } else {
        // External server name: no port
        resolvedUrl = `${location.protocol}//${serverName}${path}`;
    }

    return resolvedUrl;
};

/**
 * Check if a node is a CMIS folder based on its mixin types
 * @param {Object} node - The node object with mixinTypes array
 * @returns {boolean} - True if the node has the cmismix:folder mixin
 */
export const isCMISFolder = node => {
    return hasMixin(node, 'cmismix:folder');
};

/**
 * Check if a node is a CMIS file/document based on its mixin types
 * @param {Object} node - The node object with mixinTypes array
 * @returns {boolean} - True if the node has the cmismix:document mixin
 */
export const isCMISFile = node => {
    return hasMixin(node, 'cmismix:document');
};
