import {useRouter} from 'next/router'
import {useContext, useEffect, useState} from "react";
import styles from './distributors.module.css';
import {Panel, Button, Input, Select, Link as StyledLink, ProgressCircle} from "@bigcommerce/big-design";
import {AddIcon} from '@bigcommerce/big-design-icons';
import Parser from 'html-react-parser';
import {useSession} from '../../context/session';
import SearchFilter from '@components/search-filter/SearchFilter';
import {TGetProducts} from "../../types/products";
import {FiltersContext} from '../../context/filters';

const Distributor = () => {
    const router = useRouter();
    const {id} = router.query;
    const [products, setProducts] = useState([]);
    const [storeLogo, setStoreLogo] = useState(null);
    const [storeName, setStoreName] = useState(null);
    const [foundPosts, setFoundPosts] = useState(null);
    const [load, setLoad] = useState(false);
    const [productError, setProductError] = useState(null);
    const [catError, setCatError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [addNewCat, setAddNewCat] = useState(false);
    const [newCat, setNewCat] = useState('');
    const [existingCat, setExistingCat] = useState(0);
    const [loadingProducts, setLoadingProducts] = useState([]);
    const encodedContext = useSession()?.context;
    const [importedProducts, setImportedProducts] = useState([]);
    const [createCatLoad, setCreateCatLoad] = useState(false);
    const postsPerPage = 12;

    const {filters, setFilters} = useContext(FiltersContext);
    console.log(filters);
    const getImportedProducts = () => {
        return importedProducts;
    }
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
                if (existingCat) {
                    bcProduct.categories = [existingCat]
                }
                const newProductResponse: any = await fetch(`/api/products?context=${encodedContext}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(bcProduct)
                });
                const newProductBody = await newProductResponse.json();
                if (newProductBody?.id) {
                    if (wooProduct.images.length > 0) {
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

                        await setImportedProducts([...getImportedProducts(), serviceProductId])
                    }
                }

            } else {
                console.log(response);
                throw new Error('Ops...');
            }
        } catch (error) {
            console.log(error.message);
        }
    }
    const getProducts = async (params: TGetProducts, filter = false) => {
        const esc = encodeURIComponent;
        const query = Object.keys(params)
            .map(k => esc(k) + '=' + esc(params[k]))
            .join('&');
        try {
            const response = await fetch(`https://smokeshopwholesalers.com/wp-json/api/v1/products?distributor=${id}&posts_per_page=${postsPerPage}&${query}`, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('sswToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            const body = await response.json();
            if (filter) {
                setProducts(body.found_posts > 0 ? body.products : []);
            } else {
                setProducts([...products, ...body.products]);
            }
            setStoreLogo(body.store_logo);
            setStoreName(body.store_name);
            setFoundPosts(body.found_posts);
            setLoad(false);
            setFilters({
                ...params,
                page: filter ? 1 : params.page + 1
            });
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
            console.log(response.ok);
            if (response.ok) {
                const body = await response.json();
                setCategories(body.map(el => ({value: el.id, content: el.name})));
            } else {
                throw new Error(response.statusText)
            }
        } catch (error) {
            setCatError(error.message);
        }
    }
    useEffect(() => {
        if (!router.isReady) return;
        getProducts(filters);
        getCategories();
        return () => {
            setFilters({
                search: '',
                attribute: '',
                category: '',
                page: 0
            });
        }
    }, [])

    const selectItem = (productId, tagName) => {
        if (tagName === 'path' || tagName === 'svg') {
            return false;
        }
        const index = selectedItems.indexOf(productId);
        if (index > -1) {
            setSelectedItems(selectedItems.filter(el => el !== productId));
        } else {
            setSelectedItems([...selectedItems, productId]);
        }
    }

    const importProducts = async () => {
        for (const selectedItem of selectedItems) {
            setLoadingProducts([...loadingProducts, selectedItem]);
            await maybeCreateProduct(selectedItem);
            setLoadingProducts(loadingProducts.filter(el => el !== selectedItem));
        }
    }

    const createCategory = async () => {
        setCreateCatLoad(true);
        try {
            const response = await fetch(`/api/categories?context=${encodedContext}`, {
                method: 'POST',
                redirect: 'follow',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    parent_id: existingCat,
                    name: newCat
                })
            });
            if (response.ok) {
                const body = await response.json();
                await getCategories();
                setCreateCatLoad(false);
                setExistingCat(0);
                setNewCat('');
                setAddNewCat(false);
            } else {
                throw new Error(response.statusText);
            }
        } catch (error) {
            setCreateCatLoad(false);
            alert(error.message)
        }
    }

    return (
        <Panel className={styles.productsWrapper}>
            <SearchFilter getProducts={getProducts}/>
            <div className={products.length > 0 ? styles.productsWrapper : ''}>
                {products.length > 0 ? <>
                    <ul className={styles.products}>
                        {products.map(product => {
                            return (
                                <li key={product.id}
                                    onClick={(event) => selectItem(product.id, (event.target as HTMLElement).tagName)}
                                    className={`${styles.product}${selectedItems.includes(product.id) ? ` ${styles.selectedItem}` : ''}${loadingProducts.includes(product.id) ? ` ${styles.loadingItem}` : ''}${importedProducts.includes(product.id) ? ` ${styles.importedItem}` : ''}`}
                                    data-product={product.id}>
                                    <img className={styles.storeLogo} src={storeLogo}
                                         alt="Store Logo"/>
                                    <div className={styles.productImage}>
                                        {Parser(product.image)}
                                    </div>
                                    <p className={styles.productName}>{product.name}</p>
                                    <p className={styles.storePrice}>{Parser(product.price_html)}</p>

                                    <span className={styles.addProduct}
                                          data-product={product.id}>
                                        {loadingProducts.includes(product.id) ? <ProgressCircle size="xSmall"/> :
                                            <AddIcon onClick={async () => {
                                                setLoadingProducts([...loadingProducts, product.id]);
                                                await maybeCreateProduct(product.id);
                                                setLoadingProducts(loadingProducts.filter(el => el !== product.id));
                                            }}/>}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                    {foundPosts > postsPerPage && <div className={styles.loadMore}>
                        <Button onClick={() => {
                            setLoad(true);
                            getProducts(filters);
                        }} actionType="normal" isLoading={load} variant="secondary">
                            Load More
                        </Button>
                    </div>}
                    {selectedItems.length > 0 && <div className={styles.popup}>
                        <p>Selected products: <span>{selectedItems.length}</span></p>
                        {categories !== null && <div>
                            {!addNewCat && <div className={styles.existingCats}>
                                <Select
                                    filterable={true}
                                    placeholder={'Choose category'}
                                    options={categories}
                                    value={existingCat}
                                    onOptionChange={(val) => setExistingCat(val)}
                                    required
                                />
                                <StyledLink href="#" onClick={(e) => {
                                    e.preventDefault();
                                    setExistingCat(0);
                                    setAddNewCat(true);
                                }}>Add new</StyledLink>
                            </div>}
                            {addNewCat && <div className={styles.existingCats}>
                                <Input
                                    value={newCat}
                                    type="text"
                                    onChange={(event) => setNewCat(event.target.value)}
                                    label="New category"
                                    required
                                />
                                <Select
                                    filterable={true}
                                    placeholder={'Choose category'}
                                    label="Parent category"
                                    options={categories}
                                    value={existingCat}
                                    onOptionChange={(val) => setExistingCat(val)}
                                />
                                <div className={styles.createCatActions}>
                                    <Button variant="subtle" onClick={(e) => {
                                        e.preventDefault();
                                        setExistingCat(0);
                                        setNewCat('');
                                        setAddNewCat(false);
                                    }}>Cancel</Button>
                                    <Button variant="secondary" onClick={createCategory}
                                            isLoading={createCatLoad}>Create</Button>
                                </div>

                            </div>}
                            {!addNewCat && <div className={styles.importActions}>
                                <Button variant="subtle">Cancel</Button>
                                <Button variant="secondary" onClick={importProducts}>Import</Button>
                            </div>}
                        </div>}
                    </div>}

                </> : productError !== null ? <p>{productError}</p> :
                    <div className={styles.progressBarWrapper}><ProgressCircle size="large"/></div>}
            </div>
        </Panel>

    )
}

export default Distributor;