import React from 'react';
import {LayoutContent, Loading, Typography} from '@jahia/moonstone';
import {useSelector} from 'react-redux';
import {Dialog} from '@material-ui/core';
import {useQuery} from '@apollo/client';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';

import styles from './customizedPreview.scss';
import {CustomizedPreviewHeader} from './customizedPreviewHeader';
import {CustomizedPreviewContextProvider} from './customizedPreview.context';

/**
 * Helper method to only add params if they are not empty
 */
const getUrlParamsStr = ({user, date, channel, variant}) => {
    const toParamStr = (name, val) => val ? `${name}=${val}` : '';
    let paramsStr = [
        toParamStr('alias', user),
        toParamStr('prevdate', date),
        toParamStr('channel', channel),
        toParamStr('variant', variant)
    ].join('&');
    return paramsStr ? `?${paramsStr}` : '';
};

const CustomizedPreviewAppContainer = () => (
    <CustomizedPreviewContextProvider>
        <CustomizedPreviewApp/>
    </CustomizedPreviewContextProvider>
);

const CustomizedPreviewApp = () => {
    const [path, language, params] = useSelector(state => [
        state.jcontent.path,
        state.language,
        state.jcontent.params || {}
    ]);

    const res = useQuery(OpenInActionQuery, {
        variables: {path, language, workspace: 'EDIT'},
        skip: !path
    });

    if (params.openDialog?.key !== 'customizedPreview') {
        return null;
    }

    if (res.loading) {
        return (<Dialog fullScreen open><Loading/></Dialog>);
    }

    const node = res?.data?.jcr.result;
    const renderUrl = !res.error && (node?.previewAvailable || node?.displayableNode !== null) && node.renderUrl;
    const urlParams = getUrlParamsStr(params.openDialog.params);
    return (
        <Dialog fullScreen open>
            <LayoutContent
                header={<CustomizedPreviewHeader {...params.openDialog?.params}/>}
                content={
                    (renderUrl) ?
                        (<iframe className={styles.iframe} src={`${renderUrl}${urlParams}`}/>) :
                        (<Typography variant="heading">No preview to render</Typography>)
                }
            />
        </Dialog>
    );
};

export {CustomizedPreviewAppContainer as CustomizedPreviewApp};
