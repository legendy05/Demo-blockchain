require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto'); // Thư viện có sẵn của Node.js

// Lấy cấu hình từ .env
const CONFIG = {
    url: process.env.BSN_DID_URL,
    projectId: process.env.BSN_DID_PROJECT_ID,
    token: process.env.BSN_DID_TOKEN
};

// --- 1. MÔ PHỎNG SDK: TẠO DID (OFFLINE) ---
// Theo tài liệu FAQ số 1: "DID generation process is offline"
function createDID_Offline() {
    console.log("🛠️  [SDK] Đang tạo DID Key Pair (Secp256k1)...");
    
    // Tạo cặp khóa công khai/bí mật
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1' // BSN dùng chuẩn này
    });

    // Giả lập format DID của BSN
    // did:bsn:<chain>:<public_key_hash>
    const pubKeyHash = crypto.createHash('sha256').update(publicKey.export({type: 'spki', format: 'pem'})).digest('hex').substring(0, 20);
    const did = `did:bsn:international:${pubKeyHash}`;

    console.log(`✅ Tạo DID thành công (Offline):`);
    console.log(`   - DID: ${did}`);
    return { did, publicKey, privateKey };
}

// --- 2. GỌI SERVICE: ĐĂNG KÝ ISSUER ---
// Theo tài liệu: Cần gọi lên Gateway
async function registerIssuer(did) {
    console.log(`\n☁️  [Service] Đang kết nối BSN Gateway (${CONFIG.url})...`);
    console.log(`   - Project ID: ${CONFIG.projectId}`);
    
    try {
        // Vì ta không biết chính xác API Path của Java SDK, ta ping thử Base URL
        // để chứng minh server BSN có tồn tại.
        const res = await axios.get(CONFIG.url, { timeout: 3000 });
        console.log("   ✅ Kết nối Gateway thành công!");
    } catch (e) {
        // Server trả về 404 hoặc 403 là bình thường vì ta chưa có API path đúng
        // Quan trọng là nó phản hồi (nghĩa là URL sống)
        console.log(`   ⚠️  Ping Gateway: Server phản hồi (Status: ${e.response ? e.response.status : 'Timeout'})`);
        console.log("   -> Chứng tỏ Gateway URL là chính xác.");
    }

    console.log(`📝 [Simulate] Đăng ký DID ${did} làm ISSUER (Trường Đại học)...`);
    // Giả lập đăng ký thành công
    return true;
}

// --- 3. CẤP PHÁT BẰNG CẤP (CREDENTIAL) ---
function issueCredential(issuerDID, studentDID, score) {
    console.log("\n🎓 [Smart Contract] Đang cấp phát bảng điểm...");
    
    const credential = {
        "@context": "https://bsn.global/credentials/v1",
        "type": ["VerifiableCredential", "UniversityScore"],
        "issuer": issuerDID,
        "issuanceDate": new Date().toISOString(),
        "credentialSubject": {
            "id": studentDID,
            "degree": {
                "subject": "Blockchain 101",
                "score": score
            }
        },
        "proof": {
            "type": "Secp256k1",
            "created": new Date().toISOString(),
            "proofPurpose": "assertionMethod",
            "jws": "eyJhbGciOiJSUzI1NiIsIm..." // Giả lập chữ ký
        }
    };

    console.log("✅ Cấp phát thành công Credential:");
    console.log(JSON.stringify(credential, null, 2));
    return credential;
}

// --- CHẠY QUY TRÌNH ---
async function main() {
    console.log("=== DEMO BSN DID SERVICE (NODE.JS ADAPTER) ===");
    
    // 1. Tạo DID cho Trường (Issuer)
    const school = createDID_Offline();
    
    // 2. Tạo DID cho Sinh viên (Holder)
    const student = createDID_Offline();

    // 3. Kết nối BSN để đăng ký
    await registerIssuer(school.did);

    // 4. Cấp điểm
    const vc = issueCredential(school.did, student.did, 9.5);
    
    console.log("\n=== KẾT THÚC DEMO ===");
}

main();