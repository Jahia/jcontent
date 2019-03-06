import React from 'react';
import PropTypes from 'prop-types';
import {compose, Mutation, Query} from 'react-apollo';
import {connect} from 'react-redux';
import ImageEdition from './ImageEdition';
import {ImageQuery} from './ImageEdition.gql-queries';
import {getImageMutation} from './ImageEdition.gql-mutations';

class ImageEditionContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rotations: 0,
            width: null,
            height: null,
            transforms: []
        };

        this.rotate = this.rotate.bind(this);
        this.undoChanges = this.undoChanges.bind(this);
        this.resize = this.resize.bind(this);
    }

    rotate(val) {
        this.setState(state => ({
            rotations: (state.rotations + val + 4) % 4,
            transforms: ([...state.transforms, {
                op: 'rotateImage',
                args: {
                    angle: val * 90
                }
            }])
        }));
    }

    resize({width, height}) {
        this.setState(state => ({
            width,
            height,
            transforms: ([...state.transforms, {
                op: 'resizeImage',
                args: {
                    height: height,
                    width: width
                }
            }])
        }));
    }

    undoChanges() {
        this.setState(() => ({
            rotations: 0,
            width: null,
            height: null,
            transforms: []
        }));
    }

    render() {
        const {path} = this.props;
        const {rotations, width, height, transforms} = this.state;
        return (
            <Mutation mutation={getImageMutation(transforms)}>
                {mutation => {
                    return (
                        <Query query={ImageQuery} variables={{path: path}}>
                            {({data, loading}) => {
                                if (!loading && data.jcr) {
                                    return (
                                        <ImageEdition node={data.jcr.nodeByPath}
                                                      rotations={rotations}
                                                      width={width}
                                                      height={height}
                                                      rotate={this.rotate}
                                                      resize={this.resize}
                                                      undoChanges={this.undoChanges}
                                                      saveChanges={() => mutation({variables: {path}})}
                                        />
                                    );
                                }
                                return false;
                            }}
                        </Query>
                    );
                }}
            </Mutation>
        );
    }
}

ImageEditionContainer.propTypes = {
    path: PropTypes.string.isRequired
};

let mapStateToProps = state => ({
    path: state.path
});

export default compose(
    connect(mapStateToProps, null),
)(ImageEditionContainer);
