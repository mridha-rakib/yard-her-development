import React, { useEffect, useMemo, useState } from 'react';
import { Download, Printer, Mail, ChevronLeft, LoaderCircle, ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { adminApi } from '../../lib/api/admin-api';
import { getApiErrorMessage } from '../../lib/api/http';
import { formatCurrency, mapPaymentRecord } from '../../lib/payments';
import { getInitials } from '../../lib/workers';

const PaymentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const seedRecord = location.state?.record;
  const paymentId = seedRecord?.rawPayment?._id || seedRecord?.id || '';
  const [record, setRecord] = useState(seedRecord || null);
  const [isLoading, setIsLoading] = useState(Boolean(paymentId));
  const [error, setError] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');
  const [isRefunding, setIsRefunding] = useState(false);
  const [isAcceptingDispute, setIsAcceptingDispute] = useState(false);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeSummary, setDisputeSummary] = useState('');
  const [disputeProductDescription, setDisputeProductDescription] = useState('');

  useEffect(() => {
    if (!paymentId) {
      setIsLoading(false);
      return;
    }

    let ignore = false;

    const loadPayment = async () => {
      setIsLoading(true);
      setError('');

      try {
        const payment = await adminApi.getPaymentById(paymentId);

        if (!ignore) {
          setRecord(mapPaymentRecord(payment));
        }
      } catch (apiError) {
        if (!ignore) {
          setError(getApiErrorMessage(apiError));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadPayment();

    return () => {
      ignore = true;
    };
  }, [paymentId]);

  useEffect(() => {
    setDisputeSummary('');
    setDisputeProductDescription(record?.jobTitle || '');
  }, [record?.id, record?.jobTitle]);

  const remainingRefundableAmount = useMemo(
    () => Number(record?.remainingRefundableAmount || 0),
    [record]
  );
  const workerName = record?.worker?.name || 'No Hero connected';
  const workerEmail = record?.worker?.email || 'No Hero connected';
  const workerInitials = getInitials(workerName);
  const hasRating = Number.isFinite(record?.rating) && record.rating > 0;
  const paymentMethodBadge = String(record?.paymentMethod || 'Unknown').slice(0, 12).toUpperCase();
  const payoutStatusClasses =
    record?.payoutStatus === 'Paid'
      ? 'bg-green-100 text-green-700'
      : record?.payoutStatus === 'Processing'
        ? 'bg-orange-100 text-orange-700'
        : record?.payoutStatus === 'Failed'
          ? 'bg-red-100 text-red-700'
          : record?.payoutStatus === 'Refunded'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-yellow-100 text-yellow-700';
  const rawDisputeStatus = String(record?.rawPayment?.stripeDisputeStatus || '').toLowerCase();
  const canManageDispute = ['needs_response', 'warning_needs_response', 'warning_under_review'].includes(
    rawDisputeStatus
  );

  const handleRefund = async () => {
    if (!paymentId) {
      return;
    }

    const normalizedAmount = refundAmount ? Number(refundAmount) : remainingRefundableAmount;

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      message.error('Enter a valid refund amount.');
      return;
    }

    setIsRefunding(true);

    try {
      const result = await adminApi.refundPayment(paymentId, {
        amount: normalizedAmount,
        reason: refundReason,
      });

      setRecord(mapPaymentRecord(result.payment));
      setRefundAmount('');
      message.success(
        result.refund?.status === 'succeeded'
          ? 'Refund created successfully.'
          : 'Refund request submitted.'
      );
    } catch (apiError) {
      message.error(getApiErrorMessage(apiError));
    } finally {
      setIsRefunding(false);
    }
  };

  const handleAcceptDispute = async () => {
    if (!paymentId) {
      return;
    }

    setIsAcceptingDispute(true);

    try {
      const result = await adminApi.acceptDispute(paymentId);
      setRecord(mapPaymentRecord(result.payment));
      message.success('Dispute accepted successfully.');
    } catch (apiError) {
      message.error(getApiErrorMessage(apiError));
    } finally {
      setIsAcceptingDispute(false);
    }
  };

  const handleSubmitDisputeEvidence = async () => {
    if (!paymentId) {
      return;
    }

    setIsSubmittingDispute(true);

    try {
      const result = await adminApi.submitDisputeEvidence(paymentId, {
        summary: disputeSummary,
        productDescription: disputeProductDescription,
      });
      setRecord(mapPaymentRecord(result.payment));
      message.success('Dispute evidence submitted successfully.');
    } catch (apiError) {
      message.error(getApiErrorMessage(apiError));
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  if (!record && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">No payment record found</h2>
          <button
            onClick={() => navigate('/payments')}
            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  const platformFeePercentage = Number(record.platformFeePercentage || 12);
  const payoutPercentage = Math.max(0, 100 - platformFeePercentage);
  const platformFee = Number(
    record.platformFee ?? ((record.serviceAmount * platformFeePercentage) / 100).toFixed(2)
  );
  const heroPayout = Number(
    record.workerPayout ?? (record.serviceAmount - platformFee).toFixed(2)
  );

  return (
    <div className="min-h-screen p-6 mt-16 bg-gray-50">
      <div className="mx-auto ">
        <button
          onClick={() => navigate('/payments')}
          className="flex items-center mb-6 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Payment Records
        </button>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg bg-white p-10 text-center text-gray-500 shadow">
            <div className="inline-flex items-center gap-2">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading payment details...
            </div>
          </div>
        ) : null}

        {!isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Job Information */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold">Job Information</h2>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 text-sm text-gray-500">Job Title</div>
                  <div className="font-medium">{record.jobTitle}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1 text-sm text-gray-500">Service Date</div>
                    <div className="font-medium">{record.serviceDate}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-sm text-gray-500">Job ID</div>
                    <div className="font-medium">{record.jobId}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1 text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{record.duration}</div>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-500">Service Address</div>
                  <div className="font-medium">{record.address}</div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold">Customer Information</h2>
              <div className="flex items-start mb-4">
                <div className="flex items-center justify-center w-12 h-12 mr-3 font-semibold text-white rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                  {record.customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium">{record.customer.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Customer ID</div>
                      <div className="font-medium">{record.customerId}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="mb-1 text-sm text-gray-500">Email</div>
                  <div className="text-sm font-medium">{record.customer.email}</div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{record.phone}</div>
                </div>
              </div>
            </div>

            {/* Hero Information */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold">Hero Information</h2>
              <div className="flex items-start mb-4">
                <div className="flex items-center justify-center w-12 h-12 mr-3 font-semibold text-white rounded-full bg-gradient-to-br from-green-400 to-teal-500">
                  {workerInitials}
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium">{workerName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Hero ID</div>
                      <div className="font-medium">{record.workerId}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="mb-1 text-sm text-gray-500">Rating</div>
                  {hasRating ? (
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm font-medium">({record.rating})</span>
                    </div>
                  ) : (
                    <div className="font-medium">Not available</div>
                  )}
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-500">Payout Method</div>
                  <div className="flex items-center font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    {record.paymentMethod}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="mb-1 text-sm text-gray-500">Email</div>
                <div className="text-sm font-medium">{workerEmail}</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Breakdown */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold">Payment Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Service Amount</span>
                  <span className="font-semibold">${record.serviceAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Booking Fee</span>
                  <span className="font-semibold">${record.bookingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Customer Total</span>
                  <span className="font-semibold">${record.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Platform Fee ({platformFeePercentage}%)</span>
                  <span className="font-semibold">-${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Service Fee retained by YardHero</span>
                  <span className="font-semibold">${record.bookingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between px-6 py-3 -mx-6 bg-gray-50">
                  <span className="font-semibold">Hero Payout ({payoutPercentage}%)</span>
                  <span className="text-xl font-bold">${heroPayout.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold">Transaction Details</h2>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 text-sm text-gray-500">Payment Method</div>
                  <div className="flex items-center">
                    <div className="px-2 py-1 mr-2 text-xs font-semibold text-white bg-blue-600 rounded">
                      {paymentMethodBadge}
                    </div>
                    <span className="font-medium">
                      {record.cardEnding === 'N/A'
                        ? record.paymentMethod
                        : `${record.paymentMethod} ending in ${record.cardEnding}`}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-500">Transaction ID</div>
                  <div className="text-sm font-medium tracking-[0.02em]">{record.transactionId}</div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-500">Payment Gateway</div>
                  <div className="font-medium">{record.gateway}</div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-500">Processed At</div>
                  <div className="font-medium">{record.processedAt}</div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-500">Hero Payout Status</div>
                  <div className="flex items-center">
                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${payoutStatusClasses}`}>
                      {record.payoutStatus === 'Paid' && (
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {record.payoutStatus}
                    </div>
                    <span className="ml-3 text-sm text-gray-600">{record.payoutDate}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-500">Refund Status</div>
                  <div className="font-medium">
                    {record.refundStatus
                      ? `${record.refundStatus}${record.refundAmount ? ` • ${formatCurrency(record.refundAmount, record.currency)}` : ''}`
                      : 'No refund issued'}
                  </div>
                  {record.refundedAt ? (
                    <div className="mt-1 text-sm text-gray-500">{record.refundedAt}</div>
                  ) : null}
                  {record.refundFailureReason ? (
                    <div className="mt-1 text-sm text-red-600">{record.refundFailureReason}</div>
                  ) : null}
                </div>
                <div>
                  <div className="mb-1 text-sm text-gray-500">Dispute Status</div>
                  <div className="font-medium">
                    {record.disputeStatus
                      ? `${record.disputeStatus}${record.disputeAmount ? ` • ${formatCurrency(record.disputeAmount, record.currency)}` : ''}`
                      : 'No active dispute'}
                  </div>
                  {record.disputeReason ? (
                    <div className="mt-1 text-sm text-gray-500">Reason: {record.disputeReason}</div>
                  ) : null}
                  {record.disputeEvidenceDueBy ? (
                    <div className="mt-1 text-sm text-gray-500">
                      Evidence due by {record.disputeEvidenceDueBy}
                    </div>
                  ) : null}
                  {record.disputeSubmittedAt ? (
                    <div className="mt-1 text-sm text-gray-500">
                      Last response {record.disputeLastAction || 'submitted'} on {record.disputeSubmittedAt}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
              <div className="space-y-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <ShieldAlert className="h-4 w-4" />
                    Refund Payment
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-gray-600">
                      Refund amount
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={refundAmount}
                        onChange={(event) => setRefundAmount(event.target.value)}
                        placeholder={remainingRefundableAmount.toFixed(2)}
                        disabled={isRefunding || remainingRefundableAmount <= 0}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm text-gray-600">
                      Reason
                      <select
                        value={refundReason}
                        onChange={(event) => setRefundReason(event.target.value)}
                        disabled={isRefunding || remainingRefundableAmount <= 0}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="requested_by_customer">Requested by customer</option>
                        <option value="duplicate">Duplicate</option>
                        <option value="fraudulent">Fraudulent</option>
                      </select>
                    </label>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Remaining refundable balance: {formatCurrency(remainingRefundableAmount, record.currency)}
                  </div>
                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={isRefunding || remainingRefundableAmount <= 0}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRefunding ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Refunding...
                      </>
                    ) : (
                      'Issue Refund'
                    )}
                  </button>
                </div>
                {record.disputeStatus ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <ShieldAlert className="h-4 w-4" />
                      Dispute Response
                    </div>
                    <div className="text-xs text-amber-800">
                      {canManageDispute
                        ? 'This dispute is still actionable. You can accept it or submit evidence to Stripe.'
                        : 'This dispute is no longer awaiting a response.'}
                    </div>
                    <label className="mt-4 block text-sm text-gray-700">
                      Product description
                      <input
                        type="text"
                        value={disputeProductDescription}
                        onChange={(event) => setDisputeProductDescription(event.target.value)}
                        disabled={!canManageDispute || isSubmittingDispute || isAcceptingDispute}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Describe the service delivered"
                      />
                    </label>
                    <label className="mt-3 block text-sm text-gray-700">
                      Evidence summary
                      <textarea
                        rows={5}
                        value={disputeSummary}
                        onChange={(event) => setDisputeSummary(event.target.value)}
                        disabled={!canManageDispute || isSubmittingDispute || isAcceptingDispute}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Explain why the dispute should be challenged. Include service completion details, communication summary, and anything else Stripe should consider."
                      />
                    </label>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={handleSubmitDisputeEvidence}
                        disabled={!canManageDispute || isSubmittingDispute}
                        className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmittingDispute ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Evidence'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleAcceptDispute}
                        disabled={!canManageDispute || isAcceptingDispute}
                        className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isAcceptingDispute ? (
                          <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          'Accept Dispute'
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
                <button className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </button>
                <button className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Details
                </button>
                <button className="flex items-center justify-center w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Summary
                </button>
              </div>
            </div>
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentDetails;
