import React from 'react';
import PropTypes from 'prop-types';
import {TwoColumnsContent, MainLayout} from '@jahia/layouts';
import {Typography} from '@jahia/ds-mui-theme';
import ImageEditionPreview from './ImageEditionPreview';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {connect} from 'react-redux';
import RotatePanel from './RotatePanel';
import ResizePanel from './ResizePanel';

let styles = theme => ({
    left: {
        overflow: 'auto'
    },
    right: {
        justifyContent: 'center',
        background: theme.palette.ui.omega,
        paddingRight: theme.spacing.unit * 2
    }
});

export const PANELS = {
    ROTATE: 0,
    RESIZE: 1
};

export class ImageEdition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rotate: 0,
            width: 800,
            height: 600,
            transforms: [],
            expanded: PANELS.ROTATE
        };
        this.rotate = this.rotate.bind(this);
        this.undoChanges = this.undoChanges.bind(this);
        this.resize = this.resize.bind(this);
        this.onChangePanel = this.onChangePanel.bind(this);
    }

    rotate(val) {
        this.setState(state => ({
            rotate: (state.rotate + val + 4) % 4,
            transforms: ([...state.transforms, {
                op: 'rotate', value: val
            }])
        }));
    }

    undoChanges() {
        this.setState(() => ({
            rotate: 0,
            width: 800,
            height: 600,
            transforms: []
        }));
    }

    resize({width, height}) {
        this.setState(state => ({
            width,
            height,
            transforms: ([...state.transforms, {
                op: 'resize', width, height
            }])
        }));
    }

    onChangePanel(panel) {
        this.setState({
            expanded: panel
        });
    }

    render() {
        const {t, classes, path} = this.props;
        const {rotate, height, width, expanded} = this.state;
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
                    <RotatePanel defaultExpanded
                                 expanded={expanded === PANELS.ROTATE}
                                 rotate={this.rotate}
                                 undoChanges={this.undoChanges}
                                 onChangePanel={this.onChangePanel}
                    />
                    <ResizePanel originalWidth={800}
                                 originalHeight={600}
                                 width={width}
                                 height={height}
                                 undoChanges={this.undoChanges}
                                 resize={this.resize}
                                 expanded={expanded === PANELS.RESIZE}
                                 onChangePanel={this.onChangePanel}
                    />
                </TwoColumnsContent>
            </MainLayout>
        );
    }
}

ImageEdition.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    path: PropTypes.string.isRequired
};

let mapStateToProps = state => ({
    path: state.path
});

export default compose(
    connect(mapStateToProps, null),
    translate(),
    withStyles(styles)
)(ImageEdition);
