import express from "express"
import dotenv from "dotenv"
import { PrismaClient } from "@prisma/client";
import cors from 'cors'
import { Request,Response } from "express";
import cookieParser from "cookie-parser";


dotenv.config();

const app = express();
const PORT = process.env.PORT||3000
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


  
app.post('/claim', async (req,res)=>{
    try{
        const userIP = req.ip; 
        const userCookie = req.cookies["coupon_claimed"]||null;
        const couponCode = req.body.coupon;

        const lastClaim = await prisma.claim.findFirst({
            where: { userIP },
            orderBy: { claimedAt: "desc" },
          });

        if(lastClaim){
            const timeElapsed= (new Date().getTime() - new Date(lastClaim.claimedAt).getTime()) / 1000;
            if(timeElapsed>3600){
                res.status(429).json({
                    message: "Already Claimed",
                });
            }
        }
        if (userCookie) {
             res.status(429).json({ message: "You have already claimed a coupon in this session." });
        }

        const coupon = await prisma.coupon.findFirst({
            where: { code: couponCode, claims: { none: {} } }, // Ensure it's unclaimed
          });
      
        if (!coupon) {
             res.status(400).json({ message: "Invalid or already claimed coupon code!" });
        }
      
          // 3️⃣ Store the claim in the database
        if(coupon && userIP){
            await prisma.claim.create({
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

        

    }
    catch(e){
        console.error(e);
    }
})  

app.listen(PORT,()=>{
    console.log(`Server started at port ${PORT}`);
})