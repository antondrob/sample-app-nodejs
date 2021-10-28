import {useContext, useEffect, useState} from "react";
import {Button, Input, Select} from "@bigcommerce/big-design";
import {FiltersContext} from '../../context/filters';
import {useRouter} from "next/router";
import {DeleteIcon} from '@bigcommerce/big-design-icons';
import styles from './searchFilter.module.css';

const SearchFilter = ({getProducts}) => {
    const router = useRouter();
    const {id} = router.query;
    const [loading, setLoading] = useState(false);
    const {filters, setFilters} = useContext(FiltersContext);
    const [attributes, setAttributes] = useState(null);
    const [categories, setCategories] = useState(null);
    const searchProducts = async () => {
        setLoading(true);
        await getProducts({
            ...filters,
            page: 0
        }, true);
        setLoading(false);
    }
    useEffect(() => {
        if (!router.isReady) return;
        const getAttributes = async () => {
            try {
                const response = await fetch(`https://smokeshopwholesalers.com/wp-json/api/v1/attributes/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('sswToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const body = await response.json();
                    console.log(body);
                    const options = Object.keys(body).map(key => {
                        return {
                            label: key,
                            options: body[key].map(el => {
                                return {value: el.ID, content: el.name}
                            })
                        }
                    });
                    setAttributes(options);
                } else {
                    throw new Error(response.statusText);
                }
            } catch (error) {
                console.log('attributes', error);
            }
        }

        const getCategories = async () => {
            try {
                const response = await fetch(`https://smokeshopwholesalers.com/wp-json/api/v1/categories/${id}?platform=bigcommerce`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('sswToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const body = await response.json();
                    console.log(body);
                    if (body instanceof Object) {
                        const options = Object.keys(body).map(key => {
                            return {value: body[key].term_id, content: body[key].name}
                        });
                        setCategories(options);
                    } else {
                        throw new Error('Array was expected. Make sure you passed platform param.');
                    }

                } else {
                    throw new Error(response.statusText);
                }
            } catch (error) {
                console.log('category', error);
            }
        }
        getAttributes();
        getCategories();
    }, []);
    return (
        attributes !== null && categories !== null && <div className={styles.filters}>
            <Select
                action={{
                    actionType: 'destructive' as const,
                    content: 'Remove attribute',
                    icon: <DeleteIcon/>,
                    onActionClick: () => setFilters({
                        ...filters,
                        category: ''
                    }),
                }}
                filterable={true}
                label="Categories"
                maxHeight={300}
                onOptionChange={(val) => setFilters({
                    ...filters,
                    category: val
                })}
                options={categories}
                placeholder={'Select a category'}
                required
                value={filters.category}
            />
            <Select
                action={{
                    actionType: 'destructive' as const,
                    content: 'Remove attribute',
                    icon: <DeleteIcon/>,
                    onActionClick: () => setFilters({
                        ...filters,
                        attribute: ''
                    }),
                }}
                filterable={true}
                label="Attributes"
                maxHeight={300}
                onOptionChange={(val) => setFilters({
                    ...filters,
                    attribute: val
                })}
                options={attributes}
                placeholder={'Select an attribute'}
                required
                value={filters.attribute}
            />
            <Input
                label="Search"
                type="text"
                value={filters.search}
                onChange={(event) => {
                    setFilters({
                        ...filters,
                        search: event.target.value
                    })
                }}
                placeholder="Search for products"
                required
            />
            <Button onClick={searchProducts} isLoading={loading}>Search</Button>
        </div>
    )
}

export default SearchFilter;