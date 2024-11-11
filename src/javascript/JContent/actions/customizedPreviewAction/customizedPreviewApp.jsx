import React from 'react';
import {Header, LayoutContent, Loading} from '@jahia/moonstone';
import {useSelector} from 'react-redux';
import {Dialog} from '@material-ui/core';
import {DisplayAction} from '@jahia/ui-extender';
import {ButtonRendererShortLabel} from '~/ContentEditor/utils';
import {useQuery} from '@apollo/client';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';

const CustomizedPreviewHeader = ({user, date, channel}) => {
    const path = useSelector(state => state.jcontent.path);
    return (
        <Header
            title={`User: ${user} | Date: ${date} | Channel: ${channel}`}
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

    const {user, channel, date} = params.openDialog.params;
    return (
        <Dialog fullScreen open>
            <LayoutContent
                header={<CustomizedPreviewHeader {...params.openDialog?.params}/>}
                content={
                    (renderUrl) ?
                        (<iframe src={`${renderUrl}?channel=${channel}&date=${date}&user=${user}`} width="100%" height="100%" />)
                        : (<div>No preview to render</div>)
                }
            />
        </Dialog>
    );
}
