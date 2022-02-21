import {useContext, useState} from "react";
import {Button, Input, Select} from "@bigcommerce/big-design";
import {FiltersContext} from '../../context/filters';
import {useRouter} from "next/router";
import {DeleteIcon} from '@bigcommerce/big-design-icons';
import styles from './searchFilter.module.css';

const SearchFilter = ({toggleBulkImport, getProducts, categories}) => {
    const router = useRouter();
    const {id} = router.query;
    const [loading, setLoading] = useState(false);
    const {filters, setFilters} = useContext(FiltersContext);

    const searchProducts = async () => {
        setLoading(true);
        await getProducts({
            ...filters,
            page: 0
        }, true);
        setLoading(false);
    }
    return (
        <div className={styles.filtersWrapper}>
            <div className={styles.filters}>
                <Select
                    action={{
                        actionType: 'destructive' as const,
                        content: 'Remove category',
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
            <Button variant="subtle" onClick={toggleBulkImport}>Bulk Import</Button>
        </div>

    )
}

export default SearchFilter;