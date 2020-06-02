import React, {useRef} from 'react';
import {ArrowUp, Button, Typography} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useNodeInfo} from '@jahia/data-helper';
import classnames from 'clsx';
import styles from './Box.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '../../../../utils/getButtonRenderer';

export const Box = ({element, language, color, onSelect, onGoesUp, onMouseEnter, onMouseLeave}) => {
    const rect = element.getBoundingClientRect();
    const scrollLeft = element.ownerDocument.documentElement.scrollLeft;
    const scrollTop = element.ownerDocument.documentElement.scrollTop;
    const path = element.getAttribute('path');
    const type = element.getAttribute('jahiatype');

    const {node} = useNodeInfo({path, language}, {getDisplayName: true, getAggregatedPublicationInfo: true});

    const buttonRenderer = getButtonRenderer({color: 'accent', className: styles.button});

    const rootDiv = useRef();
    const div = useRef();

    const currentOffset = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width,
        height: rect.height
    };
    return (
        <>
            <div ref={rootDiv}
                 className={classnames(styles.root, styles['color' + color])}
                 style={currentOffset}
            >
                <div className={styles.rel} style={{height: 24 + rect.height}}>
                    <div ref={div}
                         draggable
                         className={styles.sticky}
                         data-jahia-parent={element.getAttribute('id')}
                         onClick={onSelect}
                         onMouseEnter={event => {
                             onMouseEnter(event.currentTarget);
                         }}
                         onMouseLeave={event => {
                             onMouseLeave(event.currentTarget);
                         }}
                         onDragStart={() => {
                             element.style.display = 'none';
                         }}
                         onDragEnd={() => {
                             element.style.display = 'block';
                         }}
                    >
                        <div className={classnames(styles.header, styles['color' + color])}>
                            {onGoesUp && (
                                <Button className={styles.button}
                                        variant="default"
                                        color="accent"
                                        label="Up"
                                        icon={<ArrowUp/>}
                                        onClick={onGoesUp}
                                />
                            )}
                            <DisplayAction actionKey="edit" context={{path}} render={buttonRenderer}/>
                            <Typography isUpperCase
                                        isNowrap
                                        className="flexFluid"
                                        variant="caption"
                            >{node?.displayName}
                            </Typography>
                            <Typography isUpperCase
                                        isNowrap
                                        className={styles.button}
                                        variant="caption"
                            >{type} - {node?.aggregatedPublicationInfo.publicationStatus}
                            </Typography>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

Box.propTypes = {
    element: PropTypes.any,

    language: PropTypes.string,

    color: PropTypes.string,

    onSelect: PropTypes.func,

    onGoesUp: PropTypes.func,

    onMouseEnter: PropTypes.func,

    onMouseLeave: PropTypes.func
};
