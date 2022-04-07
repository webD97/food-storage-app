import { Text } from '@chakra-ui/react';
import type { NextPage } from 'next';

interface KeywordPageProps {
    keyword: string | string[] | undefined
}

const KeywordPage: NextPage<KeywordPageProps> = ({ keyword }) => {
    return <Text>Das Schlagwort lautet <strong>{keyword}</strong></Text>
};

KeywordPage.getInitialProps = (context) => ({ keyword: context.query.keyword });

export default KeywordPage;
