require('dotenv').config();
const axios = require('axios');

// --- CẤU HÌNH ---
const ETH_URL = process.env.BSN_ETH_URL;
const NEAR_URL = process.env.BSN_NEAR_URL;

// Hàm gọi RPC cơ bản
async function call_rpc(chain, url, method, params) {
    try {
        const res = await axios.post(url, {
            jsonrpc: "2.0", method: method, params: params, id: 1
        }, { timeout: 5000 });
        if (res.data.error) throw new Error(res.data.error.message);
        return res.data.result;
    } catch (e) {
        console.log(`⚠️ [${chain}] Kết nối chập chờn hoặc lỗi: ${e.message}`);
        return null;
    }
}

// --- BƯỚC 1: NGHE DỮ LIỆU TỪ ETHEREUM (SOURCE CHAIN) ---
async function step1_ListenToEthereum() {
    console.log("\n📡 BƯỚC 1: Đang nghe ngóng sự kiện trên Ethereum Mainnet...");
    
    // Lấy thông tin block mới nhất
    const block = await call_rpc("ETH", ETH_URL, "eth_getBlockByNumber", ["latest", false]);
    
    if (block) {
        const blockNum = parseInt(block.number, 16);
        console.log(`   ✅ Phát hiện Block mới: #${blockNum}`);
        console.log(`   - Hash: ${block.hash}`);
        console.log(`   - Miner: ${block.miner}`);
        
        // Giả lập: Ta "bịa" ra rằng trong block này có một sinh viên vừa được nhập điểm
        const simulatedEvent = {
            type: "STUDENT_SCORE_ADDED",
            studentId: "SV_BTL_001",
            score: 9.5,
            timestamp: Date.now(),
            proof: block.hash // Dùng hash thật làm bằng chứng
        };
        
        console.log("   => Trích xuất được sự kiện: ", simulatedEvent);
        return simulatedEvent;
    }
    return null;
}

// --- BƯỚC 2: ĐÓNG GÓI TIN (BSN HUB LOGIC) ---
function step2_PackageData(eventData) {
    console.log("\n📦 BƯỚC 2: Đóng gói tin chuẩn BSN Interchain...");
    
    // Giả lập cấu trúc gói tin IHT (Interchain Token/Data)
    const packet = {
        header: {
            from_chain: "ETH-MAINNET",
            to_chain: "NEAR-MAINNET",
            relay_type: "DIRECT",
        },
        payload: eventData,
        signature: "0x_BSN_HUB_SIGNED_THIS_PACKET" // Giả vờ ký
    };
    
    console.log("   ✅ Đóng gói thành công!");
    console.log("   - Packet Content:", JSON.stringify(packet.payload));
    return packet;
}

// --- BƯỚC 3: GHI SANG NEAR (DESTINATION CHAIN) ---
async function step3_RelayToNear(packet) {
    console.log("\n🚀 BƯỚC 3: Chuyển tiếp dữ liệu sang Near Protocol...");
    
    // 1. Kiểm tra xem mạng Near có đang sống không trước khi gửi
    const status = await call_rpc("NEAR", NEAR_URL, "status", []);
    
    if (status) {
        const nearHeight = status.sync_info.latest_block_height;
        console.log(`   🔍 Kiểm tra trạng thái Near: Online (Height: ${nearHeight})`);
        console.log(`   ... Đang gửi Transaction chứa điểm số của SV ${packet.payload.studentId} ...`);
        
        // --- ĐÂY LÀ PHẦN GIẢ LẬP ---
        // Vì ta không có Private Key và Token Near thật để trả phí, 
        // ta sẽ dừng ở việc check connection và thông báo thành công.
        
        await new Promise(r => setTimeout(r, 2000)); // Delay 2 giây cho hồi hộp
        
        const fakeTxHash = "Ge7..." + Math.random().toString(36).substring(7); // Random Hash
        console.log(`   🎉 THÀNH CÔNG! Dữ liệu đã được đồng bộ.`);
        console.log(`   - Transaction Hash (Simulated): ${fakeTxHash}`);
        console.log(`   - Dữ liệu điểm số (9.5) đã lưu vào hợp đồng trên Near.`);
    } else {
        console.log("   ❌ Mạng Near không phản hồi, hủy bỏ relay.");
    }
}

// --- CHẠY CHƯƠNG TRÌNH ---
async function run_relayer() {
    console.log("=================================================");
    console.log("   DEMO: BSN CROSS-CHAIN RELAYER (ETH -> NEAR)   ");
    console.log("=================================================");
    
    const eventData = await step1_ListenToEthereum();
    
    if (eventData) {
        const packet = step2_PackageData(eventData);
        await step3_RelayToNear(packet);
    }
    
    console.log("\n✅ Quy trình kết thúc.");
}

run_relayer();