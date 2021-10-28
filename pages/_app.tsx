import {Box, GlobalStyles} from '@bigcommerce/big-design';
import type {AppProps} from 'next/app';
import {useRouter} from 'next/router';
import {createContext, useEffect, useState} from 'react';
import Header from '../components/header';
import SessionProvider from '../context/session';
import {bigCommerceSDK} from '../scripts/bcSdk';
import {FiltersContext} from '../context/filters';

const MyApp = ({Component, pageProps}: AppProps) => {
    const router = useRouter();
    const {query: {context}} = router;
    const [filters, setFilters] = useState({
        search: '',
        attribute: '',
        category: '',
        page: 0
    });
    const value = {filters, setFilters};

    useEffect(() => {
        if (context) bigCommerceSDK(context);
    }, [context]);

    return (
        <>
            <GlobalStyles/>
            <Box marginHorizontal="xxxLarge" marginVertical="xxLarge">
                <Header/>
                <FiltersContext.Provider value={value}>
                    <SessionProvider>
                        <Component {...pageProps} />
                    </SessionProvider>
                </FiltersContext.Provider>
            </Box>
        </>
    );
};

export default MyApp;
