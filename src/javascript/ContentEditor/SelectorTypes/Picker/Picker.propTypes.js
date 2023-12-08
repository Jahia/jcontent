import PropTypes from 'prop-types';

export const ExternalPickerConfigPropsTypes = PropTypes.shape({
    module: PropTypes.string,
    selectableTypes: PropTypes.arrayOf(PropTypes.string),
    key: PropTypes.string.isRequired,
    pickerInput: PropTypes.shape({
        usePickerInputData: PropTypes.elementType.isRequired,
        emptyLabel: PropTypes.string,
        emptyIcon: PropTypes.string
    }),
    pickerDialog: PropTypes.shape({
        cmp: PropTypes.elementType.isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
        icon: PropTypes.string
    })
});
