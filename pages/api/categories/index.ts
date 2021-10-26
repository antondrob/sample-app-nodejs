import {NextApiRequest, NextApiResponse} from 'next';
import {bigcommerceClient, getSession} from '../../../lib/auth';

export default async function categories(req: NextApiRequest, res: NextApiResponse) {
    const {
        method,
        body
    } = req;

    switch (method) {
        case 'GET':
            try {
                const {accessToken, storeHash} = await getSession(req);
                const bigcommerce = bigcommerceClient(accessToken, storeHash);
                const {data} = await bigcommerce.get('/catalog/categories');
                res.status(200).json(data);
            } catch (error) {
                const {message, response} = error;
                res.status(response?.status || 500).json({message});
            }
            break;
        case 'POST':
            try {
                const {accessToken, storeHash} = await getSession(req);
                const bigcommerce = bigcommerceClient(accessToken, storeHash);
                const {data} = await bigcommerce.post('/catalog/categories', body);
                res.status(200).json(data);
            } catch (error) {
                const {message, response} = error;
                res.status(response?.status || 500).json({message});
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
