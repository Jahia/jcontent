import {useMemo} from 'react';
import {useQuery} from '@apollo/client';
import {JahiaRenderedModulesUtil, toNamedPlaceholders} from '~/JContent/JContent.utils';
import {getNodeEditRendering} from './createContent.gql-queries';

const NONE = [];

/**
 * The named children a node can still receive, as [{name, nodeTypes}].
 *
 * Only the rendering knows them: a placeholder's name and node types come from the view's
 * template:module tag, from j:contributeTypes and from the editability of the node, none of which
 * the node type definition carries. Inside a page the capture taken for the route already holds
 * them; a content folder is never rendered, so the node is rendered on its own instead — same
 * ModuleTag output, hence the same placeholders page builder shows.
 *
 * Rendering a node costs a server-side render, so the caller skips it for a node whose create
 * action is not shown anyway.
 *
 * @param {object} params the node to inspect
 * @param {string} params.path the node's path
 * @param {string} params.language the content language
 * @param {boolean} params.skip do not render the node
 * @returns {{loading: boolean, placeholders: {name: string, nodeTypes: string[]}[]}} the result
 */
export const useNamedChildPlaceholders = ({path, language, skip}) => {
    const fromRoute = JahiaRenderedModulesUtil.hasRenderingFor(path);

    const {data, loading} = useQuery(getNodeEditRendering, {
        variables: {path, language},
        fetchPolicy: 'no-cache',
        skip: fromRoute || skip || !path || !language
    });

    const output = data?.jcr?.nodeByPath?.renderedContent?.output;

    // The result is a dependency of the caller's memo, so it holds its identity until an input
    // changes — a fresh array on every render would cancel that memo, and re-parse the rendering.
    return useMemo(() => {
        if (fromRoute) {
            return {loading: false, placeholders: JahiaRenderedModulesUtil.getNamedPlaceholders(path)};
        }

        if (skip) {
            return {loading: false, placeholders: NONE};
        }

        if (!output) {
            return {loading: Boolean(loading), placeholders: NONE};
        }

        const dom = new DOMParser().parseFromString(output, 'text/html');
        return {
            loading: false,
            placeholders: toNamedPlaceholders(JahiaRenderedModulesUtil.parseModuleInfo(dom, path, true)[path])
        };
    }, [fromRoute, path, skip, loading, output]);
};
