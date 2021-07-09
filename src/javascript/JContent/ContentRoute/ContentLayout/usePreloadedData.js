import {useEffect, useState} from 'react';

export default (isStructuredView, client, options, viewType, path) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetch() {
            try {
                const result = await client.query(options);
                const d = result?.data?.jcr?.nodeByPath?.descendants?.nodes;
                setData(d || []);
            } catch (e) {
                console.log('Failed to preload data', e);
                setData([]);
            }
        }

        if (isStructuredView) {
            console.log('Run effect');
            fetch();
        }
    }, [viewType, path]);

    return data;
};
