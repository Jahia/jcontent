import React from 'react';
import {LayoutContent, Loading, Typography} from '@jahia/moonstone';
import {useSelector} from 'react-redux';
import {Dialog} from '@material-ui/core';
import {useQuery} from '@apollo/client';
import {useTranslation} from 'react-i18next';

import {resolveUrlForLiveOrPreview} from '~/JContent/JContent.utils';
import {useChannelData} from '~/JContent/actions/customizedPreviewAction/useChannelData';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';
import {CustomizedPreviewHeader} from './customizedPreviewHeader';
import styles from './customizedPreview.scss';

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
    ].filter(Boolean).join('&');
    return paramsStr ? `?${paramsStr}` : '';
};

const useIframeDimensions = ({channel, variant} = {}) => {
    const {getVariant} = useChannelData();
    const variantData = getVariant(channel, variant);
    const {width, height} = variantData?.imageSize || {};

    // We need to add both sizes padding - 8px * 2
    const bodyPadding = 16;
    return {
        width: Number(width) + bodyPadding || '100%',
        height: Number(height) + bodyPadding || '100%'
    };
};

export const CustomizedPreviewApp = () => {
    const {t} = useTranslation('jcontent');
    const {path, language, params} = useSelector(state => ({
        path: state.jcontent.path,
        language: state.language,
        params: state.jcontent.params
    }));
    const {width, height} = useIframeDimensions(params?.openDialog?.params);
    const isCustomizedPreview = params?.openDialog?.key === 'customizedPreview';

    const res = useQuery(OpenInActionQuery, {
        variables: {path, language, workspace: 'EDIT'},
        skip: !path || !isCustomizedPreview
    });

    if (!isCustomizedPreview) {
        return null;
    }

    if (res.loading) {
        return (<Dialog fullScreen open><Loading/></Dialog>);
    }

    const node = res?.data?.jcr.result;
    const renderUrl = !res.error && (node?.previewAvailable || node?.displayableNode !== null) && node.renderUrl;
    const urlParams = getUrlParamsStr(params?.openDialog.params);

    return (
        <Dialog fullScreen open>
            <LayoutContent
                header={<CustomizedPreviewHeader {...params?.openDialog?.params}/>}
                content={
                    <div className={styles.iframeContainer}>
                        {(renderUrl) ?
                            (<iframe data-sel-role="customized-preview-iframe" width={width} height={height} src={`${resolveUrlForLiveOrPreview(renderUrl)}${urlParams}`}/>) :
                            (
                                <Typography variant="title">
                                    {t('jcontent:label.contentManager.actions.customizedPreview.noRenderUrl')}
                                </Typography>
                            )}
                    </div>
                }
            />
        </Dialog>
    );
};
