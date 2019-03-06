import React from 'react';
import PropTypes from 'prop-types';
import {MainLayout, TwoColumnsContent} from '@jahia/layouts';
import {Typography} from '@jahia/ds-mui-theme';
import ImageEditionPreview from './ImageEditionPreview';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
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
        const {node} = this.props;
        this.state = {
            rotate: 0,
            width: parseInt(node.width.value, 10),
            height: parseInt(node.height.value, 10),
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
        const {node} = this.props;

        this.setState(() => ({
            rotate: 0,
            width: parseInt(node.width.value, 10),
            height: parseInt(node.height.value, 10),
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
        const {t, classes, node, client} = this.props;
        const {rotate, height, width, expanded} = this.state;
        const originalWidth = parseInt(node.width.value, 10);
        const originalHeight = parseInt(node.height.value, 10);

        let rotationDisabled = (originalWidth !== width) || (originalHeight !== height);
        let resizeDisabled = (rotate !== 0);

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
                <TwoColumnsContent classes={{left: classes.left, right: classes.right}}
                                   rightCol={<ImageEditionPreview rotate={rotate} path={node.path}/>}
                >
                    <RotatePanel defaultExpanded
                                 disabled={rotationDisabled}
                                 expanded={expanded === PANELS.ROTATE}
                                 rotate={this.rotate}
                                 undoChanges={this.undoChanges}
                                 onChangePanel={this.onChangePanel}
                    />
                    <ResizePanel originalWidth={originalWidth}
                                 originalHeight={originalHeight}
                                 width={width}
                                 height={height}
                                 disabled={resizeDisabled}
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
    node: PropTypes.object.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(ImageEdition);
