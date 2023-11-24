import {useApolloClient} from '@apollo/client';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {getNewNodePath, isDescendantOrSelf} from '~/JContent/JContent.utils';
import {cmClosePaths, cmGoto, cmOpenPaths} from '~/JContent/redux/JContent.redux';
import {cmSetPreviewSelection} from '~/JContent/redux/preview.redux';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';

export const useRefreshTreeAfterMove = () => {
    const client = useApolloClient();
    const dispatch = useDispatch();

    const {treePath, openedPaths, previewSelection} = useSelector(state => ({
        treePath: state.jcontent.path,
        openedPaths: state.jcontent.openPaths,
        previewSelection: state.jcontent.previewSelection
    }), shallowEqual);

    return (path, nodes, moveResults) => {
        // Let's make sure the content table will be refreshed when displayed
        client.cache.flushNodeEntryByPath(path);
        nodes.map(nodeToPaste => nodeToPaste.path.substring(0, nodeToPaste.path.lastIndexOf('/'))).forEach(p => client.cache.flushNodeEntryByPath(p));

        const pathsToClose = openedPaths.filter(openedPath => nodes.reduce((acc, pastedNode) => acc || isDescendantOrSelf(openedPath, pastedNode.path), false));
        if (pathsToClose.length > 0) {
            dispatch(cmClosePaths(pathsToClose));
            const pathsToReopen = pathsToClose.map(pathToReopen => nodes.reduce((acc, pastedNode) => getNewNodePath(acc, pastedNode.path, moveResults[pastedNode.uuid].path), pathToReopen));
            if (pathsToReopen.indexOf(path) === -1) {
                pathsToReopen.push(path);
            }

            dispatch(cmOpenPaths(pathsToReopen));
        }

        nodes.forEach(pastedNode => {
            if (pastedNode.path === treePath) {
                dispatch(cmGoto({path: moveResults[pastedNode.uuid].path, params: {sub: false}}));
            }

            if (pastedNode.path === previewSelection) {
                dispatch(cmSetPreviewSelection(null));
            }
        });

        triggerRefetchAll();
    };
};
