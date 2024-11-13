import React from 'react';
import {Calendar, Group, Header, IconTextIcon, LayoutContent, Loading, Typography, WebPage} from '@jahia/moonstone';
import {useSelector} from 'react-redux';
import {Dialog} from '@material-ui/core';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRendererShortLabel} from '~/ContentEditor/utils';
import {useQuery} from '@apollo/client';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';

import dayjs from 'dayjs';
import styles from './customizedPreview.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const CustomizedPreviewHeader = ({user, date, channel, variant}) => {
    const path = useSelector(state => state.jcontent.path);

    // TODO get channel and variant labels for display
    return (
        <Header
            className={styles.header}
            title={
                <div className={clsx('flexRow_nowrap', styles.headerItems)}>
                    <DisplayAction
                        className={styles.headerItem}
                        actionKey="customizedPreview"
                        path={path}
                        render={ButtonRendererShortLabel}
                        buttonProps={{isReversed: true, variant: 'outlined'}}
                    />
                    <IconTextIcon className={styles.headerItem} iconStart={<Group/>}>{user}</IconTextIcon>
                    <IconTextIcon className={styles.headerItem} iconStart={<Calendar/>}>{dayjs(date).format('DD / MMM / YYYY')}</IconTextIcon>
                    <IconTextIcon className={styles.headerItem} iconStart={<WebPage/>}>{channel}{variant ? `- ${variant}` : ''}</IconTextIcon>
                </div>
            }
        />
    );
};

CustomizedPreviewHeader.propTypes = {
    user: PropTypes.string,
    date: PropTypes.object,
    channel: PropTypes.string,
    variant: PropTypes.string
};

const getParamsStr = ({user, date, channel, variant}) => {
    const toParamStr = (name, val) => val ? `${name}=${val}` : '';
    let paramsStr = [
        toParamStr('alias', user),
        toParamStr('prevdate', date),
        toParamStr('channel', channel),
        toParamStr('variant', variant)
    ].join('&');
    return paramsStr ? `?${paramsStr}` : '';
};

export const CustomizedPreviewApp = () => {
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
    const urlParams = getParamsStr(params.openDialog.params);
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
