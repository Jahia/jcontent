import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {deletedStyles as styles} from 'editframe-styles';
import {getCoords} from '~/JContent/EditFrame/EditFrame.utils';
import Status from '~/JContent/ContentRoute/ContentStatuses/Status';
import {useTrackedRect} from '~/JContent/EditFrame/core/layoutScheduler';

export const Deleted = ({element}) => {
    const currentOffset = useTrackedRect(element, getCoords);

    const ref = useRef();

    if (currentOffset.width === 0 || currentOffset.height === 0) {
        return false;
    }

    return (
        <div ref={ref}
             className={clsx(styles.root)}
             data-sel-role="infos-deleted"
             data-jahia-path={element.getAttribute('path')}
             style={currentOffset}
        >
            <Status type="markedForDeletion" hasLabel={false} className={styles.badge} variant="bright"/>
        </div>
    );
};

Deleted.propTypes = {
    element: PropTypes.any
};
