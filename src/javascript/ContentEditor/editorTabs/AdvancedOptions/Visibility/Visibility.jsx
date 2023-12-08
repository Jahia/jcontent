import React from 'react';
import {Channels} from './Channels/Channels';
import {Languages} from './Languages/Languages';
import {DateTime} from './DateTime/DateTime';
import styles from './Visibility.scss';
import {useContentEditorContext} from '~/ContentEditor/contexts';
import {useQuery} from '@apollo/client';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {VisibilityQuery} from '~/ContentEditor/editorTabs/AdvancedOptions/Visibility/Visibility.gql-queries';

export const Visibility = () => {
    const {nodeData} = useContentEditorContext();
    const {data, loading} = useQuery(VisibilityQuery, {
        variables: {
            path: nodeData.path
        },
        fetchPolicy: 'cache-and-network'
    });

    if (loading) {
        return <LoaderOverlay/>;
    }

    return <div className={styles.container}><Languages invalidLanguages={data.jcr.nodeByPath.invalidLanguages.values}/><DateTime rules={data.jcr.nodeByPath.children.nodes}/><Channels/></div>;
};
