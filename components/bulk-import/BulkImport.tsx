import {useEffect, useReducer, useState} from "react";
import styles from './bulkImport.module.css';
import {useRouter} from "next/router";
import {ProgressCircle, H3, Select, Button, Text} from "@bigcommerce/big-design";
import {DeleteIcon, CloseIcon} from "@bigcommerce/big-design-icons";

const BulkUpload = ({toggleBulkImport, opened, categories, maybeCreateProduct}) => {
    const router = useRouter();
    const {id} = router.query;
    const [products, setProducts] = useState([]);
    const [foundPosts, setFoundPosts] = useState(null);
    const [load, setLoad] = useState(false);
    const [importing, setImporting] = useState(false);
    const [chosenCategory, setChosenCategory] = useState('');
    const [importedProducts, setImportedProducts] = useState([]);

    useEffect(() => {
        if (!router.isReady) return;
        if (!opened) return;
        const getProducts = async () => {
            setLoad(true);
            try {
                const response = await fetch(`https://smokeshopwholesalers.com/wp-json/api/v1/products?distributor=${id}&posts_per_page=-1`, {
                    method: 'GET',
                    redirect: 'follow',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('sswToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const body = await response.json();
                setProducts(body.found_posts > 0 ? body.products : []);
                setFoundPosts(body.found_posts);
                setLoad(false);
            } catch (error) {
                setLoad(false);
                console.log(error.message);
            }
        }
        getProducts();
    }, [opened])
    const startImport = async () => {
        setImporting(true);
        for (const product of products) {
            await maybeCreateProduct(product.id, true);
            await setImportedProducts([...importedProducts, product.id]);
        }
        setImporting(false);
    }
    if (!opened) return null;
    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popup}>
                <div className={styles.closeButtonWrapper}><Button onClick={toggleBulkImport}
                                                                   variant="secondary"><CloseIcon/></Button></div>
                <div className={styles.heading}><H3>Bulk Import</H3></div>
                <div>{foundPosts !== null && <Text>Total products: {foundPosts}</Text>}</div>
                <div className={styles.actionsWrapper}>
                    <Select
                        action={{
                            actionType: 'destructive' as const,
                            content: 'Remove category',
                            icon: <DeleteIcon/>,
                            onActionClick: () => setChosenCategory(''),
                        }}
                        filterable={true}
                        label="Categories"
                        maxHeight={300}
                        onOptionChange={(val) => setChosenCategory(val)}
                        options={categories}
                        placeholder={'Select a category'}
                        required
                        value={chosenCategory}
                    />
                    <Button onClick={startImport} actionType="normal" isLoading={importing}
                            variant="primary">Import</Button>
                </div>
                {products.length > 0 ? <ol className={styles.productsList}>
                    {products.map((el, index) => {
                        console.log(importedProducts.length);
                        if (importedProducts.includes(el.id)) return null;
                        return (
                            <li key={el.id}>{el.name}</li>
                        )
                    })}
                </ol> : load ? <div className={styles.progressBarWrapper}><ProgressCircle size="large"/></div> :
                    <p>No products found...</p>}
            </div>
        </div>
    )
}

export default BulkUpload;