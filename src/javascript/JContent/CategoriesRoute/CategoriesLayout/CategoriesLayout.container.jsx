import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {cmOpenTablePaths} from '~/JContent/redux/JContent.redux';
import {Loader} from '@jahia/moonstone';
import {useLayoutQuery} from '~/JContent/ContentRoute/ContentLayout/useLayoutQuery';
import clsx from 'clsx';
import styles from '../../ContentRoute/ContentLayout/ContentLayout.scss';
import JContentConstants from '~/JContent/JContent.constants';
import CategoriesLayout from '~/JContent/CategoriesRoute/CategoriesLayout/CategoriesLayout';
import {registry} from '@jahia/ui-extender';
import {refetchTypes, setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {useApolloClient} from '@apollo/client';
import gql from 'graphql-tag';
import {useDelayedVeil} from './useDelayedVeil';

export const CategoriesLayoutContainer = () => {
    const {t} = useTranslation('jcontent');
    const currentResult = useRef();

    const {mode, path} = useSelector(state => ({
        mode: state.jcontent.mode,
        path: state.jcontent.path
    }), shallowEqual);

    // Joined rather than taken as an array, so this only changes when the selection really does
    const selectionKey = useSelector(state => state.jcontent.selection.join(','));

    const dispatch = useDispatch();
    const accordionItem = registry.get('accordionItem', 'category');
    // The table always shows the whole tree from the categories root; state.jcontent.path only
    // tracks which category is currently selected (header, breadcrumb, "create under" actions).
    const options = useSelector(state => ({
        mode: state.jcontent.mode,
        siteKey: 'systemsite',
        path: accordionItem.rootPath,
        lang: state.language,
        uilang: state.uilang,
        pagination: state.jcontent.pagination,
        sort: accordionItem.tableConfig.defaultSort,
        openPaths: state.jcontent.tableOpenPaths,
        // The categories root is shown as a row so it can be dropped onto: without it there is
        // no target for moving a category back up to the first level.
        hideRoot: false,
        tableView: {viewMode: JContentConstants.tableView.viewMode.STRUCTURED},
        searchPath: state.jcontent.params.searchPath,
        searchContentType: 'jnt:category',
        searchTerms: state.jcontent.params.searchTerms
    }), shallowEqual);

    const {isStructured, result, error, loading, refetch} = useLayoutQuery(options);

    // A category created in a tree this size is effectively lost unless it is shown: open the
    // branch it landed in, then let the table scroll to it once the refetch brings it back. The
    // path is kept rather than cleared, so the row stays tinted and findable after the scroll.
    const [pathToReveal, setPathToReveal] = useState(null);
    const client = useApolloClient();
    const rootPath = accordionItem.rootPath;

    useEffect(() => {
        // Uses contentEditorEventHandlers rather than contentModificationEventHandlers: the latter is
        // only reached when the editor is not fullscreen and when the save result carries the new
        // node, whereas this one is called on every successful create. It gives a uuid and not a
        // path, so the path is looked up before deciding whether the new node is ours.
        const key = 'jcontent-categories-reveal';
        window.top.contentEditorEventHandlers = window.top.contentEditorEventHandlers || {};
        window.top.contentEditorEventHandlers[key] = ({nodeUuid, operator}) => {
            if (operator !== 'create') {
                return;
            }

            client.query({
                query: gql`query categoryPath($uuid: String!) { jcr { nodeById(uuid: $uuid) { path } } }`,
                variables: {uuid: nodeUuid},
                fetchPolicy: 'network-only'
            }).then(({data}) => {
                const nodePath = data?.jcr?.nodeById?.path;
                if (!nodePath?.startsWith(rootPath + '/')) {
                    return;
                }

                const ancestors = [];
                for (let at = nodePath.lastIndexOf('/'); at > rootPath.length - 1; at = nodePath.lastIndexOf('/', at - 1)) {
                    ancestors.push(nodePath.substring(0, at));
                }

                dispatch(cmOpenTablePaths(ancestors));
                setPathToReveal(nodePath);
            }).catch(e => console.warn('Could not locate the created category', e));
        };

        return () => {
            delete window.top.contentEditorEventHandlers[key];
        };
    }, [client, dispatch, rootPath]);

    // The tint is a way of finding the new category, not a badge it should wear. It goes as soon
    // as the reader does anything that shows they have moved on: selecting another row (a click
    // makes it the current one) or changing the selection.
    const interactionAtReveal = useRef(null);
    useEffect(() => {
        if (!pathToReveal) {
            interactionAtReveal.current = null;
            return;
        }

        const signature = path + '|' + selectionKey;
        if (interactionAtReveal.current === null) {
            interactionAtReveal.current = signature;
        } else if (interactionAtReveal.current !== signature) {
            setPathToReveal(null);
        }
    }, [pathToReveal, path, selectionKey]);

    useEffect(() => {
        setRefetcher(refetchTypes.CONTENT_DATA, {
            refetch: refetch
        });

        return () => {
            unsetRefetcher(refetchTypes.CONTENT_DATA);
        };
    });

    // Open the root once on arrival so the first level of categories is visible straight away.
    // Deeper levels are only fetched when their branch is expanded, which keeps very large trees
    // cheap to open.
    const didAutoExpand = useRef(false);
    useEffect(() => {
        if (!didAutoExpand.current && isStructured && !loading && result?.nodes?.length) {
            didAutoExpand.current = true;
            dispatch(cmOpenTablePaths(result.nodes.filter(n => n.hasSubRows).map(n => n.path)));
        }
    }, [dispatch, result, isStructured, loading]);

    // Read before currentResult is updated below: this is asking whether the previous render had
    // rows, i.e. whether this load is an expansion rather than a first paint.
    const showVeil = useDelayedVeil(loading, Boolean(currentResult.current));

    if (!loading && !result) {
        if (error) {
            const message = t('jcontent:label.contentManager.error.queryingContent', {details: error.message || ''});
            console.error(message);
        }

        return (
            <CategoriesLayout isContentNotFound
                              mode={mode}
                              path={path}
                              rows={[]}
                              isStructured={isStructured}
                              isLoading={loading}
                              totalCount={0}
            />
        );
    }

    if (loading) {
        // While loading new results, render current ones loaded during previous render invocation (if any).
    } else {
        currentResult.current = result;
    }

    let rows = [];
    let totalCount = 0;

    if (currentResult.current) {
        totalCount = currentResult.current.pageInfo.totalCount;
        rows = currentResult.current.nodes;
    }

    return (
        <div className="flexFluid flexCol_nowrap" style={{position: 'relative'}}>
            {showVeil && (
                <div className={clsx('flexCol_center', 'alignCenter', styles.loader)}>
                    <Loader size="big"/>
                </div>
            )}
            <CategoriesLayout mode={mode}
                              path={path}
                              rows={rows}
                              isLoading={loading}
                              isStructured={isStructured}
                              totalCount={totalCount}
                              revealPath={pathToReveal}
            />
        </div>
    );
};

export default CategoriesLayoutContainer;
