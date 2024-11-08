import React from 'react';
import PropTypes from 'prop-types';
import styles from './PageHeader.scss';
import {shallowEqual, useSelector} from 'react-redux';

export const PageHeader = ({value}) => {
    const {path} = useSelector(state => ({
        path: state.jcontent.path
    }), shallowEqual);

    // Only display the page header if the path is /sites/pageHeader/home
    if (path !== '/sites/pageHeader/home') {
        return null;
    }

    return (<div className={styles.root}>{value}</div>);
};

PageHeader.propTypes = {
    value: PropTypes.string.isRequired
};
