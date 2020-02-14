import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import ContentTitle from './ContentTitle';

const ContentTitleContainer = ({path}) => {
    const title = path.substring(path.lastIndexOf('/') + 1);
    return (
        <ContentTitle title={title}/>
    );
};

const mapStateToProps = state => ({
    path: state.jcontent.path
});

ContentTitleContainer.propTypes = {
    path: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(ContentTitleContainer);
