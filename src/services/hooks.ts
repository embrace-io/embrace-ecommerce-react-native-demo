import {Product} from '../models/Product';
import {useEffect, useMemo, useState} from "react";
import {useEmbraceNativeTracerProvider} from "@embrace-io/react-native-tracer-provider";

/*
  Used to simulate grabbing various attributes of the Product asynchronously with a configurable millisecond delay range
 */
export const useFetchProductSubPart = <T>(product: Product | null, loadId: string, spanName: string, minDelay: number, maxDelay: number) => {
  const {tracer} = useEmbraceNativeTracerProvider({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState<T>();
  const rndDelay = useMemo(() => Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay, [minDelay, maxDelay]);

  useEffect(() => {
    if (product) {
      const span = tracer?.startSpan(spanName, {
        attributes: {
          loadId,
          productId: product.id,
        }
      });

      setTimeout(() => {
        setData(() => product as T);
        setIsLoaded(true);
        span?.end();
      }, rndDelay)
    }

  }, [loadId, product, rndDelay, spanName, tracer]);

  return {isLoaded, data}
}