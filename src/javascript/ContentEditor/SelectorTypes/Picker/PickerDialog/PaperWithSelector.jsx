import {Paper} from '@material-ui/core';
import styles from '~/ContentEditor/SelectorTypes/Picker/PickerDialog/PickerDialog.scss';
import {PickerSelector} from '~/ContentEditor/SelectorTypes/Picker/PickerDialog/PickerSelector';
import PropTypes from 'prop-types';
import {ExternalPickerConfigPropsTypes} from '~/ContentEditor/SelectorTypes/Picker/Picker.propTypes';
import React from 'react';

export const PaperWithSelector = ({children, setCurrentExternalPicker, currentExternalPicker, availableExternalPickerConfigs, ...props}) => {
    return (
        <>
            <Paper className={styles.selector}>
                <PickerSelector externalPickerConfig={currentExternalPicker} setExternalPickerConfig={setCurrentExternalPicker} availableExternalPickerConfigs={availableExternalPickerConfigs}/>
            </Paper>

            <Paper {...props} classes={{root: styles.paperWithSelector}}>
                {children}
            </Paper>
        </>
    );
};

PaperWithSelector.propTypes = {
    availableExternalPickerConfigs: PropTypes.arrayOf(ExternalPickerConfigPropsTypes),
    currentExternalPicker: ExternalPickerConfigPropsTypes,
    setCurrentExternalPicker: PropTypes.func.isRequired,
    children: PropTypes.node
};
