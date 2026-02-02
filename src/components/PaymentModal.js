import React, { useState } from "react";
import { Loader, X, CheckCircle } from "lucide-react";

export default function PaymentModal({ onClose, onConfirm }) {
    const [processing, setProcessing] = useState(false);
    return (
      <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fade-in">
         <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full relative">
            <button onClick={onClose} className="absolute top-3 right-3"><X/></button>
            <div className="text-center">
               <div className="bg-blue-900 text-white py-2 rounded-t-lg -mt-6 -mx-6 mb-6 font-bold">Thai QR Payment</div>
               <img src="/payment.jpg" alt="QR" className="w-48 h-48 object-contain mx-auto mb-4 border-2 border-blue-900 rounded"/>
               <button onClick={() => { setProcessing(true); setTimeout(onConfirm, 2000); }} disabled={processing} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg flex justify-center gap-2">
                 {processing ? <Loader className="animate-spin"/> : <><CheckCircle/> ยืนยันการโอนเงิน</>}
               </button>
            </div>
         </div>
      </div>
    );
}