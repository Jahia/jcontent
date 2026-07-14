import React from 'react';
import classNames from 'clsx';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/client';
import {Paper} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import styles from '../Preview.scss';

const EMPTY_LIST_QUERY = gql`
    query PreviewEmptyListCheck($path: String!) {
        jcr {
            nodeByPath(path: $path) {
                uuid
                workspace
                primaryNodeType {
                    name
                    hasOrderableChildNodes
                }
                previewSubNodes: children(typesFilter: {types: ["jnt:file", "jnt:folder", "jnt:content", "jnt:contentFolder"], multi: ANY}) {
                    pageInfo {
                        totalCount
                    }
                }
            }
        }
    }
`;

const EmptyListComponent = () => {
    const {t} = useTranslation('jcontent');
    return (
        <div className={classNames(styles.noPreviewContainer, styles.contentContainer)}>
            <Paper elevation={1} className={styles.contentContainer} classes={{root: styles.center}}>
                <Typography variant="heading" weight="light">
                    {t('jcontent:label.contentManager.contentPreview.emptyList')}
                </Typography>
            </Paper>
        </div>
    );
};

export const useEmptyListComponent = (node, mode) => {
    const skip = mode !== 'pages' ||
        !node ||
        node.isPage ||
        !node.pageAncestors?.length;

    const {data, loading} = useQuery(EMPTY_LIST_QUERY, {
        variables: {path: node?.path},
        skip
    });

    if (skip) {
        return {loading: false, component: null};
    }

    if (loading) {
        return {loading: true, component: null};
    }

    const result = data?.jcr?.nodeByPath;
    const component = result?.primaryNodeType?.hasOrderableChildNodes && result?.previewSubNodes?.pageInfo?.totalCount === 0 ?
        <EmptyListComponent/> :
        null;

    return {loading: false, component};
};

export default EmptyListComponent;
