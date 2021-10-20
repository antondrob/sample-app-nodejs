import {useRouter} from 'next/router'
import {useEffect, useState} from "react";
import styles from './distributors.module.css';
import {Panel} from "@bigcommerce/big-design";
import Parser from 'html-react-parser';
import {useSession} from '../../context/session';
import {margin} from "polished";

const Distributor = () => {
    const router = useRouter()
    const {id} = router.query
    const [products, setProducts] = useState(null);
    const [storeLogo, setStoreLogo] = useState(null);
    const [storeName, setStoreName] = useState(null);
    const [foundPosts, setFoundPosts] = useState(null);

    const encodedContext = useSession()?.context;
    console.log(encodedContext);

    const maybeCreateProduct = async (serviceProductId) => {

        try {
            const response = await fetch(`https://smokeshopwholesalers.com/wp-json/wc/v3/products/${serviceProductId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('sswToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const body = await response.json();
                await fetch(`/api/products?context=${encodedContext}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        "name": "BigCommerce Coffee Mug",
                        "price": "10.00",
                        "categories": [
                            23,
                            21
                        ],
                        "weight": 4,
                        "type": "physical"
                    }),
                });
                console.log(body);
            } else {
                console.log(response);
                throw new Error('Ops...');
            }
            console.log();
        } catch (error) {
            alert(error.message);
        }
    }

    useEffect(() => {
        if (!router.isReady) return;
        const getProducts = async () => {
            try {
                const response = await fetch(`https://smokeshopwholesalers.com/wp-json/api/v1/products?distributor=${id}&posts_per_page=12`, {
                    method: 'GET',
                    redirect: 'follow',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('sswToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const body = await response.json();
                setProducts(body.products);
                setStoreLogo(body.store_logo);
                setStoreName(body.store_name);
                setFoundPosts(body.found_posts);
            } catch (error) {
                alert(error.message);
            }
        }
        getProducts();
    }, [id])

    return (
        <Panel className={styles.productsWrapper}>
            <div className={styles.productsWrapper}>
                {products !== null ? <ul className={styles.products}>
                    {products.map(product => {
                        return (
                            <li key={product.id} className={styles.product} data-product={product.id}>
                                <img className={styles.storeLogo} src={storeLogo}
                                     alt="Store Logo"/>
                                <div className={styles.productImage}>
                                    {Parser(product.image)}
                                </div>
                                <p className={styles.productName}>{product.name}</p>
                                <p className={styles.storePrice}>{Parser(product.price_html)}</p>
                                <span onClick={() => maybeCreateProduct(product.id)} className={styles.addProduct}
                                      data-product={product.id}>+</span>
                            </li>
                        )
                    })}
                </ul> : <p>No products found...</p>}
            </div>
        </Panel>

    )
}

export default Distributor;