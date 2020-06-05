import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import styles from './DeviceContainer.scss';
import {Dropdown, UnfoldMore, UnfoldLess, Button, ButtonGroup} from '@jahia/moonstone';

const devices = {
    appleIphoneVer1: {
        label: 'Phone: iPhone',
        decoration: '/modules/channels/images/devices/template_375x667_portrait.png',
        decorationWidth: 495,
        decorationHeight: 797,
        positionTop: 60,
        positionLeft: 60,
        width: 375,
        height: 667
    },
    androidTablet: {
        label: 'Tablet: Android',
        decoration: '/modules/channels/images/devices/template_768x1024_portrait.png',
        decorationWidth: 888,
        decorationHeight: 1174,
        positionTop: 60,
        positionLeft: 60,
        width: 768,
        height: 1024
    }
};

export const DeviceContainer = ({enabled, children}) => {
    const ref = useRef();
    const [device, setDevice] = useState('appleIphoneVer1');
    const [scale, setScale] = useState(1);
    const [scaled, setScaled] = useState(false);

    useEffect(() => {
        if (device && enabled) {
            if (scaled) {
                const box = ref.current.getBoundingClientRect();
                setScale(Math.min(box.height / devices[device].decorationHeight, box.width / devices[device].decorationWidth));
            } else {
                setScale(1);
            }
        }
    }, [ref, device, scaled, enabled]);

    if (!enabled || !device) {
        return children;
    }

    console.log(Object.keys(devices).map(k => ({label: devices[k].label, value: k})));

    return (
        <>
            <div ref={ref}
                 className={styles.root}
                 style={{
                     overflow: scaled ? 'hidden' : 'scroll',
                     width: `${devices[device].decorationWidth}px`
                 }}
            >
                <div className={styles.container} style={{transform: `scale(${scale})`}}>
                    <div className={styles.device}
                         style={{
                             width: `${devices[device].decorationWidth}px`,
                             height: `${devices[device].decorationHeight}px`
                         }}
                    >
                        <img src={devices[device].decoration}/>
                    </div>
                    <div className={styles.frame}
                         style={{
                             margin: `${devices[device].positionTop}px ${devices[device].positionLeft}px`,
                             width: `${devices[device].width}px`,
                             height: `${devices[device].height}px`
                         }}
                    >
                        {children}
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <Dropdown size="small"
                          data={Object.keys(devices).map(k => ({label: devices[k].label, value: k}))}
                          label={devices[device].label}
                          value={device}
                          onChange={(e, i) => setDevice(i.value)}
                />
                <ButtonGroup>
                    <Button icon={<UnfoldLess/>}
                            onClick={() => setScaled(true)}
                    />
                    <Button icon={<UnfoldMore/>}
                            onClick={() => setScaled(false)}
                    />
                </ButtonGroup>
            </div>
        </>

    );
};

DeviceContainer.propTypes = {
    enabled: PropTypes.bool,
    children: PropTypes.any
};
