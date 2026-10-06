import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';
import {useSelector} from 'react-redux';
import {resolveUrlForLiveOrPreview} from '../../JContent.utils';

export const OpenInPreviewActionComponent = ({render: Render, path, ...others}) => {
    const language = useSelector(state => state.language);
    const siteKey = useSelector(state => state.site);
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
                const serverName = node.site.serverName;
                const serverNameAliases = node.site.additionalServerNames?.values ?? [];
                const allNames = [serverName, ...serverNameAliases];
                const currentHostname = globalThis.location.hostname;

                // Shared content site: the node resolves to a site that only uses localhost while
                // jContent is browsed from another domain. In that case the server (current) domain
                // renders the wrong site context, so use the currently selected site's serverName
                // instead — mirrors the Open in Live behavior.
                const isCurrentSiteLocalhostOnly = allNames.length === 1 && allNames.includes('localhost') && currentHostname !== 'localhost';
                const allSites = res.data?.jcr?.allSites?.siteNodes ?? [];
                const targetServerName = isCurrentSiteLocalhostOnly ?
                    allSites.find(site => site?.site.sitekey === siteKey)?.site.serverName :
                    serverName;

                const url = resolveUrlForLiveOrPreview(node.renderUrl, isCurrentSiteLocalhostOnly, targetServerName);
                window.open(url, '_blank');
            }}
        />
    );
};

OpenInPreviewActionComponent.propTypes = {
    path: PropTypes.string,
    render: PropTypes.func.isRequired
};
