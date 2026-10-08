import {useEffect, useState} from 'react';
import {useQuery} from '@apollo/client';
import {useSelector} from 'react-redux';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';
import {setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import {resolveEffectiveSite} from '~/JContent/JContent.utils';
import JContentConstants from '~/JContent/JContent.constants';

const STORAGE_KEY = JContentConstants.localStorageKeys.liveServerName;

export const useOpenInLiveData = (path, siteKey) => {
    const language = useSelector(state => state.language);
    const {data, loading, error, refetch} = useQuery(OpenInActionQuery, {
        variables: {path, language, workspace: 'LIVE'},
        fetchPolicy: 'cache-and-network',
        skip: !path
    });

    useEffect(() => {
        setRefetcher('openInLive', {refetch});
        return () => unsetRefetcher('openInLive');
    }, [refetch]);

    const node = data?.jcr?.result;
    const currentHostname = globalThis.location.hostname;
    const allSites = data?.jcr?.allSites?.siteNodes ?? [];

    // Resolve the site that should drive the link once (the selected site in a shared-content
    // context, otherwise the node's own site), then use its names for both the menu and the
    // guards below.
    const {effectiveSite} = resolveEffectiveSite(node, allSites, siteKey, currentHostname);
    const effectiveServerName = effectiveSite?.serverName;
    const effectiveServerNameAliases = effectiveSite?.additionalServerNames?.values ?? [];
    const effectiveNames = new Set([effectiveServerName, ...effectiveServerNameAliases].filter(Boolean));

    const [selectedServerName, setSelectedServerName] = useState(
        () => localStorage.getItem(STORAGE_KEY) || null
    );

    useEffect(() => {
        if (!effectiveServerName) {
            return;
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        const effective = stored && effectiveNames.has(stored) ? stored : effectiveServerName;

        if (effective !== selectedServerName) {
            setSelectedServerName(effective);
        }

        if (effective !== stored) {
            localStorage.setItem(STORAGE_KEY, effective);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveServerName, effectiveServerNameAliases.join(','), siteKey]);

    const selectServerName = name => {
        localStorage.setItem(STORAGE_KEY, name);
        setSelectedServerName(name);
    };

    const isVisible = !loading && !error && Boolean(node) &&
        (node.previewAvailable || node.displayableNode !== null) &&
        node.publicationInfo.existsInLive &&
        node.publicationInfo.status !== 'NOT_PUBLISHED' &&
        node.publicationInfo.status !== 'UNPUBLISHED';

    // Guards run against the EFFECTIVE site's names and path (not the node's), so the shared
    // context is re-checked rather than bypassed.
    // Guard 1: hostname already in this site's names (no duplicate "Current domain").
    const isHostnameInCurrentSite = effectiveNames.has(currentHostname);

    // Guard 2: hostname is already claimed by a different site — Jahia would resolve that other
    // site's context instead, opening the wrong site.
    const isHostnameClaimedByAnotherSite = allSites.some(site =>
        site.site?.path !== effectiveSite?.path &&
        [site.site?.serverName, ...(site.site?.additionalServerNames?.values ?? [])].includes(currentHostname)
    );

    return {
        selectedServerName,
        selectServerName,
        liveData: isVisible ? {
            urlPath: node.renderUrl,
            serverName: effectiveServerName,
            serverNameAliases: effectiveServerNameAliases,
            currentHostname: (isHostnameInCurrentSite || isHostnameClaimedByAnotherSite) ? null : currentHostname
        } : null
    };
};
