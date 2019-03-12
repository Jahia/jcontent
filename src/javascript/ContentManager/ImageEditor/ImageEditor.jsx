import React from 'react';
import PropTypes from 'prop-types';
import {MainLayout, TwoColumnsContent} from '@jahia/layouts';
import {IconButton, Typography} from '@jahia/ds-mui-theme';
import ImageEditorPreview from './ImageEditorPreview';
import {withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import RotatePanel from './RotatePanel';
import ResizePanel from './ResizePanel';
import {Check, ChevronLeft} from '@material-ui/icons';
import Feedback from './Feedback';

let styles = theme => ({
    left: {
        overflow: 'auto'
    },
    right: {
        justifyContent: 'center',
        background: theme.palette.ui.omega,
        paddingRight: theme.spacing.unit * 2
    },
    feedbackContent: {
        display: 'flex'
    },
    feedbackIcon: {
        marginRight: theme.spacing.unit
    }
});

export const PANELS = {
    ROTATE: 0,
    RESIZE: 1
};

export class ImageEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: PANELS.ROTATE
        };
        this.onChangePanel = this.onChangePanel.bind(this);
    }

    onChangePanel(panel) {
        this.setState({
            expanded: panel
        });
    }

    render() {
        const {t, classes, node, rotations, width, height, rotate, resize, undoChanges, saveChanges, onBackNavigation, ts, dxContext, confirmSaved, closeFeedback} = this.props;
        const {expanded} = this.state;
        const originalWidth = parseInt(node.width.value, 10);
        const originalHeight = parseInt(node.height.value, 10);

        let resizeDirty = Boolean((width && originalWidth !== width) || (height && originalHeight !== height));
        let rotationsDirty = (rotations !== 0);

        let dirty = resizeDirty || rotationsDirty;

        let changesFeedback = dirty ? t('label.contentManager.editImage.unsavedChanges') : '';

        return (
            <MainLayout topBarProps={{
                path: (
                    <React.Fragment>
                        <Typography variant="omega" color="invert">
                            <IconButton color="inverted" size="compact" icon={<ChevronLeft/>} onClick={() => onBackNavigation(dirty)}/>
                            {t('label.contentManager.editImage.goBack')}
                        </Typography>
                    </React.Fragment>
                ),
                title: node.name,
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
                                   rightCol={<ImageEditorPreview rotations={rotations} dxContext={dxContext} path={node.path} ts={ts}/>}
                >
                    <>
                        <RotatePanel dirty={rotationsDirty}
                                     expanded={expanded === PANELS.ROTATE}
                                     disabled={resizeDirty}
                                     rotate={rotate}
                                     undoChanges={undoChanges}
                                     saveChanges={saveChanges}
                                     onChangePanel={this.onChangePanel}
                        />
                        <ResizePanel expanded={expanded === PANELS.RESIZE}
                                     dirty={resizeDirty}
                                     originalWidth={originalWidth}
                                     originalHeight={originalHeight}
                                     width={width}
                                     height={height}
                                     disabled={rotationsDirty}
                                     resize={resize}
                                     undoChanges={undoChanges}
                                     saveChanges={saveChanges}
                                     onChangePanel={this.onChangePanel}
                        />
                    </>
                </TwoColumnsContent>
                <Feedback
                    open={dirty}
                    message={
                        <div className={classes.feedbackContent}>
                            <Check className={classes.feedbackIcon}/>
                            <Typography variant="zeta" color="invert">
                                {t('label.contentManager.editImage.editingMessage', {imageName: node.name})}
                            </Typography>
                        </div>}
                />
                <Feedback
                    open={confirmSaved}
                    duration={2000}
                    message={
                        <div className={classes.feedbackContent}>
                            <Check className={classes.feedbackIcon}/>
                            <Typography variant="zeta" color="invert">
                                {t('label.contentManager.editImage.savedMessage')}
                            </Typography>
                        </div>}
                    onClose={closeFeedback}
                />
            </MainLayout>
        );
    }
}

ImageEditor.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
    rotations: PropTypes.number.isRequired,
    resize: PropTypes.func.isRequired,
    rotate: PropTypes.func.isRequired,
    onBackNavigation: PropTypes.func.isRequired,
    saveChanges: PropTypes.func.isRequired,
    ts: PropTypes.number.isRequired,
    undoChanges: PropTypes.func.isRequired,
    dxContext: PropTypes.object.isRequired,
    confirmSaved: PropTypes.bool.isRequired,
    closeFeedback: PropTypes.func.isRequired
};

ImageEditor.defaultProps = {
    height: null,
    width: null
};

export default compose(
    translate(),
    withStyles(styles)
)(ImageEditor);

