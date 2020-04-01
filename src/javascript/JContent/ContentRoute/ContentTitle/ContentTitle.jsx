import React from 'react';
import classnames from 'clsx';
import {Typography} from '@jahia/moonstone';
import styles from './ContentTitle.scss';
import {useSelector} from 'react-redux';
import {useNodeInfo} from '@jahia/data-helper';

const ContentTitle = () => {
    const {path, language} = useSelector(state => ({
        path: state.jcontent.path,
        language: state.language
    }));

    const {loading, node} = useNodeInfo({path: path, language: language}, {getDisplayName: true});

    return (
        <div className={classnames(styles.root, 'alignCenter')} data-sel-role="title">
            <Typography variant="title" style={{opacity: loading ? 0 : 1}}>
                {(!loading && node && node.displayName) || 'Loading ...'}
            </Typography>
        </div>
    );
};

export default ContentTitle;
