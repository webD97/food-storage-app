import { ChangeEvent, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Center, IconButton, Image, Input, InputGroup, InputRightElement, Text, Tooltip, VisuallyHiddenInput, VStack } from "@chakra-ui/react";
import { DeleteForever, InsertLink, PhotoCamera, UploadFile } from "@mui/icons-material";
import { NextComponentType } from "next";
import classnames from 'classnames';
import styles from './ArticleImage.module.css';
import Camera from "./Camera";

export interface ArticleImageProps {
    src?: string
}

const ArticleImage: NextComponentType<{}, {}, ArticleImageProps> = (props) => {
    const { src } = props;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [overlayHidden, setOverlayHidden] = useState(true);
    const [showImageUrlInput, setShowImageUrlInput] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    const [temporaryImageSrc, setTemporaryImageSrc] = useState<string | undefined>();

    async function activateImageSelection(variant: 'camera' | 'upload' | 'url') {
        setShowImageUrlInput(false);

        if (variant === 'url') {
            setShowImageUrlInput(true);
        }
        else if (variant === 'upload') {
            fileInputRef.current?.click();
        }
        else if (variant === 'camera') {
            setShowCamera(true);
        }
    }

    function updateTemporarySrc(thing: Blob | File) {
        const reader = new FileReader();

        reader.onload = (e) => {
            setTemporaryImageSrc(e.target!.result as string)
        };

        reader.readAsDataURL(thing);
    }

    function handleCameraImageTaken(blob: Blob) {
        updateTemporarySrc(blob);
        setShowCamera(false);
    }

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.item(0);
        if (!file) return;

        updateTemporarySrc(file);
    }

    return (
        <Box height="sm" width="sm" borderWidth="1px" borderRadius="lg" flexGrow={0} position="relative" overflow="hidden"
            onMouseEnter={() => setOverlayHidden(false)}
            onMouseLeave={() => setOverlayHidden(true)}
        >
            {
                (src !== undefined || temporaryImageSrc !== undefined) && showCamera === false
                    ? (
                        <Image
                            src={temporaryImageSrc || src}
                            alt="Artikelbild"
                            objectFit="contain"
                            align="center center"
                            height="100%"
                            width="100%"
                        />
                    )
                    : null
            }

            {
                showCamera
                    ? null
                    : (
                        <Button variant="unstyled" className={
                            classnames({
                                [styles.overlay]: true,
                                [styles.visible]: (src === undefined || overlayHidden === false) && showCamera === false
                            })
                        }>
                            <Center color="white" >
                                <VStack>
                                    <Text>
                                        {
                                            src === undefined
                                                ? 'Artikelbild hinzufügen'
                                                : 'Artikelbild ändern'
                                        }
                                    </Text>
                                    <ButtonGroup variant="outline">
                                        <Tooltip label="Das aktuelle Bild löschen">
                                            <IconButton size="lg" borderRadius="50%" aria-label="Das aktuelle Bild löschen" icon={<DeleteForever />} onClick={() => undefined} />
                                        </Tooltip>

                                        <Tooltip label="Bild mit der Kamera aufnehmen">
                                            <IconButton size="lg" borderRadius="50%" aria-label="Bild mit der Kamera aufnehmen" icon={<PhotoCamera />} onClick={() => activateImageSelection('camera')} />
                                        </Tooltip>

                                        <Tooltip label="Ein vorhandenes Bild auswählen">
                                            <IconButton size="lg" borderRadius="50%" aria-label="Ein vorhandenes Bild auswählen" icon={<UploadFile />} onClick={() => activateImageSelection('upload')} />
                                        </Tooltip>

                                        <Tooltip label="Ein Bild aus dem Internet benutzen">
                                            <IconButton size="lg" borderRadius="50%" aria-label="Ein Bild aus dem Internet benutzen" icon={<InsertLink />} onClick={() => activateImageSelection('url')} />
                                        </Tooltip>
                                    </ButtonGroup>

                                    {
                                        !showImageUrlInput
                                            ? null
                                            : (
                                                <InputGroup size="md" position="absolute" top="calc(50% + 3em)" width="75%">
                                                    <Input autoFocus paddingRight="4.5rem" backgroundColor="rgba(255, 255, 255, .33)" />
                                                    <InputRightElement width="4.5rem">
                                                        <Button variant="ghost" color="unset" h="1.75rem" size="sm">OK</Button>
                                                    </InputRightElement>
                                                </InputGroup>
                                            )
                                    }
                                </VStack>
                            </Center>
                        </Button>
                    )
            }
            {
                showCamera
                    ? (
                        <Camera
                            imageWidth={512} imageHeight={512}
                            imageMimeType="image/webp"
                            onImageCanceled={() => setShowCamera(false)}
                            onImageTaken={handleCameraImageTaken}
                        />
                    )
                    : null
            }
            <VisuallyHiddenInput ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
        </Box>
    );
}

export default ArticleImage;
