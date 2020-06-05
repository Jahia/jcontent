import React, {useRef} from 'react';
import {ArrowUp, Button, Typography} from '@jahia/moonstone';
import PropTypes from 'prop-types';
import {useNodeInfo} from '@jahia/data-helper';
import classnames from 'clsx';
import styles from './Box.scss';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '../../../../utils/getButtonRenderer';
import {publicationStatusByName} from '../PublicationStatus/publicationStatusRenderer';
import {useTranslation} from 'react-i18next';
import {useDragSource} from './useDragSource';

export const Box = ({element, language, color, onSelect, onGoesUp, onMouseOver, onMouseOut, onSaved}) => {
    const rect = element.getBoundingClientRect();
    const scrollLeft = element.ownerDocument.documentElement.scrollLeft;
    const scrollTop = element.ownerDocument.documentElement.scrollTop;
    const path = element.getAttribute('path');
    const {t} = useTranslation();
    const {node} = useNodeInfo({path, language}, {
        getDisplayName: true,
        getAggregatedPublicationInfo: true,
        getProperties: ['jcr:mixinTypes', 'jcr:lastModified', 'jcr:lastModifiedBy', 'j:lastPublished', 'j:lastPublishedBy']
    });
    const {onDragEnd, onDragStart, dragClassName} = useDragSource({element});
    const buttonRenderer = getButtonRenderer({color, variant: 'outlined', className: styles.button});

    const rootDiv = useRef();
    const div = useRef();

    const currentOffset = {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft - 4,
        width: rect.width + 8,
        height: rect.height + 4
    };

    const nodeWithProps = {};
    if (node) {
        Object.assign(nodeWithProps, node);
        node.properties.filter(p => p.name !== 'jcr:mixinTypes').forEach(p => {
            nodeWithProps[p.name.substr(p.name.indexOf(':') + 1)] = p;
        });
    }

    const status = node && publicationStatusByName.getStatus(nodeWithProps);

    return (
        <>
            <div ref={rootDiv}
                 className={classnames(styles.root, styles['color_' + color])}
                 style={currentOffset}
            >
                <div className={styles.rel} style={{height: 24 + rect.height}}>
                    <div ref={div}
                         draggable
                         className={classnames(styles.sticky, dragClassName)}
                         data-jahia-parent={element.getAttribute('id')}
                         onClick={onSelect}
                         onMouseOver={onMouseOver}
                         onMouseOut={onMouseOut}
                         onDragStart={onDragStart}
                         onDragEnd={onDragEnd}
                    >
                        <div className={classnames(styles.header, styles['color_' + color])}>
                            {onGoesUp && (
                                <Button className={styles.button}
                                        variant="outlined"
                                        color={color}
                                        label="Up"
                                        icon={<ArrowUp/>}
                                        onClick={onGoesUp}
                                />
                            )}
                            <DisplayAction actionKey="quickEdit" context={{path, onSaved}} render={buttonRenderer}/>
                            <Typography isUpperCase
                                        isNowrap
                                        className="flexFluid"
                                        variant="caption"
                            >{node ? node.displayName : ''}
                            </Typography>
                            <Typography isNowrap
                                        className={styles.button}
                                        variant="caption"
                            >{status ? status.geti18nDetailsMessage(nodeWithProps, t, language) : ''}
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

    onSaved: PropTypes.func,

    onSelect: PropTypes.func,

    onGoesUp: PropTypes.func,

    onMouseOver: PropTypes.func,

    onMouseOut: PropTypes.func
};
