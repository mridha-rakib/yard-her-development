'use client';
import React, { useState } from 'react';
import { CreditCard, Briefcase, User, Wrench, Mail, Phone, Clock, ChevronDown, Send } from 'lucide-react';

const HelpSupportPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: '',
    message: ''
  });

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.issueType || !formData.message) {
      alert('Please fill in all fields');
      return;
    }
    console.log('Form submitted:', formData);
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', issueType: '', message: '' });
  };

  const quickHelpCards = [
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Payment Issues',
      description: 'Questions about payments, fees, or payment delays',
      color: 'emerald'
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Job Problems',
      description: 'Issues with job assignments, cancellations, or disputes',
      color: 'blue'
    },
    {
      icon: <User className="w-6 h-6" />,
      title: 'Account Questions',
      description: 'Profile updates, verification, or account settings',
      color: 'purple'
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: 'Technical Support',
      description: 'App issues, bugs, or technical difficulties',
      color: 'orange'
    }
  ];

  const faqs = [
    {
      question: 'When do I get paid?',
      answer: 'Payments are processed through Stripe Express after you complete a job and the customer confirms completion. Stripe is secure, trustworthy, and transfers payouts to your connected bank account.'
    },
    {
      question: 'How does the 12% platform fee work?',
      answer: 'We charge a 12% platform fee on each job to maintain and improve our service. This means you keep 88% of every job payment. For example, if a job pays $100, you receive $88 after the platform fee.'
    },
    {
      question: 'What if a customer cancels?',
      answer: 'If a customer cancels before you start the job, there is no penalty. If they cancel after you\'ve started, you may be eligible for partial compensation. Contact our support team to review your specific situation.'
    },
    {
      question: 'How do I update my profile?',
      answer: 'Go to Settings > Profile Settings to update your personal information, profile picture, bio, and service offerings. Make sure to keep your information current to attract more customers.'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      emerald: 'bg-emerald-50 text-emerald-600',
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div 
       style={{
        background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%);'
       }}
      >
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Help & Support</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We&apos;re here to help you with jobs, payments, and account issues. Get the answers you need quickly and easily.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Quick Help Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Quick Help</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickHelpCards.map((card, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              >
                <div className={`w-12 h-12 ${getColorClasses(card.color)} rounded-lg flex items-center justify-center mb-4`}>
                  {card.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Frequently Asked Questions</h2>
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <div key={index} className="p-5">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Still Need Help?</h2>
          <p className="text-gray-600 mb-8">
            Contact our support team directly and we&apos;ll get back to you as soon as possible.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Get in Touch */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Get in Touch</h3>
              <div className="space-y-4">
                {/* Email Support */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 mb-1">Email Support</p>
                    <a 
                      href="mailto:yardheroinfo@gmail.com"
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      yardheroinfo@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone Support */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 mb-1">Phone Support</p>
                    <a 
                      href="tel:+15551234567" 
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      (555) 123-4567
                    </a>
                  </div>
                </div>

                {/* Response Time */}
                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 mb-1">Response Time</p>
                    <p className="text-sm text-gray-600">
                      We usually respond within 24 hours. Urgent cases are given priority.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Send a Message */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Send us a Message</h3>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Issue Type */}
                <div>
                  <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Type
                  </label>
                  <div className="relative">
                    <select
                      id="issueType"
                      name="issueType"
                      value={formData.issueType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors appearance-none bg-white"
                    >
                      <option value="">Select an issue type</option>
                      <option value="payment">Payment Issues</option>
                      <option value="job">Job Problems</option>
                      <option value="account">Account Questions</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
                    placeholder="Describe your issue here..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-8 text-center border border-emerald-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Immediate Assistance?</h3>
          <p className="text-gray-600 mb-4">
            For urgent matters or safety concerns, please call our 24/7 support line
          </p>
          <a 
            href="tel:+15551234567"
            className="inline-flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-800 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Call (555) 123-4567
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
