import React, { useState } from 'react';
import { api } from '../utils';
import { useAuth } from '../AuthContext';
import { 
  X, 
  CheckCircle, 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Shield,
  Loader,
  AlertCircle
} from 'lucide-react';

const PaymentModal = ({ onClose, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('qr');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const paymentMethods = [
    { id: 'qr', name: 'Thai QR Payment', icon: <QrCode />, description: 'สแกน QR Code เพื่อชำระเงิน' },
    { id: 'card', name: 'บัตรเครดิต/เดบิต', icon: <CreditCard />, description: 'Visa, Mastercard, JCB' },
    { id: 'wallet', name: 'กระเป๋าเงินดิจิทัล', icon: <Smartphone />, description: 'PromptPay, TrueMoney, Rabbit LINE Pay' },
  ];

  const packages = [
    { id: 'monthly', name: 'รายเดือน', price: 99, duration: '30 วัน', features: ['อ่านทุกเรื่องไม่จำกัด', 'ไม่มีโฆษณา', 'อัปเดตล่าสุดก่อนใคร'] },
    { id: 'quarterly', name: 'ราย 3 เดือน', price: 249, duration: '90 วัน', discount: 'ลด 16%', features: ['ทุกอย่างในแพ็คเกจรายเดือน', 'คูปองส่วนลด 50 บาท'] },
    { id: 'yearly', name: 'รายปี', price: 799, duration: '365 วัน', discount: 'ลด 33%', features: ['ทุกอย่างในแพ็คเกจราย 3 เดือน', 'สิทธิ์เข้า Early Access', 'วงล้อเสี่ยงโชค'] },
  ];

  const [selectedPackage, setSelectedPackage] = useState('monthly');

  const handlePayment = async () => {
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call API to upgrade user
      const { data } = await api.post('/upgrade', {
        userId: user._id
      });

      // Update user in context
      updateUser({
        isPremium: true,
        premiumExpiresAt: data.premiumExpiresAt
      });

      setSuccess('ชำระเงินสำเร็จ! บัญชีของคุณถูกอัปเกรดเป็น VIP แล้ว');
      
      // Close modal and refresh after success
      setTimeout(() => {
        onSuccess?.();
        onClose();
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error('Payment error:', err);
      setError('การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl max-w-2xl w-full border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="text-yellow-400" size={24} />
              อัปเกรดเป็นสมาชิก VIP
            </h2>
            <p className="text-gray-400 mt-1">ปลดล็อกทุกความสามารถพิเศษ</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Package Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">เลือกแพ็คเกจ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg">{pkg.name}</h4>
                      <p className="text-gray-400 text-sm">{pkg.duration}</p>
                    </div>
                    {pkg.discount && (
                      <span className="px-2 py-1 bg-green-500 text-green-900 text-xs font-bold rounded">
                        {pkg.discount}
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold">฿{pkg.price}</div>
                    <p className="text-gray-400 text-sm">บาท</p>
                  </div>
                  
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">เลือกวิธีการชำระเงิน</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      {method.icon}
                    </div>
                    <span className="font-semibold">{method.name}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{method.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* QR Code (if selected) */}
          {selectedMethod === 'qr' && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-xl">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-lg mb-4">
                  {/* Mock QR Code */}
                  <div className="w-48 h-48 bg-gray-300 flex items-center justify-center text-gray-600">
                    <div className="text-center">
                      <QrCode size={64} />
                      <p className="mt-2 text-sm">QR Code สำหรับชำระเงิน</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm text-center">
                  สแกน QR Code ด้านบนด้วยแอปพลิเคชันธนาคาร<br />
                  หรือแอปกระเป๋าเงินดิจิทัล
                </p>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-400 mt-0.5" size={20} />
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-green-400 mt-0.5" size={20} />
              <p className="text-green-300">{success}</p>
            </div>
          )}

          {/* Security Note */}
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-xl flex items-start gap-3">
            <Shield className="text-blue-400 mt-0.5" size={20} />
            <div>
              <p className="font-semibold">ปลอดภัย 100%</p>
              <p className="text-gray-400 text-sm mt-1">
                ข้อมูลการชำระเงินของคุณจะถูกเข้ารหัสและปลอดภัย
                เรามีนโยบายคืนเงินภายใน 7 วันหากไม่พอใจ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              ยกเลิก
            </button>
            
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  กำลังดำเนินการ...
                </div>
              ) : (
                <>
                  <CheckCircle className="inline mr-2" size={20} />
                  ยืนยันการชำระเงิน
                </>
              )}
            </button>
          </div>

          {/* Terms */}
          <p className="text-gray-500 text-sm text-center mt-6">
            โดยการชำระเงิน คุณยอมรับ{' '}
            <a href="#" className="text-blue-400 hover:underline">
              ข้อตกลงและเงื่อนไข
            </a>{' '}
            และ{' '}
            <a href="#" className="text-blue-400 hover:underline">
              นโยบายความเป็นส่วนตัว
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;