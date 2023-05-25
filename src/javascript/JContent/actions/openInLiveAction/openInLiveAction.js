import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {OpenInLiveActionQuery} from '~/JContent/actions/openInLiveAction/openInLiveAction.gql-queries';
import {shallowEqual, useSelector} from 'react-redux';
import {setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';

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
    const res = useQuery(OpenInLiveActionQuery, {
        variables: {
            path: path,
            language: language
        },
        skip: !path
    });

    useEffect(() => {
        setRefetcher('openInLive', {
            refetch: res.refetch
        });

        return () => unsetRefetcher('openInLive');
    }, [res.refetch]);

    if (res.loading || res.error || !res.data || !res.data.jcr.result.publicationInfo.existsInLive ||
        res.data.jcr.result.publicationInfo.status === 'NOT_PUBLISHED' ||
        res.data.jcr.result.publicationInfo.status === 'UNPUBLISHED' ||
        (!res.data.jcr.result.previewAvailable && res.data.jcr.result.displayableNode === null)) {
        return false;
    }

    if (!res.data.jcr.result.previewAvailable && res.data.jcr.result.displayableNode.previewAvailable) {
        livePath = res.data.jcr.result.displayableNode.path;
    }

    return (
        <Render
            {...others}
            onClick={() => {
                const baseURL = window.contextJsParameters.baseUrl.replace(/\/default\/[a-zA-Z_]{2,5}/, `/live/${language}`);
                window.open(`${baseURL}${livePath}.html`, '_blank');
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
