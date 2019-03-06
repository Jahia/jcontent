import React from 'react';
import {TwoColumnsContent, MainLayout} from '@jahia/layouts';
import {Typography} from '@jahia/ds-mui-theme';
import ImageEditionPreview from './ImageEditionPreview';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import RotatePanel from './RotatePanel';
import ResizePanel from './ResizePanel';

let styles = () => ({
    left: {
        overflow: 'auto'
    },
    right: {
        justifyContent: 'center'
    }
});

export class ImageEdition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rotate: 0,
            width: 800,
            height: 600
        };
        this.rotateLeft = this.rotateLeft.bind(this);
        this.rotateRight = this.rotateRight.bind(this);
        this.undoRotationChanges = this.undoRotationChanges.bind(this);
        this.resize = this.resize.bind(this);
    }

    rotateLeft() {
        let {rotate} = this.state;
        if (rotate === 0) {
            this.setState({
                rotate: 3
            });
        } else {
            this.setState({
                rotate: rotate - 1
            });
        }
    }

    rotateRight() {
        let {rotate} = this.state;
        if (rotate === 3) {
            this.setState({
                rotate: 0
            });
        } else {
            this.setState({
                rotate: rotate + 1
            });
        }
    }

    undoRotationChanges() {
        this.setState({
            rotate: 0
        });
    }

    resize({width, height}) {
        this.setState({width, height});
    }

    render() {
        const {t, classes, path} = this.props;
        const {rotate, height, width} = this.state;
        let originalWidth = 800;
        let originalHeight = 600;

        let dirty = (rotate !== 0) || (originalWidth !== width) || (originalHeight !== height);

        let changesFeedback = dirty ? t('label.contentManager.editImage.unsavedChanges') : '';

        return (
            <MainLayout topBarProps={{
                path: t('label.contentManager.appTitle', {path: ''}),
                title: t('label.contentManager.editImage.title'),
                contextModifiers: <React.Fragment></React.Fragment>,
                actions: (
                    <React.Fragment>
                        <Typography variant="omega" color="invert">
                            {changesFeedback}
                        </Typography>
                    </React.Fragment>
                )
            }}
            >
                <TwoColumnsContent classes={{left: classes.left, right: classes.right}} rightCol={<ImageEditionPreview rotate={rotate} path={path}/>}>
                    <RotatePanel rotateLeft={this.rotateLeft}
                                 rotateRight={this.rotateRight}
                                 undoChanges={this.undoRotationChanges}
                    />
                    <ResizePanel originalWidth={800}
                                 originalHeight={600}
                                 width={width}
                                 height={height}
                                 resize={this.resize}
                    />
                </TwoColumnsContent>
            </MainLayout>
        );
    }
}

let mapStateToProps = state => ({
    path: state.path
});

export default compose(
    connect(mapStateToProps, null),
    translate(),
    withStyles(styles)
)(ImageEdition);
