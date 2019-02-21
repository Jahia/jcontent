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
import {Typography} from '@jahia/ds-mui-theme';

const styles = theme => ({
    margins: {
        marginTop: theme.spacing.unit * 2,
        width: '100%'
    },
    checkbox: {
        display: 'inline-flex',
        marginTop: theme.spacing.unit * 2
    },
    typo: {
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
        let format = (this.state.xml ? 'xml' : 'zip');
        let live = (this.state.workspace === 'live');
        return (
            <Dialog fullWidth open={this.props.open} aria-labelledby="form-dialog-title" onExited={onExited} onClose={onClose}>
                <DialogTitle>
                    {t('label.contentManager.export.dialogTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className={classes.margins}>
                        {t('label.contentManager.export.dialogText')}
                    </DialogContentText>
                    <Select
                        className={classes.margins}
                        value={this.state.workspace}
                        name="exportType"
                        onChange={e => this.onWorkspaceChange(e)}
                    >
                        <MenuItem value="default">
                            {t('label.contentManager.export.stagingSelectItem')}
                        </MenuItem>
                        <MenuItem value="live">
                            {t('label.contentManager.export.stagingLiveSelectItem')}
                        </MenuItem>
                    </Select>
                    <FormHelperText>
                        {t('label.contentManager.export.textHelper')}
                    </FormHelperText>
                    <div className={classes.checkbox}>
                        <Checkbox
                            value="xml"
                            color="primary"
                            disabled={live}
                            onChange={e => this.onXmlChange(e)}
                        />
                        <Typography variant="iota" color={live ? 'beta' : 'alpha'} className={classes.typo}>
                            {t('label.contentManager.export.checkboxLabel')}
                        </Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="default" onClick={onClose}>
                        {t('label.contentManager.fileUpload.dialogRenameCancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        data-cm-role="upload-rename-button"
                        type="submit"
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
