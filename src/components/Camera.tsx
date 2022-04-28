import { useEffect, useRef, useState } from "react";
import { Box, Center, HStack, IconButton } from "@chakra-ui/react";
import { Camera as CameraIcon, CropFree } from "@mui/icons-material";
import { NextComponentType } from "next";
import { CloseIcon } from "@chakra-ui/icons";

export interface CameraProps {
    imageWidth: number,
    imageHeight: number,
    imageMimeType: string,

    onImageTaken?: (image: Blob) => void,
    onImageCanceled?: () => void
}

const Camera: NextComponentType<{}, {}, CameraProps> = (props) => {
    const {
        imageWidth,
        imageHeight,
        imageMimeType = 'image/png',
        onImageTaken = () => undefined,
        onImageCanceled = () => undefined
    } = props;

    const cameraPreviewRef = useRef<HTMLVideoElement>(null);
    const cameraCanvasRef = useRef(document.createElement('canvas'));

    const [showCameraPreview, setShowCameraPreview] = useState(false);

    useEffect(() => {
        const cameraPreview = cameraPreviewRef.current;
        if (!cameraPreview) return;

        (async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: imageWidth, height: imageHeight } });

            cameraPreview.srcObject = stream;
            cameraCanvasRef.current.width = stream.getTracks()[0].getSettings().width!;
            cameraCanvasRef.current.height = stream.getTracks()[0].getSettings().height!;
            setShowCameraPreview(true);
        })();

        return () => {
            (cameraPreview.srcObject as MediaStream)?.getTracks().forEach((track) => track.stop());
        }
    }, [imageHeight, imageWidth]);

    function takePhoto() {
        if (!cameraPreviewRef.current) return;
        cameraCanvasRef.current.getContext('2d')?.drawImage(cameraPreviewRef.current, 0, 0, cameraCanvasRef.current.width, cameraCanvasRef.current.height);

        closeCameraPreview();

        cameraCanvasRef.current.toBlob((blob) => {
            if (!blob) return;
            onImageTaken(blob);
        }, imageMimeType);
    }

    function closeCameraPreview() {
        (cameraPreviewRef.current?.srcObject as MediaStream)?.getTracks().forEach((track) => track.stop());
        setShowCameraPreview(false);
    }

    return (
        <Box style={{ display: showCameraPreview ? 'block' : 'none' }}>
            <video autoPlay ref={cameraPreviewRef} />

            <Center position="absolute" top="0" width="100%" height="100%" fontSize="8rem" color="whiteAlpha.300">
                <CropFree fontSize="inherit" />
            </Center>

            <HStack padding="0 1em" position="absolute" width="100%" top="1em" justifyContent="flex-end">
                <IconButton size="sm" variant="unstyled" icon={<CloseIcon />} aria-label="Kamera schließen" onClick={() => {
                    closeCameraPreview();
                    onImageCanceled();
                }} />
            </HStack>

            <HStack padding="0 1em" position="absolute" width="100%" bottom="1em" justifyContent="center">
                <IconButton size="lg" fontSize="1.5em" icon={<CameraIcon fontSize="inherit" />} aria-label="Bild aufnehmen" borderRadius="50%" onClick={takePhoto} />
            </HStack>
        </Box>
    );
}

export default Camera;
