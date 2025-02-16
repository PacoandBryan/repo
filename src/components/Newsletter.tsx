import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Newsletter() {
  const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the newsletter subscription
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="bg-[#fdf6f8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif tracking-tight text-primary sm:text-4xl">
            {t("newseller.title")}
          </h2>
          <p className="mt-4 text-lg text-primary/80">
            {t("newseller.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="relative flex-grow">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newseller.mail")}
                  className="w-full pl-4 pr-12 py-3 text-sm rounded-full bg-white/70 border-2 border-[#fcc4d4]/30 
                    placeholder-primary/50 text-primary 
                    focus:outline-none focus:border-[#fcc4d4]/50 focus:bg-white/90
                    transition-all duration-300"
                  required
                />
                <Send size={18} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary/40" />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white 
                  bg-accent rounded-full hover:bg-accent/90 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-accent/50 transition-all duration-300
                  sm:w-auto w-full"
              >
                {t("newseller.sub")}
              </button>
            </div>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-sm text-accent animate-fade-in">
              Thank you for subscribing! We'll be in touch soon.
            </p>
          )}

          <p className="mt-4 text-sm text-primary/60">
            {t("newseller.Terms")}
          </p>
        </div>
      </div>
    </div>
  );
}