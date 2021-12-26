import { useRef, useEffect } from 'react';
import * as D3 from 'd3';

export const useD3 = (renderFn, dependencies) => {
    const ref = useRef();

    useEffect(() => {
        renderFn(D3.select(ref.current));
        return () => {};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return ref;
};
