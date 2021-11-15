import {useEffect, useState} from 'react';

export const useCode = secretCode => {
    const [key, setKey] = useState(null);
    const [count, setCount] = useState(0);
    const [success, setSuccess] = useState(window.jcontentEnhanced);

    useEffect(() => {
        const keyDownHandler = ({code}) => setKey(code);
        addEventListener('keydown', keyDownHandler);
        return () => {
            removeEventListener('keydown', keyDownHandler);
        };
    }, []);

    useEffect(() => {
        if (key !== null) {
            if (key === secretCode[count]) {
                setCount(state => state + 1);

                if (count + 1 === secretCode.length) {
                    window.jcontentEnhanced = true;
                    setSuccess(true);
                }
            } else {
                setCount(0);
            }

            setKey(null);
        }
    }, [count, secretCode, key]);

    return success;
};

