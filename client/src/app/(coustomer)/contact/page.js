'use client';

import { useEffect, useMemo, useState } from 'react';
import { Mail, LoaderCircle } from 'lucide-react';
import Banner from '@/app/component/Banner';
import { supportApi } from '@/lib/api/support-api';
import { getApiErrorMessage } from '@/lib/api/http';
import { useAuthStore } from '@/stores/use-auth-store';

const CONTACT_SUBJECT_OPTIONS = [
  { value: 'general', label: 'General Inquiry', category: 'general' },
  { value: 'support', label: 'Technical Support', category: 'account' },
  { value: 'sales', label: 'Sales', category: 'general' },
  { value: 'feedback', label: 'Feedback', category: 'general' },
  { value: 'other', label: 'Other', category: 'general' },
];

const createEmptyForm = () => ({
  fullName: '',
  email: '',
  subject: '',
  message: '',
});

const createEmptyErrors = () => ({
  fullName: '',
  email: '',
  subject: '',
  message: '',
});

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const ContactPage = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [formData, setFormData] = useState(createEmptyForm);
  const [errors, setErrors] = useState(createEmptyErrors);
  const [successMessage, setSuccessMessage] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignedInUser = Boolean(isAuthenticated && user);

  useEffect(() => {
    if (!isSignedInUser) {
      return;
    }

    setFormData((currentValue) => ({
      ...currentValue,
      fullName: user?.name || '',
      email: user?.email || '',
    }));
  }, [isSignedInUser, user?.email, user?.name]);

  const selectedSubject = useMemo(
    () => CONTACT_SUBJECT_OPTIONS.find((option) => option.value === formData.subject),
    [formData.subject]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((currentValue) => ({
        ...currentValue,
        [name]: '',
      }));
    }

    if (submissionError) {
      setSubmissionError('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const nextErrors = createEmptyErrors();
    let isFormValid = true;

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
      isFormValid = false;
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
      isFormValid = false;
    } else if (!isValidEmail(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
      isFormValid = false;
    }

    if (!formData.subject) {
      nextErrors.subject = 'Please select a subject';
      isFormValid = false;
    }

    if (!formData.message.trim()) {
      nextErrors.message = 'Message is required';
      isFormValid = false;
    } else if (formData.message.trim().length < 10) {
      nextErrors.message = 'Message must be at least 10 characters';
      isFormValid = false;
    }

    setErrors(nextErrors);
    return isFormValid;
  };

  const resetFormAfterSubmit = () => {
    setFormData((currentValue) => ({
      fullName: isSignedInUser ? user?.name || '' : '',
      email: isSignedInUser ? user?.email || '' : '',
      subject: '',
      message: '',
      ...(!isSignedInUser
        ? {}
        : {
            fullName: user?.name || '',
            email: user?.email || '',
          }),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');
    setSuccessMessage('');

    try {
      await supportApi.createConversation({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        subject: selectedSubject?.label || formData.subject,
        category: selectedSubject?.category || 'general',
        priority: 'medium',
        message: formData.message.trim(),
      });

      setErrors(createEmptyErrors());
      resetFormAfterSubmit();
      setSuccessMessage('Your message has been sent successfully. Our team usually replies within 24 hours.');
    } catch (error) {
      setSubmissionError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto mb-10 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-600">Need help or have a question? We&apos;re here for you.</p>
        </div>

        <div className="mb-6 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Send Us a Message</h2>
          <p className="mb-6 text-sm text-gray-600">
            Fill out the form below and we&apos;ll get back to you soon.
          </p>

          {isSignedInUser ? (
            <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              You&apos;re signed in as {user?.name || 'a user'}. We&apos;ll send this message with
              your account details.
            </div>
          ) : null}

          {submissionError ? (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submissionError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {successMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={isSubmitting || isSignedInUser}
                  className={`w-full rounded-md border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  } ${isSignedInUser ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                />
                {errors.fullName ? (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={isSubmitting || isSignedInUser}
                  className={`w-full rounded-md border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } ${isSignedInUser ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                />
                {errors.email ? (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                ) : null}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-700">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full rounded-md border bg-white px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a subject</option>
                {CONTACT_SUBJECT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.subject ? (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              ) : null}
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Tell us how we can help you..."
                disabled={isSubmitting}
                className={`w-full resize-none rounded-md border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.message ? (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              ) : null}
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md bg-green-800 px-8 py-3 font-medium text-white transition duration-200 hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Mail className="h-6 w-6 text-gray-700" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Email Us</h3>
            <p className="mb-1 font-medium text-green-700">yardheroinfo@gmail.com</p>
            <p className="text-sm text-gray-500">We&apos;ll respond within 24 hours</p>
          </div>
        </div>
      </div>
      <Banner />
    </div>
  );
};

export default ContactPage;
