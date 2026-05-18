import React, {useCallback, useMemo, useState} from 'react';
import {useApolloClient, useQuery} from '@apollo/client';
import {shallowEqual, useSelector} from 'react-redux';
import {useNodeInfo} from '@jahia/data-helper';
import {Header, LayoutContent} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {GET_MANAGED_TAGS} from './TagManager.gql-queries';
import {TagManagerTable} from './TagManagerTable';
import {TagManagerDrawer} from './TagManagerDrawer';
import {useTagFilter} from './useTagFilter';
import {refetchTypes, triggerRefetch} from '~/JContent/JContent.refetches';
import styles from './TagManager.scss';

export const TagManager = () => {
    const {t} = useTranslation('jcontent');
    const client = useApolloClient();
    const {siteKey, uilang} = useSelector(state => ({
        siteKey: state.site,
        uilang: state.uilang
    }), shallowEqual);
    const {node: siteNode} = useNodeInfo(
        {path: `/sites/${siteKey}`, language: uilang},
        {getDisplayName: true}
    );

    const [selectedTag, setSelectedTag] = useState(null);

    const {data, loading, error, refetch} = useQuery(GET_MANAGED_TAGS, {
        variables: {siteKey},
        fetchPolicy: 'cache-and-network'
    });

    const tags = useMemo(() => data?.admin?.jahia?.tagManager?.tags?.nodes || [], [data]);

    const {searchTerm, setSearchTerm, normalizedSearch, sort, setSort, filteredTags, sortedTags} = useTagFilter(tags);

    const refreshAfterMutation = useCallback(async () => {
        await refetch();
        await client.reFetchObservableQueries();
        triggerRefetch(refetchTypes.CONTENT_DATA);
        triggerRefetch(refetchTypes.CONTENT_TREE);
    }, [client, refetch]);

    const siteName = siteNode?.displayName || siteKey;

    return (
        <LayoutContent
            data-cm-role="tag-manager-root"
            hasPadding
            header={<Header title={t('jcontent:label.contentManager.tagManager.header', {siteName})}/>}
            content={
                <div className={styles.contentWrapper} data-cm-role="tag-manager-content-wrapper">
                    <TagManagerTable
                        siteKey={siteKey}
                        siteName={siteName}
                        tags={sortedTags}
                        totalCount={filteredTags.length}
                        selectedTag={selectedTag}
                        loading={loading}
                        error={error}
                        searchTerm={searchTerm}
                        normalizedSearch={normalizedSearch}
                        sort={sort}
                        onSearchChange={setSearchTerm}
                        onSort={setSort}
                        onView={tag => setSelectedTag(tag.name)}
                        onTagRenamed={(oldName, newName) => {
                            if (selectedTag === oldName) {
                                setSelectedTag(newName);
                            }
                        }}
                        onTagDeleted={name => {
                            if (selectedTag === name) {
                                setSelectedTag(null);
                            }
                        }}
                        onMutationComplete={refreshAfterMutation}
                    />

                    <TagManagerDrawer
                        siteKey={siteKey}
                        tag={selectedTag}
                        isOpen={Boolean(selectedTag)}
                        onClose={() => setSelectedTag(null)}
                        onMutationComplete={refreshAfterMutation}
                    />
                </div>
            }
        />
    );
};

export default TagManager;
