import axios from 'axios';

export default async function handler(req, res) {
    // --- 1. Cấu hình CORS (Cho phép trình duyệt truy cập) ---
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Xử lý request Preflight (OPTIONS) cho trình duyệt
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // --- 2. Đọc cấu hình từ Environment Variables (BẢO MẬT) ---
    const TENANT_ID = process.env.TENANT_ID;
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    
    // SCOPE cho Azure Resource Manager API (management.azure.com)
    const SCOPE = 'https://management.azure.com/.default';
    const MS_TOKEN_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

    // --- 3. Kiểm tra Environment Variables ---
    if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
        console.error('[Error] Missing environment variables');
        return res.status(500).json({
            error: 'Server configuration error',
            message: 'Missing required environment variables (TENANT_ID, CLIENT_ID, CLIENT_SECRET)'
        });
    }

    // --- 4. Chỉ chấp nhận POST ---
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method Not Allowed',
            message: 'Chỉ hỗ trợ phương thức POST'
        });
    }

    try {
        console.log(`[Vercel] >>> Đang lấy Azure Management Token cho Client ID: ${CLIENT_ID.substring(0, 8)}...`);

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);
        params.append('scope', SCOPE);

        const response = await axios.post(MS_TOKEN_URL, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Trả về dữ liệu cho Client
        console.log('[Vercel] >>> Azure Management Token retrieved successfully');
        return res.status(200).json(response.data);

    } catch (error) {
        const errorData = error.response?.data || { message: error.message };
        console.error(`[Vercel Error]:`, JSON.stringify(errorData));
        return res.status(error.response?.status || 500).json({
            error: 'Azure Management Token retrieval failed',
            details: errorData
        });
    }
}
