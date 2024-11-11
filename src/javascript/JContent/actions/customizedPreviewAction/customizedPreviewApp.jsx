import React from 'react';
import {Header, LayoutContent, Loading, Typography} from '@jahia/moonstone';
import {useSelector} from 'react-redux';
import {Dialog} from '@material-ui/core';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRendererShortLabel} from '~/ContentEditor/utils';
import {useQuery} from '@apollo/client';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';
import dayjs from 'dayjs';

const CustomizedPreviewHeader = ({user, date, channel}) => {
    const path = useSelector(state => state.jcontent.path);
    return (
        <Header
            title={`User: ${user} | Date: ${dayjs(date).format('YYYY-MMM-DD')} | Channel: ${channel}`}
            mainActions={
                <DisplayAction
                    actionKey="customizedPreview"
                    path={path}
                    render={ButtonRendererShortLabel}
                    buttonProps={{size: 'big', color: 'accent'}}
                />
            }
        />
    );

}

const getParamsStr = ({user, date, channel, variant}) => {
    const toParamStr = (name, val) => val ? `${name}=${val}` : '';
    let paramsStr = [
        toParamStr('alias', user),
        toParamStr('prevdate', date),
        toParamStr('channel', channel),
        toParamStr('variant', variant),
    ].join('&');
    return paramsStr ? `?${paramsStr}` : '';
}

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
                        (<iframe src={`${renderUrl}${urlParams}`} width="100%" height="100%" />)
                        : (<Typography variant="heading">No preview to render</Typography>)
                }
            />
        </Dialog>
    );
}
