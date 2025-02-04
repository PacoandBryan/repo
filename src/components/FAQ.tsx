import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const faqs = [
  {
    question: "What is the fabric made of?",
    answer: "Almost all fabrics are half cotton and half polyester."
  },
  {
    question: "How should I care for my embroidered bag?",
    answer: "Hand wash in cold water with mild soap. Lay flat to dry and avoid direct sunlight to preserve the vibrant colors of the embroidery."
  },
  {
    question: "Are your products waterproof?",
    answer: "While our bags are made with durable materials, they are not fully waterproof. We recommend avoiding exposure to heavy rain to protect the embroidery."
  },
  {
    question: "How long does shipping take?",
    answer: "Domestic shipping within Mexico takes 2-3 business days. International shipping typically takes 7-14 business days."
  },
  {
    question: "Can I request custom embroidery designs?",
    answer: "Yes! We work with our artisans to create custom designs. Please contact us for custom orders with a minimum 4-week lead time."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of delivery. Items must be unused and in original condition with tags attached."
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#fdf6f8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif tracking-tight text-primary sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-primary/80">
            Find answers to common questions about our products and services.
          </p>
        </div>

        <div className="mt-8 max-w-xl mx-auto">
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 text-sm rounded-full bg-[#fcdce4]/30 border-2 border-[#fcc4d4]/30 placeholder-primary/50 text-primary focus:outline-none focus:border-[#fcc4d4]/50 focus:bg-[#fcdce4]/40 transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-primary/60 hover:text-primary transition-colors duration-200"
                  >
                    <X size={18} />
                  </button>
                )}
                <Search size={18} className="text-primary/60" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <dl className="space-y-6">
            {filteredFaqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <dt className="text-lg font-medium text-primary">
                  {faq.question}
                </dt>
                <dd className="mt-3 text-primary/80">
                  {faq.answer}
                </dd>
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-primary/80">
                  No questions found matching your search.
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  Clear search
                </button>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}