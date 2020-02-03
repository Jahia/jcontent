import React from 'react';
import {connect} from 'react-redux';
import {cmGoto} from '../JContent.redux-actions';
import ContentNavigation from './ContentNavigation';
import PropTypes from 'prop-types';
import {useParams} from 'react-router';

const ContentNavigationContainer = ({handleNavigation}) => {
    const {mode} = useParams();
    return <ContentNavigation handleNavigation={handleNavigation} mode={mode}/>;
};

const mapDispatchToProps = dispatch => ({
    handleNavigation: (mode, path) => dispatch(cmGoto({mode, path}))
});

ContentNavigationContainer.propTypes = {
    handleNavigation: PropTypes.func.isRequired
};

export default connect(null, mapDispatchToProps)(ContentNavigationContainer);
