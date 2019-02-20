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
    Typography,
    withStyles} from '@material-ui/core';

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
        padding: theme.spacing.unit
    }
});

export class Export extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            select: '',
            zipCheckbox: false
        };
        this.onChangeSelection = this.onChangeSelection.bind(this);
        this.handleZipCheckbox = this.handleZipCheckbox.bind(this);
    }

    onChangeSelection(event) {
        this.setState({
            select: event.target.value
        });
    }

    handleZipCheckbox(event) {
        this.setState({
            zipCheckbox: event.target.checked
        });
    }

    render() {
        let {t, classes, onClose, onExited} = this.props;
        let disabledChecked = this.state.select === 'live';
        return (
            <Dialog fullWidth open={this.props.open} onExited={onExited} onClose={onClose}>
                <DialogTitle>
                    {t('label.contentManager.export.dialogTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className={classes.margins}>
                        {t('label.contentManager.export.dialogText')}
                    </DialogContentText>
                    <Select
                        displayEmpty
                        className={classes.margins}
                        value={this.state.select}
                        name="exportType"
                        onChange={e => this.onChangeSelection(e)}
                    >
                        <MenuItem value="default">{t('label.contentManager.export.stagingSelectItem')}</MenuItem>
                        <MenuItem value="live">{t('label.contentManager.export.stagingLiveSelectItem')}</MenuItem>
                    </Select>
                    <div className={classes.checkbox}>
                        <Checkbox
                        value="zip"
                        color="primary"
                        disabled={disabledChecked}
                        checked={disabledChecked || this.state.zipCheckbox}
                        onChange={e => this.handleZipCheckbox(e)}
                    />
                        <Typography variant="subtitle2" color="textPrimary" className={classes.typo}>
                            {t('label.contentManager.export.checkboxLabel')}
                        </Typography>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="default" onClick={onClose}>
                        {t('label.contentManager.fileUpload.dialogRenameCancel')}
                    </Button>
                    <Button variant="contained" color="primary" data-cm-role="upload-rename-button">
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
