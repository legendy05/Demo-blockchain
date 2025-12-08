require('dotenv').config();
const axios = require('axios');

// Hàm Helper: Gửi Request RPC
async function call_rpc(networkName, url, method, params) {
    try {
        const response = await axios.post(url, {
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: 1
        }, { timeout: 10000 }); // Tăng timeout lên 10s

        if (response.data.error) {
            console.error(`⚠️ Lỗi từ ${networkName}:`, response.data.error.message);
            return null;
        }
        return response.data.result;
    } catch (error) {
        console.error(`❌ Không kết nối được ${networkName}:`, error.message);
        return null;
    }
}

// --- 1. PHÂN TÍCH TRẠNG THÁI ETHEREUM ---
async function analyze_ethereum() {
    console.log("\n🔵 ================= ETHEREUM STATE ================= 🔵");
    const url = process.env.BSN_ETH_URL;
    
    // Gọi song song 3 lệnh để lấy full thông tin
    const [blockHex, gasHex, chainIdHex] = await Promise.all([
        call_rpc("ETH", url, "eth_getBlockByNumber", ["latest", false]), // Lấy Block chi tiết
        call_rpc("ETH", url, "eth_gasPrice", []),                        // Lấy giá Gas
        call_rpc("ETH", url, "eth_chainId", [])                          // Lấy ID chuỗi
    ]);

    if (blockHex) {
        // Parse dữ liệu từ Hex sang số
        const blockNum = parseInt(blockHex.number, 16);
        const timestamp = new Date(parseInt(blockHex.timestamp, 16) * 1000);
        const gasPrice = parseInt(gasHex, 16) / 1e9; // Đổi sang Gwei
        const txCount = blockHex.transactions.length;

        console.log(`1. Thông tin Mạng lưới:`);
        console.log(`   - Chain ID:        ${parseInt(chainIdHex, 16)} (Mainnet)`);
        console.log(`   - Giá Gas hiện tại: ${gasPrice.toFixed(2)} Gwei`);
        
        console.log(`2. Trạng thái Block mới nhất (#${blockNum}):`);
        console.log(`   - Thời gian tạo:   ${timestamp.toLocaleString()}`);
        console.log(`   - Miner (Thợ đào): ${blockHex.miner}`);
        console.log(`   - Kích thước khối: ${parseInt(blockHex.size, 16)} bytes`);
        console.log(`   - Mức độ bận rộn:  ${txCount} giao dịch trong block này`);
    }
}

// --- 2. PHÂN TÍCH TRẠNG THÁI NEAR ---
async function analyze_near() {
    console.log("\n⚫ ================= NEAR PROTOCOL STATE ================= ⚫");
    const url = process.env.BSN_NEAR_URL;

    // Near dùng method 'status' để lấy tổng quan và 'gas_price' (hoặc block header)
    // Lưu ý: Params của Near đôi khi là Object {} hoặc Array [] tùy method
    const status = await call_rpc("NEAR", url, "status", []);
    
    // Lấy thông tin Gas (Block mới nhất)
    const blockInfo = await call_rpc("NEAR", url, "block", { finality: "final" });

    if (status && blockInfo) {
        const sync = status.sync_info;
        const version = status.version;
        // Gas trong Near tính bằng YoctoNEAR (10^-24), đổi ra Tgas cho dễ đọc
        const gasPrice = blockInfo.header.gas_price; 

        console.log(`1. Thông tin Node BSN:`);
        console.log(`   - Phiên bản Node:   ${version.version} (Build: ${version.build})`);
        console.log(`   - Chain ID:         ${status.chain_id}`);
        
        console.log(`2. Trạng thái Đồng bộ (Sync Info):`);
        console.log(`   - Block Height:     ${sync.latest_block_height}`);
        console.log(`   - Hash mới nhất:    ${sync.latest_block_hash}`);
        console.log(`   - Thời gian thực:   ${sync.latest_block_time}`);
        
        console.log(`3. Kinh tế (Tokenomics):`);
        console.log(`   - Validator gần nhất: ${status.validator_account_id || "Ẩn danh"}`);
        console.log(`   - Giá Gas cơ sở:    ${gasPrice} yoctoNEAR`);
    }
}

// Chạy chương trình
async function main() {
    await analyze_ethereum();
    await analyze_near();
    console.log("\n✅ Đã lấy xong toàn bộ thông tin trạng thái!");
}

main();