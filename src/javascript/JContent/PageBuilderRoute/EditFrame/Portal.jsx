import ReactDOM from 'react-dom';

export const Portal = ({children, target}) => {
    return ReactDOM.createPortal(
        children,
        target
    );
};
