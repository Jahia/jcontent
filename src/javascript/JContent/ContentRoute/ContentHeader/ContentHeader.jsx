import React from 'react';
import PropTypes from 'prop-types';
import {Separator} from '@jahia/moonstone';
import styles from './ContentHeader.scss';

const ContentHeader = ({title, mainAction, breadcrumb, information, toolbar}) => (
    <header className={styles.root}>
        <div className="flexRow_nowrap">
            {title}
            {mainAction}
        </div>
        <div className="flexRow_nowrap">
            {breadcrumb &&
            breadcrumb}
            {information &&
            information}
        </div>
        {toolbar &&
            <>
                <Separator/>
                {toolbar}
            </>}
    </header>
);

ContentHeader.propTypes = {
    title: PropTypes.node.isRequired,
    mainAction: PropTypes.node.isRequired,
    breadcrumb: PropTypes.node,
    information: PropTypes.node,
    toolbar: PropTypes.node
};

ContentHeader.defaultProps = {
    breadcrumb: null,
    information: null,
    toolbar: null
};

export default ContentHeader;
