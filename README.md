# Azure Management Token Service

Serverless API proxy để lấy **Azure Resource Manager (ARM) Access Token** - dùng cho việc quản lý tài nguyên Azure như Fabric Capacity, Resource Groups, v.v.

## 🎯 Mục đích

Token này được sử dụng để gọi các Azure Management API tại `https://management.azure.com/`:
- Kiểm tra trạng thái Fabric Capacity
- Start/Resume/Suspend Capacity
- Quản lý các tài nguyên Azure khác

## 📋 Yêu cầu

### 1. App Registration trong Azure AD (Microsoft Entra ID)
- `Client ID`: ID của ứng dụng đã đăng ký
- `Client Secret`: Secret key của ứng dụng
- `Tenant ID`: ID của tenant Azure AD

### 2. Cấp quyền IAM cho App Registration
> ⚠️ **QUAN TRỌNG**: Chỉ có Token thôi là chưa đủ!

1. Truy cập **Azure Portal**
2. Tìm đến **Resource Group** hoặc **Resource** cần quản lý
3. Chọn **Access Control (IAM)**
4. Nhấn **Add** → **Add role assignment**
5. Chọn Role:
   - `Reader`: Chỉ xem trạng thái
   - `Contributor`: Xem + điều khiển (Start/Resume/Suspend)
6. **Select members**: Tìm và chọn App Registration theo Client ID

## 🚀 Cài đặt & Deploy

### Local Development
```bash
# Cài đặt dependencies
npm install

# Copy file .env
cp .env.example .env

# Điền thông tin vào .env
# TENANT_ID=...
# CLIENT_ID=...
# CLIENT_SECRET=...

# Chạy local
npm run dev
```

### Deploy lên Vercel
```bash
# Deploy production
npm run deploy
```

Sau đó cấu hình Environment Variables trên Vercel Dashboard:
- `TENANT_ID`
- `CLIENT_ID`
- `CLIENT_SECRET`

## 📡 Sử dụng API

### Endpoint
```
POST /api/get-azure-token
```

### Response
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3599
}
```

## 💡 Ví dụ sử dụng trong Python

```python
import requests

def get_azure_management_token():
    """Lấy Azure Management Token từ proxy service"""
    response = requests.post("https://your-vercel-url.vercel.app/api/get-azure-token")
    return response.json()["access_token"]

def get_capacity_status():
    """Kiểm tra trạng thái Fabric Capacity"""
    token = get_azure_management_token()
    
    api_url = (
        "https://management.azure.com/subscriptions/{subscription_id}"
        "/resourceGroups/{resource_group}"
        "/providers/Microsoft.Fabric/capacities/{capacity_name}"
        "?api-version=2023-11-01"
    )
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(api_url, headers=headers)
    
    return response.json()["properties"]["state"]

# Sử dụng
print(f"Trạng thái hiện tại: {get_capacity_status()}")
```

## 🔒 Bảo mật

- ❌ **KHÔNG** commit file `.env` lên GitHub
- ✅ Sử dụng Environment Variables trên Vercel
- ✅ App Registration chỉ được cấp quyền cần thiết (Principle of Least Privilege)

## 📚 Tham khảo

- [Azure Resource Manager REST API](https://learn.microsoft.com/en-us/rest/api/resources/)
- [Microsoft Identity Platform - Client Credentials Flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow)
- [Azure RBAC - Role Assignments](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal)
