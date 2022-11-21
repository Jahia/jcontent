import React from 'react';
import PropTypes from 'prop-types';
import css from './ContentTable.scss';
import EmptyDropZone from '~/JContent/ContentRoute/ContentLayout/EmptyDropZone';

const ContentTableWrapper = ({children, reference, dropReference, uploadType, onClick = () => {}, onKeyDown = () => {}, isCanDrop, ...rest}) => {
    return (
        <>
            <div ref={reference}
                 className={css.tableWrapper}
                 tabIndex="1"
                 onClick={onClick}
                 onKeyDown={onKeyDown}
                 {...rest}
            >
                {children}
            </div>
            <div ref={dropReference} className="flexRow flexFluid">
                {isCanDrop && (
                    <EmptyDropZone component="div" isCanDrop={isCanDrop} uploadType={uploadType}/>
                )}
            </div>
        </>
    );
};

ContentTableWrapper.propTypes = {
    children: PropTypes.node,
    reference: PropTypes.object,
    dropReference: PropTypes.object,
    uploadType: PropTypes.string,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    isCanDrop: PropTypes.bool
};

export default ContentTableWrapper;
