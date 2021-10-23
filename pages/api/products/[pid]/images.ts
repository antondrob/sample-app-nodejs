import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../../lib/auth';

export default async function images(req: NextApiRequest, res: NextApiResponse) {
    const {
        body,
        query: { pid },
        method,
    } = req;
    console.log(body);
    try {
        const {accessToken, storeHash} = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash);
        const {data} = await bigcommerce.post(`/catalog/products/${pid}/images`, body);
        res.status(200).json(data);
    } catch (error) {
        const {message, response} = error;
        res.status(response?.status || 500).json({message});
    }
}
