"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
const argon = __importStar(require("argon2"));
const prisma = new client_1.PrismaClient();
async function main() {
    dotenv.config();
    console.log('Seeding...');
    const superAdmin = await prisma.user.upsert({
        where: { email: 'anonymou@bumou.com' },
        update: {},
        create: {
            id: 'anonymous',
            email: 'anonymou@bumou.com',
            password: await argon.hash('11223344'),
            phone: '1234567890',
            firstName: 'Anonymous',
            lastName: 'User',
            isVerified: true,
            username: 'anonymous',
            profilePicture: 'https://imageio.forbes.com/specials-images/imageserve/5ed68e8310716f0007411996/A-black-screen--like-the-one-that-overtook-the-internet-on-the-morning-of-June-2-/960x0.jpg',
        },
    });
    console.log({ superAdmin });
}
main()
    .catch((e) => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map