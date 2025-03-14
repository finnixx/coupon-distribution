import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BACKEND_URL } from "../config";



const CouponApp =() => {
  const [couponCode, setCouponCode] = useState<string>("");
  const [claimedCoupon, setClaimedCoupon] = useState<string | null>(null);
  const [availableCoupon, setAvailableCoupon] = useState<string | null>(null);

  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(event.target.value);
  };

  
  const claimCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code!");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/claim`, { couponCode });
      setClaimedCoupon(response.data.coupon);
      toast.success("Coupon claimed successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error claiming coupon");
    }
  };

  
  const fetchCoupon = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/coupon`);
      setAvailableCoupon(response.data.coupon.code);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "No coupons available");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Coupon Claim System</h1>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Claim a Coupon</h2>
        <input
          type="text"
          placeholder="Enter coupon code..."
          value={couponCode}
          onChange={handleInputChange}
          className="border border-gray-300 p-2 rounded-lg w-full mb-3"
        />
        <button
          onClick={claimCoupon}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600"
        >
          Claim Coupon
        </button>

        {claimedCoupon && (
          <div className="mt-4 bg-green-200 text-green-800 p-3 rounded-lg">
            <p className="text-lg font-semibold">Claimed Coupon:</p>
            <p className="text-2xl font-bold">{claimedCoupon}</p>
          </div>
        )}
      </div>

      
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Get an Available Coupon</h2>
        <button
          onClick={fetchCoupon}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg w-full hover:bg-gray-600"
        >
          Fetch Coupon
        </button>

        {availableCoupon && (
          <div className="mt-4 bg-blue-200 text-blue-800 p-3 rounded-lg">
            <p className="text-lg font-semibold">Available Coupon:</p>
            <p><strong>Coupon Code:</strong> {availableCoupon}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponApp;
