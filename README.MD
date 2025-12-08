# 🌐 BSN Global Multi-Chain Gateway Demo

Dự án thực nghiệm kết nối và tương tác với mạng lưới Blockchain đa nền tảng (Ethereum & Near Protocol) thông qua hạ tầng **BSN Permissionless Services**.

Dự án được xây dựng bằng **Node.js**, minh họa khả năng truy xuất dữ liệu trạng thái (State Info) từ các Public Chain mà không cần vận hành Full Node.

## 🚀 Tính năng chính

* **Kết nối Đa chuỗi (Multi-chain):** Hỗ trợ kết nối đồng thời Ethereum (EVM) và Near Protocol (Non-EVM).
* **Truy xuất thông tin trạng thái:**
    * **Ethereum:** Lấy Block Header, Miner, Gas Price, Chain ID.
    * **Near:** Lấy Sync Info, Validator, Block Height.

## 🛠️ Công nghệ sử dụng

* **Runtime:** Node.js (v18+)
* **Language:** JavaScript
* **Libraries:**
    * `axios`: Gửi HTTP Requests (JSON-RPC).
    * `dotenv`: Quản lý biến môi trường.
* **Infrastructure:** BSN Global Gateway (Hong Kong PCN).

## 📦 Cài đặt

1.  **Clone dự án về máy:**
    ```bash
    git clone [https://github.com/username/BSN-Project-Group3.git](https://github.com/username/BSN-Project-Group3.git)
    cd BSN-Project-Group3
    ```

2.  **Cài đặt các thư viện phụ thuộc:**
    ```bash
    npm install
    ```

## ⚙️ Cấu hình (Quan trọng)

Dự án yêu cầu các thông số kết nối từ BSN Portal. Bạn cần tạo file cấu hình môi trường:

1.  Tạo file `.env` tại thư mục gốc (ngang hàng với `package.json`).
2.  Copy nội dung dưới đây và điền URL dự án của bạn vào:

```ini
# --- CẤU HÌNH BSN GATEWAY ---

# 1. Ethereum Mainnet Endpoint (Lấy từ BSN Portal)
BSN_ETH_URL=[https://hk.bsngate.com/api/YOUR_PROJECT_KEY/ETH-Mainnet/rpc](https://hk.bsngate.com/api/YOUR_PROJECT_KEY/ETH-Mainnet/rpc)

# 2. Near Mainnet Endpoint
BSN_NEAR_URL=[https://hk.bsngate.com/api/YOUR_PROJECT_KEY/Near-Mainnet/rpc](https://hk.bsngate.com/api/YOUR_PROJECT_KEY/Near-Mainnet/rpc)

# 3. Cấu hình Timeout (mặc định 10s)
TIMEOUT=10000