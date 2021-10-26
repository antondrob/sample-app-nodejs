import {useRouter} from 'next/router'
import {useCallback, useEffect, useState} from "react";
import styles from './distributors.module.css';
import {Panel, Button} from "@bigcommerce/big-design";
import Parser from 'html-react-parser';
import {useSession} from '../../context/session';
import Select from 'react-select';

const Distributor = () => {
    const router = useRouter()
    const {id} = router.query
    const [products, setProducts] = useState([]);
    const [storeLogo, setStoreLogo] = useState(null);
    const [storeName, setStoreName] = useState(null);
    const [foundPosts, setFoundPosts] = useState(null);
    const [load, setLoad] = useState(false);
    const [page, setPage] = useState(0);
    const [productError, setProductError] = useState(null);
    const [catError, setCatError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [categories, setCategories] = useState(null);
    const [addNewCat, setAddNewCat] = useState(false);
    const [newCat, setNewCat] = useState('');

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
                const newProductResponse: any = await fetch(`/api/products?context=${encodedContext}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(bcProduct)
                });
                if (wooProduct.images.length > 0) {
                    const newProductBody = await newProductResponse.json();
                    console.log(newProductBody);
                    await fetch(`/api/products/${newProductBody.id}/images?context=${encodedContext}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            is_thumbnail: true,
                            sort_order: 1,
                            description: wooProduct.images[0].name ? wooProduct.images[0].name : '',
                            image_url: wooProduct.images[0].src
                        })
                    });
                }
            } else {
                console.log(response);
                throw new Error('Ops...');
            }
            console.log();
        } catch (error) {
            alert(error.message);
        }
    }
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
            setLoad(false);
            setProductError(error.message);
        }
    }
    const getCategories = async () => {
        try {
            const response = await fetch(`/api/categories?context=${encodedContext}`, {
                method: 'GET',
                redirect: 'follow'
            });
            if (response.ok) {
                const body = await response.json();
                setCategories(body);
            } else {
                throw new Error(response.statusText)
            }
        } catch (error) {
            setCatError(error.message);
        }
    }
    useEffect(() => {
        if (!router.isReady) return;
        getProducts();
        getCategories();
    }, [])

    const selectItem = (productId) => {
        const index = selectedItems.indexOf(productId);
        if (index > -1) {
            setSelectedItems(selectedItems.filter(el => el !== productId));
        } else {
            setSelectedItems([...selectedItems, productId]);
        }
    }

    return (
        <Panel className={styles.productsWrapper}>
            <div className={styles.productsWrapper}>
                {products.length > 0 ? <>
                    <ul className={styles.products}>
                        {products.map(product => {
                            return (
                                <li key={product.id} onClick={() => selectItem(product.id)}
                                    className={`${styles.product} ${selectedItems.indexOf(product.id) > -1 ? styles.selectedItem : ''}`}
                                    data-product={product.id}>
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
                    {selectedItems.length > 0 && <div className={styles.popup}>
                        <p>Selected products: <span>{selectedItems.length}</span></p>
                        {categories !== null && <div>
                            {!addNewCat && <div className={styles.existingCats}>
                                <select name="cat_for_selected">
                                    <option value="">-Choose category-</option>
                                    {categories.map(el => (
                                        <option key={el.id} value={el.id}>{el.name}</option>
                                    ))}
                                    <option className="level-0" value="101">Smokeshopnearme</option>
                                </select>
                                <a href="#" onClick={() => setAddNewCat(true)}>Add new</a>
                            </div>}
                            {addNewCat && <div className="add-new-cat">
                                <label htmlFor="product_cat">New category</label>
                                <input value={newCat} type="text" name="product_cat" onChange={(event) => setNewCat(event.target.value)}/>
                                <label htmlFor="cat_for_selected">Parent category</label>
                                <select name="cat_for_selected">
                                    <option value="">-Choose category-</option>
                                    {categories.map(el => (
                                        <option key={el.id} value={el.id}>{el.name}</option>
                                    ))}
                                </select>
                                <a href="#" onClick={() => setAddNewCat(false)}>Cancel</a>
                            </div>}
                            <div id="import-actions">
                                <button className="button">Import</button>
                                <a href="#" className="cancel">Cancel</a>
                            </div>
                        </div>}
                    </div>}

                </> : <p>No products found...</p>}
            </div>
        </Panel>

    )
}

export default Distributor;