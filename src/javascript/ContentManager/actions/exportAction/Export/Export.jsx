import React from 'react';
import {compose} from 'react-apollo';
import {translate} from 'react-i18next';
import {Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    Select,
    MenuItem,
    Checkbox,
    FormHelperText,
    withStyles
} from '@material-ui/core';
import {FormControlLabel, Typography} from '@jahia/ds-mui-theme';

const styles = theme => ({
    margins: {
        marginTop: theme.spacing.unit * 2,
        width: '100%'
    },
    checkboxContainer: {
        display: 'inline-flex',
        marginTop: theme.spacing.unit * 2
    },
    checkboxLabel: {
        marginLeft: 0
    },
    checkboxTypo: {
        padding: '10px'
    }
});

export class Export extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workspace: 'default',
            xml: false
        };
        this.onWorkspaceChange = this.onWorkspaceChange.bind(this);
        this.onXmlChange = this.onXmlChange.bind(this);
    }

    onWorkspaceChange(event) {
        this.setState({
            workspace: event.target.value
        });
    }

    onXmlChange(event) {
        this.setState({
            xml: event.target.checked
        });
    }

    triggerExport(path, format, live) {
        window.open(`/cms/export/default${path}.${format}?exportformat=${format}&live=${live}`);
    }

    render() {
        let {t, classes, onClose, onExited, path} = this.props;
        let live = (this.state.workspace === 'live');
        let format = (this.state.xml && !live ? 'xml' : 'zip');
        return (
            <Dialog fullWidth open={this.props.open} aria-labelledby="form-dialog-title" data-cm-role="export-options" onExited={onExited} onClose={onClose}>
                <DialogTitle>
                    {t('label.contentManager.export.dialogTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className={classes.margins}>
                        {t('label.contentManager.export.selectWorkspace')}
                    </DialogContentText>
                    <Select
                        className={classes.margins}
                        value={this.state.workspace}
                        data-cm-role="select-workspace"
                        onChange={e => this.onWorkspaceChange(e)}
                    >
                        <MenuItem value="default" data-cm-role="default-workspace">
                            {t('label.contentManager.export.stagingOnlyOption')}
                        </MenuItem>
                        <MenuItem value="live" data-cm-role="live-workspace">
                            {t('label.contentManager.export.stagingAndLiveOption')}
                        </MenuItem>
                    </Select>
                    <FormHelperText>
                        {t('label.contentManager.export.exportDetails')}
                    </FormHelperText>
                    <div className={classes.checkboxContainer}>
                        <FormControlLabel
                            classes={{root: classes.checkboxLabel}}
                            value="xml"
                            label={
                                <Typography variant="iota" color={live ? 'beta' : 'alpha'} className={classes.checkboxTypo}>
                                    {t('label.contentManager.export.asXml')}
                                </Typography>
                            }
                            checked={this.state.xml && !live}
                            disabled={live}
                            control={<Checkbox color="primary"/>}
                            data-cm-role="export-as-xml"
                            onChange={e => this.onXmlChange(e)}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="default" onClick={onClose}>
                        {t('label.contentManager.fileUpload.dialogRenameCancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        data-cm-role="export-button"
                        onClick={() => {
                            this.triggerExport(path, format, live);
                            onClose();
                        }}
                    >
                        {t('label.contentManager.export.actionLabel')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default compose(
    withStyles(styles),
    translate()
)(Export);
