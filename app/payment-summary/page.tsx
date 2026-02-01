'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { submitRefundRequest } from '../../lib/razorpay';
import { formatCurrency, formatDate, paisaToAmount } from '../../lib/utils';

type PaymentStatus = 'success' | 'processing' | 'failed';

export default function PaymentSummary() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams?.get('paymentId');
  
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refundReason, setRefundReason] = useState('');
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundStatus, setRefundStatus] = useState<{ status: string; message: string } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Effect for mouse tracking (for background effects)
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    }

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Fetch payment details
  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }

    // In a real application, you would fetch payment details from your database
    // For demo purposes, we're creating a mock payment
    setTimeout(() => {
      // Mock payment data
      const mockPayment = {
        paymentId: paymentId,
        orderId: `order_${Date.now().toString().substring(0, 10)}`,
        amount: 7500000, // Amount in paisa (75,000 INR)
        currency: 'INR',
        status: 'success',
        method: 'card',
        email: 'deepakgariya5555@gmail.com',
        contact: '+91 8266947434',
        timestamp: new Date().toISOString(),
      };
      
      setPayment(mockPayment);
      setLoading(false);
    }, 1500);
  }, [paymentId]);

  // Handle refund request submission
  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!refundReason.trim()) {
      setRefundStatus({
        status: 'error',
        message: 'Please provide a reason for your refund request.'
      });
      return;
    }

    setRefundStatus({
      status: 'processing',
      message: 'Processing your refund request...'
    });

    try {
      const response = await submitRefundRequest(
        paymentId || '',
        refundReason,
        payment?.email || ''
      );

      if (response.success) {
        setRefundStatus({
          status: 'success',
          message: response.message
        });
        setShowRefundForm(false);
      } else {
        setRefundStatus({
          status: 'error',
          message: response.message
        });
      }
    } catch (error) {
      setRefundStatus({
        status: 'error',
        message: 'An error occurred while processing your request. Please try again.'
      });
    }
  };

  // Handle "Resume Plan" action
  const handleResumePlan = () => {
    router.push('/cart');
  };

  return (
    <div className="payment-summary-page">
      <div id="particles" className="particles"></div>
      
      <div className="hero-bg">
        <div 
          className="hero-blob blob-1" 
          style={{ 
            transform: `translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)` 
          }}
        ></div>
        <div 
          className="hero-blob blob-2" 
          style={{ 
            transform: `translate(${-mousePosition.x * 50}px, ${-mousePosition.y * 50}px)` 
          }}
        ></div>
      </div>
      
      <div className="container">
        <header>
          <nav>
            <div className="logo">MASTERCRAFT</div>
            <div className="nav-links">
              <button className="back-btn" onClick={() => router.push("/")}>
                <span className="back-arrow">←</span> Back to Home
              </button>
            </div>
          </nav>
        </header>

        <main>
          <div className="header animate-fadeIn">
            <h1>Payment Summary</h1>
            <p className="subtitle">
              {!loading && payment ? (
                <span className="highlight-text">
                  {payment.status === 'success' ? 'Payment Successful' : 'Payment Processing'}
                </span>
              ) : !loading && !payment ? (
                <span className="highlight-text error">Payment Not Found</span>
              ) : (
                <span>Loading payment details...</span>
              )}
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Retrieving your payment details...</p>
            </div>
          ) : !payment ? (
            <div className="error-container">
              <div className="error-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>Payment Not Found</h2>
              <p>We couldn't find any payment details with the provided ID. This might happen if:</p>
              <ul>
                <li>The payment was not completed</li>
                <li>The payment ID is incorrect</li>
                <li>The payment session has expired</li>
              </ul>
              <button className="btn btn-primary" onClick={() => router.push('/cart')}>
                Return to Cart
              </button>
            </div>
          ) : (
            <div className="summary-container animate-fadeIn">
              <div className="payment-status-banner" data-status={payment.status}>
                <div className="status-icon">
                  {payment.status === 'success' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : payment.status === 'processing' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M19.07 19.07L16.24 16.24M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="status-text">
                  <h3>
                    {payment.status === 'success' ? 'Payment Successful' : 
                     payment.status === 'processing' ? 'Payment Processing' : 
                     'Payment Failed'}
                  </h3>
                  <p>
                    {payment.status === 'success' ? 'Your payment has been successfully processed.' : 
                     payment.status === 'processing' ? 'Your payment is being processed. This may take a moment.' : 
                     'There was an issue with your payment. Please try again.'}
                  </p>
                </div>
              </div>

              <div className="summary-card">
                <h2>Transaction Details</h2>
                
                <div className="details-grid">
                  <div className="detail-row">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value amount">
                      {formatCurrency(paisaToAmount(payment.amount), payment.currency)}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Payment ID</span>
                    <span className="detail-value">{payment.paymentId}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Order ID</span>
                    <span className="detail-value">{payment.orderId}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Payment Method</span>
                    <span className="detail-value method">
                      <span className="method-icon">
                        {payment.method === 'card' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        ) : payment.method === 'upi' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 15L12 9L17 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 9V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 4V22M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      {payment.method === 'card' ? 'Credit/Debit Card' : 
                       payment.method === 'upi' ? 'UPI' : 
                       payment.method === 'netbanking' ? 'Net Banking' : 
                       payment.method}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Date & Time</span>
                    <span className="detail-value">{formatDate(payment.timestamp)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{payment.email}</span>
                  </div>
                  
                  {payment.contact && (
                    <div className="detail-row">
                      <span className="detail-label">Contact</span>
                      <span className="detail-value">{payment.contact}</span>
                    </div>
                  )}
                </div>
                
                {refundStatus && (
                  <div className={`refund-status ${refundStatus.status}`}>
                    <div className="status-icon">
                      {refundStatus.status === 'success' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : refundStatus.status === 'error' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2V6M12 18V22M6 12H2M22 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>{refundStatus.message}</span>
                  </div>
                )}
                
                {showRefundForm ? (
                  <form className="refund-form" onSubmit={handleRefundSubmit}>
                    <h3>Request a Refund</h3>
                    <div className="form-field">
                      <label htmlFor="refundReason">Please provide the reason for your refund request:</label>
                      <textarea 
                        id="refundReason" 
                        rows={3} 
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Enter your reason here..."
                        required
                      ></textarea>
                    </div>
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setShowRefundForm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={refundStatus?.status === 'processing'}
                      >
                        {refundStatus?.status === 'processing' ? (
                          <>
                            <span className="btn-spinner"></span>
                            <span>Processing...</span>
                          </>
                        ) : (
                          'Submit Request'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="action-buttons">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowRefundForm(true)}
                      disabled={refundStatus?.status === 'success'}
                    >
                      Request Refund
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleResumePlan}
                    >
                      Resume Plan
                    </button>
                  </div>
                )}
              </div>
              
              <div className="razorpay-powered">
                <p>Powered by</p>
                <div className="razorpay-logo">
                  <svg width="100" height="22" viewBox="0 0 100 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25.8 10L15 22H28L38.9 10H25.8Z" fill="#3395FF"/>
                    <path d="M20.5 15L13.5 22H25.4L32.5 15H20.5Z" fill="#072654"/>
                    <path d="M52.7 3.9V14.6C52.7 15.7 52.2 16.5 51.2 16.5C50.3 16.5 49.8 15.9 49.8 14.8V3.9H47V15C47 17.4 48.5 19 51.1 19C53.9 19 55.5 17.4 55.5 14.8V3.9H52.7Z" fill="currentColor"/>
                    <path d="M62.5 6.5V3.9H59.6V19H62.5V11.4C62.5 9.2 64.2 8.2 66 8.2H66.4V6C66.4 5.7 66.4 5.4 66.2 5.2C65.8 4.5 64.9 4.3 64.3 4.7C63.3 5.3 62.6 6.1 62.5 6.5Z" fill="currentColor"/>
                    <path d="M75.7 6.6V3.9H72.8V19H75.7V11.5C75.7 9.3 77.4 8.3 79.2 8.3H79.5V6.1C79.6 5.8 79.5 5.5 79.4 5.3C79 4.6 78.1 4.3 77.4 4.8C76.5 5.4 75.8 6.1 75.7 6.6Z" fill="currentColor"/>
                    <path d="M87.8 4C83.9 4 81 6.8 81 11.5C81 16.2 83.9 19 87.8 19C91.7 19 94.6 16.2 94.6 11.5C94.6 6.8 91.7 4 87.8 4ZM87.8 16.5C85.7 16.5 83.9 14.7 83.9 11.5C83.9 8.3 85.7 6.5 87.8 6.5C89.9 6.5 91.7 8.3 91.7 11.5C91.7 14.7 89.9 16.5 87.8 16.5Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer>
          <div className="footer-content">
            <div className="footer-logo">MASTERCRAFT</div>
            <p className="footer-text">Creating world-class digital experiences since 2002</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <span className="divider">•</span>
              <a href="#">Terms of Service</a>
              <span className="divider">•</span>
              <a href="#">Contact Support</a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        /* CSS Variables */
        :root {
          --radius: 0.625rem;
          --background: oklch(0.145 0 0);
          --foreground: oklch(0.985 0 0);
          --card: oklch(0.205 0 0);
          --card-foreground: oklch(0.985 0 0);
          --primary: oklch(0.922 0 0);
          --primary-foreground: oklch(0.205 0 0);
          --secondary: oklch(0.269 0 0);
          --secondary-foreground: oklch(0.985 0 0);
          --muted: oklch(0.269 0 0);
          --muted-foreground: var(--light-100);
          --accent: oklch(0.269 0 0);
          --accent-foreground: oklch(0.985 0 0);
          --destructive: oklch(0.704 0.191 22.216);
          --border: oklch(1 0 0 / 10%);
          --input: oklch(1 0 0 / 15%);
          --ring: oklch(0.556 0 0);
          --color-primary-100: #dddfff;
          --color-primary-200: #cac5fe;
          --color-light-100: #d6e0ff;
          --color-dark-100: #020408;
          --color-dark-200: #27282f;
          --color-dark-300: #242633;
          --font-mona-sans: "Mona Sans", sans-serif;
          --status-success: #22c55e;
          --status-processing: #3b82f6;
          --status-error: #ef4444;
        }

        /* Global Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: var(--font-mona-sans), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        body {
          background: var(--background);
          color: var(--foreground);
          min-height: 100vh;
          overflow-x: hidden;
          background-image: 
            radial-gradient(circle at 10% 10%, rgba(70, 70, 120, 0.05) 0%, transparent 60%),
            radial-gradient(circle at 90% 90%, rgba(100, 100, 160, 0.05) 0%, transparent 60%);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        /* Header Styles */
        header {
          padding: 2rem 0;
          position: relative;
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 1px;
          background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .nav-links {
          display: flex;
          align-items: center;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--color-light-100);
          font-size: 0.95rem;
          opacity: 0.8;
          cursor: pointer;
          transition: opacity 0.3s;
          padding: 8px 16px;
        }

        .back-btn:hover {
          opacity: 1;
        }

        .back-arrow {
          font-size: 1.2rem;
          position: relative;
          top: -1px;
        }

        /* Payment Summary Styles */
        .payment-summary-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        main {
          flex: 1;
          padding: 2rem 0 4rem;
        }

        .header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .header h1 {
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #ffffff 0%, var(--color-primary-100) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          line-height: 1.2;
        }

        .subtitle {
          font-size: 1.1rem;
          color: var(--color-light-100);
          opacity: 0.9;
        }

        .highlight-text {
          color: var(--status-success);
          font-weight: 500;
        }

        .highlight-text.error {
          color: var(--status-error);
        }

        /* Loading Container */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 0;
          gap: 1.5rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--color-primary-200);
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-container p {
          color: var(--color-light-100);
          opacity: 0.8;
          font-size: 1rem;
        }

        /* Error Container */
        .error-container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(145deg, rgba(25, 27, 32, 0.7), rgba(15, 17, 22, 0.7));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .error-icon {
          color: var(--status-error);
          margin-bottom: 1.5rem;
        }

        .error-container h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #ffffff;
        }

        .error-container p {
          margin-bottom: 1rem;
          color: var(--color-light-100);
          opacity: 0.9;
        }

        .error-container ul {
          list-style-position: inside;
          text-align: left;
          margin-bottom: 2rem;
          color: var(--color-light-100);
          opacity: 0.8;
        }

        .error-container li {
          margin-bottom: 0.5rem;
        }

        /* Summary Container */
        .summary-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Payment Status Banner */
        .payment-status-banner {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          animation: fadeIn 0.5s ease;
        }

        .payment-status-banner[data-status="success"] {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .payment-status-banner[data-status="processing"] {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .payment-status-banner[data-status="failed"] {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .status-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
        }

        .payment-status-banner[data-status="success"] .status-icon {
          color: var(--status-success);
        }

        .payment-status-banner[data-status="processing"] .status-icon {
          color: var(--status-processing);
          animation: pulse 1.5s infinite;
        }

        .payment-status-banner[data-status="failed"] .status-icon {
          color: var(--status-error);
        }

        .status-text {
          flex: 1;
        }

        .status-text h3 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .status-text p {
          color: var(--color-light-100);
          opacity: 0.9;
          line-height: 1.5;
        }

        /* Summary Card */
        .summary-card {
          background: linear-gradient(145deg, rgba(25, 27, 32, 0.7), rgba(15, 17, 22, 0.7));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .summary-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--color-primary-200), transparent);
          opacity: 0.7;
        }

        .summary-card h2 {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          color: #ffffff;
        }

        /* Details Grid */
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        @media (max-width: 640px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-label {
          font-size: 0.85rem;
          color: var(--color-light-100);
          opacity: 0.7;
        }

        .detail-value {
          font-size: 1rem;
          color: #ffffff;
        }

        .detail-value.amount {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--color-primary-100);
        }

        .detail-value.method {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .method-icon {
          display: flex;
          align-items: center;
          color: var(--color-primary-200);
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        @media (max-width: 480px) {
          .action-buttons {
            flex-direction: column;
          }
        }

        .btn {
          border: none;
          border-radius: 10px;
          padding: 0.875rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--color-primary-200), var(--color-primary-100));
          color: var(--color-dark-100);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(202, 197, 254, 0.3);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-light-100);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(10, 10, 10, 0.3);
          border-radius: 50%;
          border-top-color: var(--color-dark-100);
          animation: spin 1s ease-in-out infinite;
        }

        /* Refund Form */
        .refund-form {
          margin-top: 1rem;
          animation: fadeIn 0.5s ease;
        }

        .refund-form h3 {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          color: #ffffff;
        }

        .form-field {
          margin-bottom: 1.5rem;
        }

        .form-field label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
          color: var(--color-light-100);
        }

        .form-field textarea {
          width: 100%;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #ffffff;
          font-size: 0.95rem;
          resize: vertical;
          min-height: 100px;
          transition: all 0.3s ease;
        }

        .form-field textarea:focus {
          outline: none;
          border-color: var(--color-primary-200);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 2px rgba(202, 197, 254, 0.2);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        /* Refund Status */
        .refund-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          animation: fadeIn 0.5s ease;
        }

        .refund-status.success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: var(--status-success);
        }

        .refund-status.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--status-error);
        }

        .refund-status.processing {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: var(--status-processing);
        }

        /* Razorpay Logo */
        .razorpay-powered {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-top: 3rem;
        }

        .razorpay-powered p {
          font-size: 0.8rem;
          color: var(--color-light-100);
          opacity: 0.7;
        }

        .razorpay-logo {
          color: var(--color-light-100);
          opacity: 0.9;
        }

        /* Blobs/Gradients */
        .hero-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
        }

        .hero-blob {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.05;
          background: linear-gradient(135deg, var(--color-primary-200), transparent);
          pointer-events: none;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .blob-1 {
          top: -200px;
          left: -200px;
        }

        .blob-2 {
          bottom: -300px;
          right: -200px;
          background: linear-gradient(135deg, var(--color-light-100), transparent);
        }

        /* Particles */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background-color: rgba(202, 197, 254, 0.3);
          border-radius: 50%;
          opacity: 0;
          animation: float 15s infinite linear;
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-500px) translateX(100px);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        /* Footer Section */
        footer {
          padding: 3rem 0;
          text-align: center;
          margin-top: 2rem;
        }

        .footer-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .footer-logo {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 1px;
          background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-200));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 1rem;
        }

        .footer-text {
          color: var(--color-light-100);
          opacity: 0.7;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 12px;
          align-items: center;
        }

        .footer-links a {
          color: var(--color-light-100);
          opacity: 0.7;
          text-decoration: none;
          font-size: 0.85rem;
          transition: opacity 0.3s ease;
        }

        .footer-links a:hover {
          opacity: 1;
          color: var(--color-primary-100);
        }

        .divider {
          opacity: 0.4;
          font-size: 0.85rem;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
          .header h1 {
            font-size: 2.2rem;
          }

          .container {
            padding: 1rem;
          }
          
          main {
            padding: 1rem 0 3rem;
          }
          
          .header {
            margin-bottom: 2rem;
          }
          
          .payment-status-banner {
            padding: 1.2rem;
          }
          
          .summary-card {
            padding: 1.5rem;
          }
          
          .details-grid {
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .header h1 {
            font-size: 1.8rem;
          }
          
          .payment-status-banner {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}