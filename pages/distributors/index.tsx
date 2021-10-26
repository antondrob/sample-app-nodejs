import {Panel, ProgressCircle} from "@bigcommerce/big-design";
import {useEffect, useState} from "react";
import styles from './distributors.module.css';
import {useSession} from "../../context/session";
import Link from 'next/link';

const Distributors = () => {
    const encodedContext = useSession()?.context;
    console.log(encodedContext);
    const [distributors, setDistributors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        const getDistributors = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://smokeshopwholesalers.com/wp-json/api/v1/distributors`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('sswToken')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const body = await response.json();
                    setDistributors(body);
                } else {
                    console.log(response);
                    throw new Error('Ops...');
                }
            } catch (error) {
                setDistributors(null);
                setLoading(false);
                setError(error.message);
            }
        }
        getDistributors();
    }, []);

    return (
        <Panel header="Distributors">
            {distributors !== null ? <div className={styles.distributors}>
                {Object.keys(distributors).map(key => (
                    <Link key={key} href={`/distributors/${key}`}>
                        <a className={styles.link}>
                            <div className={styles.backgroundImage}
                                 style={{backgroundImage: `url(${distributors[key].logo})`}}>
                                <div className={styles.distributorName}>
                                    <span className={styles.distributorTitle}>${distributors[key].store_name}</span>
                                </div>
                            </div>
                        </a>
                    </Link>
                ))}
            </div> : error !== null ? <p>{error}</p> :
                <div className={styles.progressBarWrapper}><ProgressCircle size="large"/></div>}
        </Panel>
    );
}

export default Distributors;