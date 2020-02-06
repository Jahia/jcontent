import React from 'react';
import {connect} from 'react-redux';
import {cmGoto} from '../../JContent.redux-actions';
import ContentNavigation from './ContentNavigation';
import PropTypes from 'prop-types';

const ContentNavigationContainer = ({handleNavigation, mode}) => {
    return <ContentNavigation handleNavigation={handleNavigation} mode={mode}/>;
};

const mapDispatchToProps = dispatch => ({
    handleNavigation: (mode, path) => dispatch(cmGoto({mode, path}))
});

let mapStateToProps = state => ({
    mode: state.mode
});

ContentNavigationContainer.propTypes = {
    handleNavigation: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(ContentNavigationContainer);
