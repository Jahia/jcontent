import React from 'react';
import PropTypes from 'prop-types';
import {MainLayout, TwoColumnsContent} from '@jahia/layouts';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    IconButton,
    Typography
} from '@jahia/ds-mui-theme';
import ImageEditorPreview from './ImageEditorPreview';
import {Tooltip, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import RotatePanel from './RotatePanel';
import ResizePanel from './ResizePanel';
import CropPanel from './CropPanel';
import {ChevronLeft, ExpandMore} from '@material-ui/icons';
import ImageEditorActions from './ImageEditorActions';

let styles = theme => ({
    left: {
        overflow: 'auto'
    },
    panel: {
        display: 'flex',
        flexDirection: 'column'
    },
    right: {
        justifyContent: 'center',
        alignItems: 'center',
        background: theme.palette.ui.omega,
        paddingRight: theme.spacing.unit * 2
    }
});

const PANELS = {
    ROTATE: 0,
    RESIZE: 1,
    CROP: 2
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
        const {
            t,
            classes,
            path,
            originalWidth,
            originalHeight,
            resizeParams,
            rotationParams,
            cropParams,
            onResize,
            onRotate,
            onCrop,
            onBackNavigation,
            saveChanges,
            undoChanges
        } = this.props;
        const {expanded} = this.state;

        let dirty = resizeParams.dirty || rotationParams.dirty || cropParams.dirty;
        let name = path.substr(path.indexOf('n') + 1);
        let changesFeedback = dirty ? t('label.contentManager.editImage.unsavedChanges') : '';

        return (
            <MainLayout topBarProps={{
                path: (
                    <React.Fragment>
                        <Typography variant="omega" color="invert">
                            <IconButton color="inverted"
                                        size="compact"
                                        icon={<ChevronLeft/>}
                                        onClick={() => onBackNavigation(dirty)}/>
                            {t('label.contentManager.editImage.goBack')}
                        </Typography>
                    </React.Fragment>
                ),
                title: name,
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
                                   rightCol={<ImageEditorPreview cropExpanded={expanded === PANELS.CROP}
                                                                 {...this.props}/>}
                >
                    <>
                        <Tooltip title={(resizeParams.dirty || cropParams.dirty) ? t('label.contentManager.editImage.tooltip') : ''}>
                            <ExpansionPanel disabled={resizeParams.dirty || cropParams.dirty}
                                            expanded={expanded === PANELS.ROTATE}
                                            data-cm-role="rotate-panel"
                                            onChange={(event, expanded) => expanded && !resizeParams.dirty && !cropParams.dirty && this.onChangePanel(PANELS.ROTATE)}
                            >
                                <ExpansionPanelSummary expandIcon={expanded !== PANELS.ROTATE && <ExpandMore/>}>
                                    <Typography variant="zeta" color="alpha">{t('label.contentManager.editImage.rotate')}</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails className={classes.panel}>
                                    <RotatePanel onRotate={onRotate}/>
                                </ExpansionPanelDetails>
                                <ImageEditorActions dirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                            </ExpansionPanel>
                        </Tooltip>
                        <Tooltip title={(rotationParams.dirty || cropParams.dirty) ? t('label.contentManager.editImage.tooltip') : ''}>
                            <ExpansionPanel disabled={rotationParams.dirty || cropParams.dirty}
                                            expanded={expanded === PANELS.RESIZE}
                                            data-cm-role="resize-panel"
                                            onChange={(event, expanded) => expanded && !rotationParams.dirty && !cropParams.dirty && this.onChangePanel(PANELS.RESIZE)}
                            >
                                <ExpansionPanelSummary expandIcon={expanded !== PANELS.RESIZE && <ExpandMore/>}>
                                    <Typography variant="zeta" color="alpha">{t('label.contentManager.editImage.resize')}</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails className={classes.panel}>
                                    <ResizePanel originalWidth={originalWidth}
                                                 originalHeight={originalHeight}
                                                 resizeParams={resizeParams}
                                                 onResize={onResize}
                                    />
                                </ExpansionPanelDetails>
                                <ImageEditorActions dirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                            </ExpansionPanel>
                        </Tooltip>
                        <Tooltip title={(resizeParams.dirty || rotationParams.dirty) ? t('label.contentManager.editImage.tooltip') : ''}>
                            <ExpansionPanel disabled={resizeParams.dirty || rotationParams.dirty}
                                            expanded={expanded === PANELS.CROP}
                                            data-cm-role="crop-panel"
                                            onChange={(event, expanded) => expanded && !resizeParams.dirty && !rotationParams.dirty && this.onChangePanel(PANELS.CROP)}
                            >
                                <ExpansionPanelSummary expandIcon={expanded !== PANELS.CROP && <ExpandMore/>}>
                                    <Typography variant="zeta" color="alpha">{t('label.contentManager.editImage.crop')}</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails className={classes.panel}>
                                    <CropPanel cropParams={cropParams}
                                               onCrop={onCrop}
                                    />
                                </ExpansionPanelDetails>
                                <ImageEditorActions dirty={dirty} undoChanges={undoChanges} saveChanges={saveChanges}/>
                            </ExpansionPanel>
                        </Tooltip>
                    </>
                </TwoColumnsContent>
            </MainLayout>
        );
    }
}

ImageEditor.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    path: PropTypes.string,
    ts: PropTypes.number.isRequired,
    originalWidth: PropTypes.number,
    originalHeight: PropTypes.number,
    dxContext: PropTypes.object.isRequired,
    resizeParams: PropTypes.object.isRequired,
    rotationParams: PropTypes.object.isRequired,
    cropParams: PropTypes.object,
    onResize: PropTypes.func.isRequired,
    onRotate: PropTypes.func.isRequired,
    onCrop: PropTypes.func.isRequired,
    onImageLoaded: PropTypes.func.isRequired,
    onBackNavigation: PropTypes.func.isRequired,
    saveChanges: PropTypes.func.isRequired,
    undoChanges: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles)
)(ImageEditor);

