import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';
import {useSelector} from 'react-redux';
import {setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {resolveUrlForLiveOrPreview} from '../../JContent.utils';

export const OpenInLiveActionComponent = props => <OpenInActionComponent isLive {...props}/>;
export const OpenInPreviewActionComponent = props => <OpenInActionComponent {...props}/>;

const OpenInActionComponent = ({
    isLive = false,
    render: Render,
    path,
    ...others
}) => {
    const language = useSelector(state => state.language);
    const res = useQuery(OpenInActionQuery, {
        variables: {
            path: path,
            language: language,
            workspace: isLive ? 'LIVE' : 'EDIT'
        },
        skip: !path
    });

    useEffect(() => {
        setRefetcher('openInLive', {
            refetch: res.refetch
        });

        return () => unsetRefetcher('openInLive');
    }, [res.refetch]);

    const node = res?.data?.jcr.result;
    if (res.loading || res.error || !res.data ||
        (!node.previewAvailable && node.displayableNode === null)) {
        return false;
    }

    if (isLive && (!node.publicationInfo.existsInLive ||
        node.publicationInfo.status === 'NOT_PUBLISHED' ||
        node.publicationInfo.status === 'UNPUBLISHED')) {
        return false;
    }

    const urlPath = node.renderUrl;

    return (
        <Render
            {...others}
            onClick={() => {
                const url = resolveUrlForLiveOrPreview(urlPath, isLive, node.site.serverName);
                window.open(url, '_blank');
            }}
        />
    );
};

OpenInActionComponent.propTypes = {
    isLive: PropTypes.bool,
    path: PropTypes.string,
    render: PropTypes.func.isRequired
};

export const openInAction = {
    component: OpenInLiveActionComponent
};
