import React, { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';


export default function FAQ() {
  const { t } = useTranslation();
const faqCategories = {
  [t("FAQ.PI.title")]: [
    {
      question: t("FAQ.PI.Q1"),
      answer: t("FAQ.PI.A1"),
    },
    {
      question: t("FAQ.PI.Q2"),
      answer: t("FAQ.PI.A2"),
    }
  ],
  [t("FAQ.OS.title")]: [
    {
      question: t("FAQ.OS.Q1"),
      answer: t("FAQ.OS.A1"), // corrected typo here
    },
    {
      question: t("FAQ.OS.Q2"),
      answer: t("FAQ.OS.A2"),
    }
  ],
  [t("FAQ.MT.title")]: [
    {
      question: t("FAQ.MT.Q1"),
      answer: t("FAQ.MT.A1"),
    }
  ]
};

  const [searchQuery, setSearchQuery] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  
  const filteredCategories = Object.entries(faqCategories).reduce((acc, [category, questions]) => {
    const filteredQuestions = questions.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredQuestions.length > 0) {
      acc[category] = filteredQuestions;
    }
    return acc;
  }, {} as Record<string, typeof faqCategories[keyof typeof faqCategories]>);

  return (
    <div className="bg-[#fdf6f8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif tracking-tight text-primary sm:text-4xl">
            {t("FAQ.title")}
          </h2>
          <p className="mt-4 text-lg text-primary/80">
            {t("FAQ.subtitle")}
          </p>
        </div>

        <div className="mt-8 max-w-xl mx-auto">
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder={t("FAQ.searchPlaceholder")}
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
          {Object.keys(filteredCategories).length > 0 ? (
            Object.entries(filteredCategories).map(([category, questions]) => (
              <div key={category} className="mb-6">
                <button
                  onClick={() => setOpenCategory(openCategory === category ? null : category)}
                  className="w-full flex items-center justify-between p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <h3 className="text-lg font-medium text-primary">{category}</h3>
                  <ChevronDown
                    size={20}
                    className={`text-primary/60 transition-transform duration-300 ${
                      openCategory === category ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`mt-2 space-y-4 transition-all duration-300 ${
                    openCategory === category ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  {questions.map((faq, index) => (
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
                </div>
              </div>
            ))
          ) : (
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
        </div>
      </div>
    </div>
  );
}