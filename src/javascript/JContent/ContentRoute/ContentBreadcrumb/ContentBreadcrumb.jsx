import React from 'react';
import PropTypes from 'prop-types';
import styles from './ContentBreadcrumb.scss';
import ContentPath from './ContentPath';
import ContentType from './ContentType';

const ContentBreadcrumb = ({externalPath}) => {
    return (
        <div className={styles.contentBreadcrumb} data-sel-role="breadcrumb">
            <ContentPath externalPath={externalPath}/>
            <ContentType externalPath={externalPath}/>
        </div>
    );
};

ContentBreadcrumb.defaultProps = {
    externalPath: ''
};

ContentBreadcrumb.propTypes = {
    externalPath: PropTypes.string
};

export default ContentBreadcrumb;
