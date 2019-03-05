import React from 'react';
import {ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, IconButton, withStyles} from '@material-ui/core';
import {ExpandMore, RotateLeft, RotateRight} from '@material-ui/icons';
import {Typography, Button} from '@jahia/ds-mui-theme';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';

let styles = theme => ({
    rotatePanel: {
        display: 'flex',
        flexDirection: 'column'
    },
    icons: {
        paddingTop: theme.spacing.unit * 2
    },
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
        '& > button': {
            marginRight: '1em'
        }
    },
    spacer: {
        flex: 1
    }
});

export class RotatePanel extends React.Component {
    render() {
        let {classes, t, rotateLeft, rotateRight, undoChanges} = this.props;
        return (
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="zeta" color="alpha">{t('label.contentManager.editImage.rotate')}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.rotatePanel}>
                    <Typography variant="zeta" color="beta">
                        {t('label.contentManager.editImage.rotateImage')}
                    </Typography>
                    <div className={classes.icons}>
                        <IconButton onClick={() => rotateLeft()}>
                            <RotateLeft color="primary" fontSize="large"/>
                        </IconButton>
                        <IconButton onClick={() => rotateRight()}>
                            <RotateRight color="primary" fontSize="large"/>
                        </IconButton>
                    </div>
                    <div className={classes.buttons}>
                        <Button variant="ghost" color="primary" onClick={() => undoChanges()}>
                            {t('label.contentManager.editImage.undo')}
                        </Button>
                        <div className={classes.spacer}/>
                        <Button variant="secondary">
                            {t('label.contentManager.editImage.saveAs')}
                        </Button>
                        <Button variant="normal">
                            {t('label.contentManager.editImage.save')}
                        </Button>
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }
}

export default compose(
    translate(),
    withStyles(styles)
)(RotatePanel);

