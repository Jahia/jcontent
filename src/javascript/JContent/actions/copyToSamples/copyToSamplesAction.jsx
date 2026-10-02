import React, {useContext} from 'react';
import PropTypes from 'prop-types';
import {useNodeChecks} from '@jahia/data-helper';
import {useNotifications} from '@jahia/react-material';
import {useApolloClient} from '@apollo/client';
import {ComponentRendererContext} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import copyPasteQueries from '~/JContent/actions/copyPaste/copyPaste.gql-mutations';
import {PAGE_ONLY_SKIPPED_TYPES} from '~/JContent/actions/copyPaste/copyPaste.constants';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {isDefinitelyHidden} from '../utils/nodeVisibilityUtils';
import {isSamplePath} from '~/JContent/JContent.utils';
import {
    getSampleCategoryName,
    getSitePath,
    SAMPLES_CATEGORY_TYPE,
    SAMPLES_COMPONENTS_NAME,
    SAMPLES_FOLDER_NAME,
    SAMPLES_FOLDER_TYPE,
    SAMPLES_PAGES_NAME
} from '~/JContent/samples/samples.utils';
import {SampleDestinationQuery} from './copyToSamples.gql-queries';
import {
    CreateSampleCategoryMutation,
    CreateSamplesFolderMutation,
    DeleteSampleMutation
} from './copyToSamples.gql-mutations';
import {SaveSampleDialog} from './SaveSampleDialog';
import JContentConstants from '~/JContent/JContent.constants';

const SHOW_ON_NODE_TYPES = ['jnt:content', 'jnt:page'];

// The isDefinitelyHidden fast path runs before any query and compares the *literal* primary type,
// with no supertype resolution, so it can only be given concrete types. SHOW_ON_NODE_TYPES cannot go
// through it: jnt:content is abstract - every component declares some subtype of it - so every
// component would be judged hidden and the action would appear on pages only. The real type check is
// showOnNodeTypes on useNodeChecks below, which resolves the hierarchy server-side.
const NEVER_A_SAMPLE = ['jnt:virtualsite', 'jnt:contentFolder', 'jnt:folder', 'jnt:file'];

/**
 * What the copy should leave behind.
 *
 * A page sample is always the page alone. For content the author decides, and dropping the children
 * means skipping content children only - technical subnodes still have to come along for the sample
 * to be a valid node.
 */
function getTypesToSkip(isPage, withChildren) {
    if (isPage) {
        return PAGE_ONLY_SKIPPED_TYPES;
    }

    return withChildren ? undefined : ['jnt:content'];
}

/**
 * Makes sure the category exists, creating as little as possible, and returns its path.
 * A site created after the provisioning patch ran has no samples branch at all.
 */
async function resolveCategoryPath(client, site, isPage) {
    const categoryName = getSampleCategoryName(isPage);
    const samples = site.samples;
    const existing = isPage ? samples?.pages : samples?.components;

    if (existing) {
        return existing.path;
    }

    if (!samples) {
        const {data} = await client.mutate({
            mutation: CreateSamplesFolderMutation,
            variables: {
                sitePath: site.path,
                samplesName: SAMPLES_FOLDER_NAME,
                samplesType: SAMPLES_FOLDER_TYPE,
                categoryName,
                categoryType: SAMPLES_CATEGORY_TYPE
            }
        });
        return data?.jcr?.addNode?.node?.category?.path;
    }

    const {data} = await client.mutate({
        mutation: CreateSampleCategoryMutation,
        variables: {samplesPath: samples.path, categoryName, categoryType: SAMPLES_CATEGORY_TYPE}
    });
    return data?.jcr?.addNode?.node?.path;
}

export const CopyToSamplesActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const client = useApolloClient();
    const {notify} = useNotifications();
    const {t} = useTranslation('jcontent');
    const sitePath = getSitePath(path);

    // Offered on ordinary site content only: a node already in the samples branch would just be
    // duplicated there, and a node outside a site has no samples branch to be copied into.
    const skip = isDefinitelyHidden(prefetchedNode, {hideOnNodeTypes: NEVER_A_SAMPLE}) ||
        isSamplePath(path) ||
        !sitePath;

    const res = useNodeChecks(
        {path},
        {
            skip,
            requiredSitePermission: [JContentConstants.accordionPermissions.samplesAccordionAccess],
            showOnNodeTypes: SHOW_ON_NODE_TYPES
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
    }

    const writeSample = async ({site, isPage, replacedPath, withChildren = true}) => {
        if (replacedPath) {
            await client.mutate({mutation: DeleteSampleMutation, variables: {pathOrId: replacedPath}});
        }

        const categoryPath = await resolveCategoryPath(client, site, isPage);
        await client.mutate({
            mutation: copyPasteQueries.pasteNode,
            variables: {
                pathOrId: path,
                destParentPathOrId: categoryPath,
                // A page sample is the page itself, never the branch under it - the same rule the
                // existing "copy page only" action applies. For content, the author chooses.
                nodeTypesToSkip: getTypesToSkip(isPage, withChildren)
            }
        });

        triggerRefetchAll();
        notify(t(isPage ?
            'jcontent:label.contentManager.copyToSamples.savedAsPage' :
            'jcontent:label.contentManager.copyToSamples.savedAsComponent'), ['closeButton', 'closeAfter5s']);
    };

    // Nothing is asked of the author unless there is a real decision: the name already taken, or
    // content that has children of its own. Both are asked at once rather than as two modals.
    const saveAsSample = async () => {
        try {
            const sourceName = path.slice(path.lastIndexOf('/') + 1);
            const {data} = await client.query({
                query: SampleDestinationQuery,
                variables: {
                    path,
                    sourceName,
                    samplesFolderName: SAMPLES_FOLDER_NAME,
                    pagesName: SAMPLES_PAGES_NAME,
                    componentsName: SAMPLES_COMPONENTS_NAME
                },
                fetchPolicy: 'network-only'
            });

            const source = data?.jcr?.source;
            const isPage = source?.isPage === true;
            const samples = source?.site?.samples;
            const existing = (isPage ? samples?.pages : samples?.components)?.existing;
            // Pages are never asked about scope - a page sample is always the page alone.
            const hasChildren = !isPage && (source?.contentChildren?.pageInfo?.totalCount ?? 0) > 0;

            if (existing || hasChildren) {
                componentRenderer.render('saveSampleDialog', SaveSampleDialog, {
                    name: sourceName,
                    isReplacing: Boolean(existing),
                    hasChildren,
                    onConfirm: withChildren => {
                        writeSample({site: source.site, isPage, replacedPath: existing?.path, withChildren})
                            .catch(e => {
                                console.error('Error when saving a sample', e.message);
                                notify(t('jcontent:label.contentManager.copyToSamples.failed'), ['closeButton']);
                            });
                    },
                    onExit: () => componentRenderer.destroy('saveSampleDialog')
                });
                return;
            }

            await writeSample({site: source.site, isPage});
        } catch (e) {
            console.error('Error when saving a sample', e.message);
            notify(t('jcontent:label.contentManager.copyToSamples.failed'), ['closeButton']);
        }
    };

    return (
        <Render
            {...others}
            isVisible={res.checksResult}
            onClick={saveAsSample}
        />
    );
};

CopyToSamplesActionComponent.propTypes = {
    path: PropTypes.string,
    node: PropTypes.object,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
