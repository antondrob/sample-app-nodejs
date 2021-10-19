import {Link, Panel} from "@bigcommerce/big-design";
import {useContext, useEffect, useState} from "react";
import styles from './importStyles.module.css';
import {useSession} from "../context/session";

const Distributors = ({context}: { context: string }) => {
    const test = useSession();
    console.log(context);
    console.log(test);
    // useEffect(() => {
    //     if (context) setContext(context);
    //     if (context) {
    //         fetch(`/api/products?context=${context}`, {
    //             method: 'GET',
    //             headers: {'Content-Type': 'application/json'}
    //         })
    //             .then(response => response.json())
    //             .then(data => {
    //                 console.log('data', data);
    //             })
    //             .catch(error => {
    //                 console.log('error', error);
    //             });
    //     }
    // }, [context, setContext]);


    // useEffect(() => {
    //     if (context) setContext(context);
    // }, [context, setContext]);

    console.log(context);
    return (
        <Panel header="Dashboard">

        </Panel>
    );
}

export default Distributors;