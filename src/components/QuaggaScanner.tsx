import { useCallback, useEffect } from 'react';
import Quagga, { QuaggaJSResultObject } from '@ericblade/quagga2';
import { NextComponentType } from "next";

function getMedian(arr: number[]) {
    arr.sort((a, b) => a - b);
    const half = Math.floor(arr.length / 2);
    if (arr.length % 2 === 1) {
        return arr[half];
    }
    return (arr[half - 1] + arr[half]) / 2;
}

function getMedianOfCodeErrors(decodedCodes: QuaggaJSResultObject["codeResult"]["decodedCodes"]) {
    const errors = decodedCodes.filter(x => x.error !== undefined).map(x => x.error) as number[];
    const medianOfErrors = getMedian(errors);
    return medianOfErrors;
}

export interface QuaggaScannerProps {
    onDetected: (result: QuaggaJSResultObject) => void,
    scannerRef: any
}

const QuaggaScanner: NextComponentType<{}, {}, QuaggaScannerProps> = ({
    onDetected,
    scannerRef,
}) => {
    const errorCheck = useCallback((result: QuaggaJSResultObject) => {
        if (!onDetected) {
            return;
        }
        const err = getMedianOfCodeErrors(result.codeResult.decodedCodes);
        // if Quagga is at least 92.75% certain that it read correctly, then accept the code.
        if (err < 0.075) {
            onDetected(result);
        }
    }, [onDetected]);


    useEffect(() => {
        Quagga.init({
            inputStream: {
                type: 'LiveStream',
                constraints: {
                    width: 1024,
                    height: 768,
                },
                target: scannerRef.current,
            },
            locator: {
                patchSize: 'medium',
                halfSample: true,
            },
            numOfWorkers: navigator.hardwareConcurrency || 0,
            decoder: { readers: ['ean_reader'] },
            locate: true,
        }, (err) => {
            if (err) {
                return console.log('Error starting Quagga:', err);
            }
            if (scannerRef && scannerRef.current) {
                Quagga.start();
            }
        });
        Quagga.onDetected(errorCheck);
        return () => {
            Quagga.offDetected(errorCheck);
            Quagga.stop();
        };
    }, [onDetected, scannerRef, errorCheck]);

    return null;
}

export default QuaggaScanner;
