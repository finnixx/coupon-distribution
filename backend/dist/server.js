"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const voucher_code_generator_1 = __importDefault(require("voucher-code-generator"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get("/coupon", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("get endpoint");
    try {
        const coupon = yield prisma.coupon.findFirst({
            where: { claims: { none: {} } },
            orderBy: { createdAt: "asc" },
        });
        if (!coupon) {
            res.status(404).json({ message: "No available coupons at the moment." });
            return;
        }
        res.json({
            message: "Coupon retrieved successfully.",
            coupon: {
                id: coupon.id,
                code: coupon.code,
                createdAt: coupon.createdAt,
            },
        });
    }
    catch (error) {
        console.error("Error fetching coupon:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
app.post('/claim', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userIP = req.ip;
        const userCookie = req.cookies["coupon_claimed"] || null;
        const couponCode = req.body.coupon;
        const lastClaim = yield prisma.claim.findFirst({
            where: { userIP },
            orderBy: { claimedAt: "desc" },
        });
        if (lastClaim) {
            const timeElapsed = (new Date().getTime() - new Date(lastClaim.claimedAt).getTime()) / 1000;
            if (timeElapsed > 3600) {
                res.status(429).json({
                    message: "Already Claimed",
                });
            }
        }
        if (userCookie) {
            res.status(429).json({ message: "You have already claimed a coupon in this session." });
        }
        const coupon = yield prisma.coupon.findFirst({
            where: { code: couponCode, claims: { none: {} } },
        });
        if (!coupon) {
            res.status(400).json({ message: "Invalid or already claimed coupon code!" });
        }
        if (coupon && userIP) {
            yield prisma.claim.create({
                data: {
                    userIP,
                    cookie: userCookie,
                    couponId: coupon.id,
                    claimedAt: new Date(),
                },
            });
            res.cookie("coupon_claimed", "true", { maxAge: 3600000, httpOnly: true });
            res.json({ message: "Coupon claimed successfully!", coupon: coupon.code });
        }
        const newCouponCode = voucher_code_generator_1.default.generate({
            length: 5,
            count: 10,
            charset: voucher_code_generator_1.default.charset("alphabetic")
        })[0];
        yield prisma.coupon.create({
            data: {
                code: newCouponCode,
            },
        });
    }
    catch (e) {
        console.error(e);
    }
}));
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
