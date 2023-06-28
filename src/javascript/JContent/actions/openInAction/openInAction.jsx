import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';
import {shallowEqual, useSelector} from 'react-redux';
import {setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';

export const OpenInLiveActionComponent = props => <OpenInActionComponent isLive {...props}/>;
export const OpenInPreviewActionComponent = props => <OpenInActionComponent {...props}/>;

const OpenInActionComponent = ({
    isLive = false,
    render: Render,
    path,
    ...others
}) => {
    const {language} = useSelector(state => ({
        language: state.language
    }), shallowEqual);
    let urlPath = path;
    const res = useQuery(OpenInActionQuery, {
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

    if (!node.previewAvailable && node.displayableNode.previewAvailable) {
        urlPath = node.displayableNode.path;
    }

    return (
        <Render
            {...others}
            onClick={() => {
                let baseUrl = window.contextJsParameters.baseUrl;
                if (isLive) {
                    baseUrl = baseUrl.replace(/\/default\/[a-zA-Z_]{2,5}/, `/live/${language}`);
                } else {
                    baseUrl = baseUrl.replace(/\/default\/[a-zA-Z_]{2,5}/, `/default/${language}`);
                }

                window.open(`${baseUrl}${urlPath}.html`, '_blank');
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
