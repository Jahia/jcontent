import React from 'react';
import PropTypes from 'prop-types';
import {Query, withApollo, compose} from 'react-apollo';
import {connect} from 'react-redux';
import ImageEdition from './ImageEdition';
import {ImageQuery} from './ImageEdition.gql-queries';

const ImageEditionContainer = ({path, client}) => (
    <Query query={ImageQuery} variables={{path: path}}>
        {
            ({data, loading}) => {
                if (!loading && data.jcr) {
                    return <ImageEdition client={client} node={data.jcr.nodeByPath}/>;
                }
                return false;
            }
        }
    </Query>
);

ImageEditionContainer.propTypes = {
    client: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired
};

let mapStateToProps = state => ({
    path: state.path
});

export default compose(
    connect(mapStateToProps, null),
    withApollo
)(ImageEditionContainer);
