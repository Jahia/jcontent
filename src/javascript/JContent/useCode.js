import {useEffect, useState} from 'react';

const useInputEvent = () => {
    const [key, setKey] = useState(null);
    useEffect(() => {
        const keyDownHandler = ({code}) => setKey(code);
        const keyUpHandler = () => setKey(null);
        addEventListener('keydown', keyDownHandler);
        addEventListener('keyup', keyUpHandler);
        return () => {
            removeEventListener('keydown', keyDownHandler);
            removeEventListener('keyup', keyUpHandler);
        };
    }, []);
    return key;
};

export const useCode = secretCode => {
    const [count, setCount] = useState(0);
    const [success, setSuccess] = useState(false);
    const key = useInputEvent();

    useEffect(() => {
        if (key !== null) {
            if (key !== secretCode[count]) {
                setCount(0);
            } else {
                setCount(state => state + 1);
                if (count + 1 === secretCode.length) {
                    setSuccess(true);
                }
            }
        }
    }, [key]);

    return success;
};

