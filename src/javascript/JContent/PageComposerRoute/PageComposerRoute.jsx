import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ContentRoute from '../ContentRoute';
import MainLayout from '../MainLayout';
import ContentHeader from '../ContentHeader';
import JContentConstants from '../JContent.constants';
import {ErrorBoundary, Error404, LoaderSuspense} from '@jahia/jahia-ui-root';
import {EditFrame} from './EditFrame';
import {useNodeInfo} from '@jahia/data-helper';
import {setTableViewMode} from '../redux/tableView.redux';

export const PageComposerRoute = () => {
    const viewMode = useSelector(state => state.jcontent.tableView.viewMode);

    const path = useSelector(state => state.jcontent.path);
    const nodeTypes = ['jnt:page', 'jmix:mainResource'];
    const res = useNodeInfo({path}, {getIsNodeTypes: nodeTypes});

    const dispatch = useDispatch();

    const shouldSwitchMode = !res.loading && res.node !== undefined && !nodeTypes.some(nt => res.node[nt]);

    useEffect(() => {
        if (shouldSwitchMode) {
            dispatch(setTableViewMode(JContentConstants.tableView.viewMode.FLAT));
            window.localStorage.setItem(JContentConstants.localStorageKeys.viewMode, JContentConstants.tableView.viewMode.FLAT);
        }
    }, [shouldSwitchMode, dispatch]);

    if (res.loading) {
        return false;
    }

    const pageComposer = (JContentConstants.tableView.viewMode.PAGE_COMPOSER === viewMode || JContentConstants.tableView.viewMode.PREVIEW === viewMode);
    if(res.node === undefined || res.error ) {
        return <Error404/>
    }
    if (pageComposer) {
        return (
            <MainLayout header={<ContentHeader/>}>
                <LoaderSuspense>
                    <ErrorBoundary>
                        <EditFrame isPreview={JContentConstants.tableView.viewMode.PREVIEW === viewMode}/>
                    </ErrorBoundary>
                </LoaderSuspense>
            </MainLayout>
        );
    }

    return <ContentRoute/>;
};

export default PageComposerRoute;
