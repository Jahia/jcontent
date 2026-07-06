import {useEffect, useState} from 'react';
import {useQuery} from '@apollo/client';
import {useSelector} from 'react-redux';
import {OpenInActionQuery} from '~/JContent/actions/openInAction/openInAction.gql-queries';
import {setRefetcher, unsetRefetcher} from '~/JContent/JContent.refetches';
import JContentConstants from '~/JContent/JContent.constants';

const STORAGE_KEY = JContentConstants.localStorageKeys.liveServerName;

export const useOpenInLiveData = path => {
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
    const serverName = node?.site?.serverName;
    const serverNameAliases = node?.site?.additionalServerNames?.values ?? [];

    const [selectedServerName, setSelectedServerName] = useState(
        () => localStorage.getItem(STORAGE_KEY) || null
    );

    useEffect(() => {
        if (!serverName) {
            return;
        }

        const allNames = [serverName, ...serverNameAliases];
        const stored = localStorage.getItem(STORAGE_KEY);
        const effective = stored && allNames.includes(stored) ? stored : serverName;

        if (effective !== selectedServerName) {
            setSelectedServerName(effective);
        }

        if (effective !== stored) {
            localStorage.setItem(STORAGE_KEY, effective);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverName, serverNameAliases.join(',')]);

    const selectServerName = name => {
        localStorage.setItem(STORAGE_KEY, name);
        setSelectedServerName(name);
    };

    const isVisible = !loading && !error && Boolean(node) &&
        (node.previewAvailable || node.displayableNode !== null) &&
        node.publicationInfo.existsInLive &&
        node.publicationInfo.status !== 'NOT_PUBLISHED' &&
        node.publicationInfo.status !== 'UNPUBLISHED';

    const currentHostname = globalThis.location.hostname;
    const isHostnameInList = [serverName, ...serverNameAliases].includes(currentHostname);
    return {
        selectedServerName,
        selectServerName,
        liveData: isVisible ? {
            urlPath: node.renderUrl,
            serverName,
            serverNameAliases,
            currentHostname: isHostnameInList ? null : currentHostname
        } : null
    };
};
