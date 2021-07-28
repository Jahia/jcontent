import {useEffect, useState} from 'react';

export default (shouldFetch, client, options, tableView, path) => {
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

        if (shouldFetch) {
            setData([]);
            setTimeout(() => {
                fetch();
            }, 30);
        }
    }, [tableView.viewType, tableView.viewMode, path]);

    return data;
};
