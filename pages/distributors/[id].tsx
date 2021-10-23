import {useRouter} from 'next/router'
import {useEffect, useState} from "react";
import styles from './distributors.module.css';
import {Panel, Button} from "@bigcommerce/big-design";
import Parser from 'html-react-parser';
import {useSession} from '../../context/session';

const Distributor = () => {
    const router = useRouter()
    const {id} = router.query
    const [products, setProducts] = useState([]);
    const [storeLogo, setStoreLogo] = useState(null);
    const [storeName, setStoreName] = useState(null);
    const [foundPosts, setFoundPosts] = useState(null);
    const [load, setLoad] = useState(false);
    const [page, setPage] = useState(0);

    const encodedContext = useSession()?.context;

    const maybeCreateProduct = async (serviceProductId) => {
        try {
            const response = await fetch(`https://smokeshopwholesalers.com/wp-json/wc/v3/products/${serviceProductId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('sswToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const wooProduct = await response.json();
                console.log(wooProduct);
                let bcProduct: any = {
                    name: wooProduct.name,
                    type: wooProduct.virtual ? 'digital ' : 'physical',
                    weight: wooProduct.weight ? wooProduct.weight : 0,
                    price: wooProduct.price ? wooProduct.price : 0,
                    retail_price: wooProduct.regular_price ? wooProduct.regular_price : 0,
                    sale_price: wooProduct.sale_price ? wooProduct.sale_price : 0,
                    description: wooProduct.description,
                    sku: wooProduct.sku ? wooProduct.sku : wooProduct.id,
                    custom_fields: [
                        {
                            name: '_external_product_id',
                            value: wooProduct.id.toString()
                        }
                    ]
                };
                if (wooProduct.type === 'variable') {
                    wooProduct.variations.forEach((el, index) => {
                        bcProduct.variants[index] = {
                            price: el.price,
                            sale_price: el.sale_price,
                            retail_price: el.regular_price,
                            weight: el.weight,
                            sku: el.sku
                        }
                    });
                }
                const newProduct: any = await fetch(`/api/products?context=${encodedContext}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(bcProduct),
                });
                console.log(newProduct);
                await fetch(`/api/products/${newProduct.id}/images?context=${encodedContext}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        "is_thumbnail": true,
                        "sort_order": 1,
                        "description": "Top View",
                        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/7f/Anglel_Bless_Legendary_Hills_1_m%C4%9Bs%C3%ADc_st%C3%A1%C5%99%C3%AD.jpg"
                    }),
                });
            } else {
                console.log(response);
                throw new Error('Ops...');
            }
            console.log();
        } catch (error) {
            alert(error.message);
        }
    }
    console.log(products);
    const getProducts = async () => {
        try {
            const response = await fetch(`https://smokeshopwholesalers.com/wp-json/api/v1/products?distributor=${id}&posts_per_page=12&page=${page}`, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('sswToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            const body = await response.json();
            setProducts([...products, ...body.products]);
            setStoreLogo(body.store_logo);
            setStoreName(body.store_name);
            setFoundPosts(body.found_posts);
            setLoad(false);

            setPage(page + 1);
        } catch (error) {
            // setLoad(false);
            alert(error.message);
        }
    }
    useEffect(() => {
        if (!router.isReady) return;

        getProducts();
        // const handleScroll = () => {
        //     if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        //         if (load === false) {
        //             getProducts();
        //         }
        //     }
        // }
        // window.addEventListener('scroll', async () => {
        //     setLoad(true);
        //     await handleScroll();
        //     setLoad(false);
        // });
        // return () => {
        //     window.removeEventListener('scroll', handleScroll);
        // }

    }, [])

    return (
        <Panel className={styles.productsWrapper}>
            <div className={styles.productsWrapper}>
                {products.length > 0 ? <>
                    <ul className={styles.products}>
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
                    </ul>
                    <div className={styles.loadMore}>
                        <Button onClick={() => {
                            setLoad(true);
                            getProducts();
                        }} actionType="normal" isLoading={load} variant="secondary">
                            Load More
                        </Button>
                    </div>

                </> : <p>No products found...</p>}
            </div>
        </Panel>

    )
}

export default Distributor;