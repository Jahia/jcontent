import React from 'react';
import {TwoColumnsContent, MainLayout} from '@jahia/layouts';
import ImageEditionPreview from './ImageEditionPreview';
import {ExpansionPanel, ExpansionPanelSummary, Typography, ExpansionPanelDetails, withStyles} from '@material-ui/core';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {ExpandMore} from '@material-ui/icons';

let styles = () => {

};

const ImageEdition = ({t, classes}) => (
    <MainLayout topBarProps={{
        path: t('label.contentManager.appTitle', {path: ''}),
        title: t('label.contentManager.editImage.title'),
        contextModifiers: <React.Fragment></React.Fragment>,
        actions: <React.Fragment></React.Fragment>
    }}
    >
        <TwoColumnsContent rightCol={<ImageEditionPreview/>}>
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                    <Typography className={classes.heading}>Resize</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Typography>
                        Resize
                    </Typography>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                    <Typography className={classes.heading}>Rotate</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Typography>
                        Rotate
                    </Typography>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </TwoColumnsContent>
    </MainLayout>
);

export default compose(
    translate(),
    withStyles(styles)
)(ImageEdition);
