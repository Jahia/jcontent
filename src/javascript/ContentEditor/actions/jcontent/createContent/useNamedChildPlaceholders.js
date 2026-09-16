import {useQuery} from '@apollo/client';
import {JahiaRenderedModulesUtil} from '~/JContent/JContent.utils';
import {getNodeEditRendering} from './createContent.gql-queries';

/**
 * The named children a node can still receive, as [{name, nodeTypes}].
 *
 * Only the rendering knows them: a placeholder's name and node types come from the view's
 * template:module tag, from j:contributeTypes and from the editability of the node, none of which
 * the node type definition carries. Inside a page the capture taken for the route already holds
 * them; a content folder is never rendered, so the node is rendered on its own instead — same
 * ModuleTag output, hence the same placeholders page builder shows.
 *
 * @param {object} params the node to inspect
 * @param {string} params.path the node's path
 * @param {string} params.language the content language
 * @returns {{loading: boolean, placeholders: {name: string, nodeTypes: string[]}[]}} the result
 */
export const useNamedChildPlaceholders = ({path, language}) => {
    const fromRoute = JahiaRenderedModulesUtil.hasRenderingFor(path);

    const {data, loading} = useQuery(getNodeEditRendering, {
        variables: {path, language},
        fetchPolicy: 'no-cache',
        skip: fromRoute || !path || !language
    });

    if (fromRoute) {
        return {loading: false, placeholders: JahiaRenderedModulesUtil.getNamedPlaceholders(path)};
    }

    if (loading && !data) {
        return {loading: true, placeholders: []};
    }

    const output = data?.jcr?.nodeByPath?.renderedContent?.output;
    if (!output) {
        return {loading: false, placeholders: []};
    }

    const dom = new DOMParser().parseFromString(output, 'text/html');
    const modules = JahiaRenderedModulesUtil.parseModuleInfo(dom, path, true);

    return {
        loading: false,
        placeholders: (modules[path] || [])
            .filter(entry => entry.placeholder && entry.path !== '*' && !entry.path?.startsWith('/'))
            .map(entry => ({name: entry.path, nodeTypes: entry.nodeTypes}))
    };
};
