import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/react-hooks';
import {OpenInLiveActionQuery} from '~/JContent/actions/openInLiveAction/openInLiveAction.gql-queries';
import {shallowEqual, useSelector} from 'react-redux';

export const OpenInLiveActionComponent = ({
    render: Render,
    loading: Loading,
    path,
    ...others
}) => {
    const {language} = useSelector(state => ({
        language: state.language
    }), shallowEqual);
    let livePath = path;
    const {data, error, loading} = useQuery(OpenInLiveActionQuery, {
        variables: {
            path: path,
            language: language
        },
        skip: !path
    });

    if (loading || error || !data || !data.jcr.result.publicationInfo.existsInLive || data.jcr.result.publicationInfo.status === 'NOT_PUBLISHED' || data.jcr.result.publicationInfo.status === 'UNPUBLISHED') {
        return <></>;
    }

    if (!data.jcr.result.previewAvailable && data.jcr.result.displayableNode.previewAvailable) {
        livePath = data.jcr.result.displayableNode.path;
    }

    return (
        <Render
            {...others}
            onClick={() => {
                window.open(`${window.contextJsParameters.baseUrl.replace(/\/default\//, '/live/')}${livePath}.html`, '_blank');
            }}
        />
    );
};

OpenInLiveActionComponent.propTypes = {
    path: PropTypes.string,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};

export const openInLiveAction = {
    component: OpenInLiveActionComponent
};
