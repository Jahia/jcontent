import React from 'react';
import PropTypes from 'prop-types';
import {compose} from '~/utils';
import {withTranslation} from 'react-i18next';
import {Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Select,
    MenuItem,
    Checkbox,
    FormHelperText,
    withStyles
} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import {FormControlLabel} from '@jahia/design-system-kit';

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
        let wsp = event.target.value;
        this.setState(Object.assign({workspace: wsp}, (wsp === 'live') ? {xml: false} : {}));
    }

    onXmlChange(event) {
        this.setState({
            xml: event.target.checked
        });
    }

    triggerExport(path) {
        let contextPath = window.contextJsParameters.contextPath;
        let format = (this.state.xml ? 'xml' : 'zip');
        let live = (this.state.workspace === 'live');
        window.open(`${contextPath}/cms/export/default${path}.${format}?exportformat=${format}&live=${live}`);
    }

    render() {
        let {t, classes, onClose, onExited, path, isOpen} = this.props;
        let live = (this.state.workspace === 'live');
        return (
            <Dialog fullWidth open={isOpen} aria-labelledby="form-dialog-title" data-cm-role="export-options" onExited={onExited} onClose={onClose}>
                <DialogTitle>
                    {t('jcontent:label.contentManager.export.dialogTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className={classes.margins}>
                        {t('jcontent:label.contentManager.export.selectWorkspace')}
                    </DialogContentText>
                    <Select
                        className={classes.margins}
                        value={this.state.workspace}
                        data-cm-role="select-workspace"
                        onChange={e => this.onWorkspaceChange(e)}
                    >
                        <MenuItem value="default" data-cm-role="default-workspace">
                            {t('jcontent:label.contentManager.export.stagingOnlyOption')}
                        </MenuItem>
                        <MenuItem value="live" data-cm-role="live-workspace">
                            {t('jcontent:label.contentManager.export.stagingAndLiveOption')}
                        </MenuItem>
                    </Select>
                    <FormHelperText>
                        {t('jcontent:label.contentManager.export.exportDetails')}
                    </FormHelperText>
                    <div className={classes.checkboxContainer}>
                        <FormControlLabel
                            classes={{root: classes.checkboxLabel}}
                            value="xml"
                            label={
                                <Typography className={classes.checkboxTypo}>
                                    {t('jcontent:label.contentManager.export.asXml')}
                                </Typography>
                            }
                            checked={this.state.xml}
                            disabled={live}
                            control={<Checkbox color="primary"/>}
                            data-cm-role="export-as-xml"
                            onChange={e => this.onXmlChange(e)}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button label={t('jcontent:label.contentManager.fileUpload.dialogRenameCancel')} onClick={onClose}/>
                    <Button
                        color="accent"
                        data-cm-role="export-button"
                        label={t('jcontent:label.contentManager.export.actionLabel')}
                        onClick={() => {
                            this.triggerExport(path);
                            onClose();
                        }}
                    />
                </DialogActions>
            </Dialog>
        );
    }
}

Export.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onExited: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    path: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired
};

export default compose(
    withStyles(styles),
    withTranslation()
)(Export);
