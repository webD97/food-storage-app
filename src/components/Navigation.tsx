import { Flex, HStack } from '@chakra-ui/react';
import { NextComponentType } from 'next';
import Link from 'next/link';
import React from 'react';

const Navigation: NextComponentType = (props) => {
    return (
        <Flex justifyContent="space-around">
            <Link href="/"><a>Startseite</a></Link>
            <Link href="/scan"><a>Artikel scannen</a></Link>
        </Flex>
    );
}

export default Navigation;
