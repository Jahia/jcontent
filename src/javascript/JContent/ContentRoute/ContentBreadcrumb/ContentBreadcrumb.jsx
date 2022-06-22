import React from 'react';

import styles from './ContentBreadcrumb.scss';
import ContentPath from './ContentPath';
import ContentType from './ContentType';

const ContentBreadcrumb = () => {
    return (
        <div className={styles.contentBreadcrumb} data-sel-role="breadcrumb">
            <ContentPath/>
            <ContentType/>
        </div>
    );
};

export default ContentBreadcrumb;
