import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';
import {useSelector} from 'react-redux';
import {resolveUrlForLiveOrPreview} from '../../JContent.utils';

export const OpenInPreviewActionComponent = ({render: Render, path, ...others}) => {
    const language = useSelector(state => state.language);
    const res = useQuery(OpenInActionQuery, {
        variables: {path, language, workspace: 'EDIT'},
        skip: !path
    });

    const node = res?.data?.jcr.result;
    if (res.loading || res.error || !res.data ||
        (!node.previewAvailable && node.displayableNode === null)) {
        return false;
    }

    return (
        <Render
            {...others}
            onClick={() => {
                const url = resolveUrlForLiveOrPreview(node.renderUrl, false, node.site.serverName);
                window.open(url, '_blank');
            }}
        />
    );
};

OpenInPreviewActionComponent.propTypes = {
    path: PropTypes.string,
    render: PropTypes.func.isRequired
};
