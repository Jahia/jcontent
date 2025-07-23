import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Popover} from '@material-ui/core';
import {Constants} from '~/ContentEditor/ContentEditor.constants';
import {HexColorPicker} from 'react-colorful';
import {Button, Palette, Input} from '@jahia/moonstone';
import styles from './ColorPickerInput.scss';

const defaultVisualColor = '#fff';
const getVisualValue = value => {
    return value && Constants.color.hexColorRegexp.test(value) ? value : defaultVisualColor;
};

export const ColorPickerInput = ({onChange, onBlur, initialValue, readOnly, inputProps}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [internalValue, setInternalValue] = useState(initialValue);
    const containerRef = useRef();

    useEffect(() => {
        setInternalValue(initialValue);
    }, [initialValue, setInternalValue]);

    const handleOpenPicker = () => {
        if (!readOnly) {
            setAnchorEl(containerRef.current);
        }
    };

    const postfixComponent = (
        <Button aria-label="Open color picker"
                variant="ghost"
                icon={<Palette/>}
                onClick={handleOpenPicker}
        />
    );

    return (
        <div ref={containerRef} className={styles.root} style={{borderColor: getVisualValue(internalValue)}}>
            <Input
                className={styles.input}
                data-sel-readonly={readOnly}
                postfixComponents={postfixComponent}
                readOnly={readOnly}
                value={internalValue}
                size="big"
                onChange={e => {
                    if (e && e.target) {
                        onChange(e.target.value);
                    }
                }}
                onBlur={onBlur}
                {...inputProps}
            />
            <Popover open={Boolean(anchorEl)}
                     anchorEl={anchorEl}
                     anchorOrigin={{
                         vertical: 'bottom',
                         horizontal: 'left'
                     }}
                     transformOrigin={{
                         vertical: 'top',
                         horizontal: 'left'
                     }}
                     classes={{
                         paper: styles.overlay
                     }}
                     onClose={() => {
                         setAnchorEl(null);
                         onChange(internalValue);
                         onBlur();
                     }}
            >
                <HexColorPicker
                    color={internalValue}
                    onChange={newColor => {
                        setInternalValue(newColor);
                    }}
                />
            </Popover>
        </div>
    );
};

ColorPickerInput.defaultProps = {
    onChange: () => {},
    initialValue: null,
    readOnly: false,
    inputProps: {}
};

ColorPickerInput.propTypes = {
    initialValue: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    // eslint-disable-next-line react/boolean-prop-naming
    readOnly: PropTypes.bool,
    inputProps: PropTypes.object
};

ColorPickerInput.displayName = 'ColorPickerInput';
