import { Text, Box, Button, ButtonGroup, Container, Heading, HStack, Icon, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, Tooltip, useColorMode } from '@chakra-ui/react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useRef } from 'react';
import { useClient } from 'react-ketting';
import QuaggaScanner from './QuaggaScanner';
import { QrCodeScanner, InvertColors } from '@mui/icons-material';

const Layout: NextPage = (props) => {
    const router = useRouter();
    const client = useClient();
    const { toggleColorMode } = useColorMode();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalCanSubmit, setModalCanSubmit] = useState(false);
    const [gtinIsUnknown, setGtinIsUnknown] = useState(false);
    const [currentGtin, setCurrentGtin] = useState('');

    const scannerRef = useRef(null);

    return (
        <>
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Box as="header" position="sticky" top="0" backgroundColor="teal" width="100%" marginBottom="8">
                <HStack height="48px" alignItems="center" justifyContent="space-between" padding="0 1em">
                    <Heading as="h1" size="lg">
                        <Link href="/">
                            <a>Vorräte App</a>
                        </Link>
                    </Heading>
                    <Box>
                        <Tooltip label="Farben umschalten">
                            <IconButton
                                size="sm"
                                variant="outline"
                                icon={<InvertColors />}
                                onClick={toggleColorMode}
                                aria-label="Farben umschalten"
                            />
                        </Tooltip>
                    </Box>
                </HStack>
            </Box>

            <Container as="main" maxWidth="container.xl">
                {props.children}
            </Container>

            <Modal size="xl" isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Artikel erfassen</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div ref={scannerRef} style={{ position: 'relative', width: '480px', height: '360px' }}>
                            <QuaggaScanner
                                scannerRef={scannerRef}
                                onDetected={async (result) => {
                                    setCurrentGtin(result.codeResult.code!);
                                    setModalCanSubmit(true);

                                    const articleResponse = await client.go(`articles/${result.codeResult.code!}`).fetch();

                                    setGtinIsUnknown(articleResponse.status === 404);
                                }}
                            />
                        </div>
                        <Text>
                        {
                            !currentGtin
                                ? <><Spinner size="xs" /> Barcode wird gesucht</>
                                : <>Erkannt: {currentGtin}</>
                        }
                        </Text>
                    </ModalBody>

                    <ModalFooter>
                        <ButtonGroup colorScheme="blue">
                            <Button variant="ghost" onClick={() => setModalOpen(false)}>Doch nicht</Button>
                            <Button disabled={!modalCanSubmit} onClick={async () => {
                                setModalOpen(false);

                                if (gtinIsUnknown) {
                                    await client.go('articles').post({
                                        data: {
                                            gtin: currentGtin,
                                            name: 'Neuer Artikel'
                                        }
                                    });
                                }

                                router.push(`/articles/${currentGtin}`);
                            }}>
                                {
                                    gtinIsUnknown
                                        ? 'Anlegen'
                                        : 'Weiter'
                                }
                            </Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Tooltip label="Artikel scannen">
                <Button width="3.5em" height="3.5em"
                    size="lg"
                    variant="solid"
                    style={{
                        backgroundColor: 'teal',
                        borderRadius: '50%',
                        color: "white",
                        position: "fixed",
                        bottom: "2rem",
                        right: "2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    onClick={() => setModalOpen(true)}
                >
                    <Icon fontSize="2em" as={QrCodeScanner} />
                </Button>
            </Tooltip>
        </>
    )
};

export default Layout
