import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Instagram, 
  Facebook, 
  MessageCircle,
  ChevronDown
} from 'lucide-react';

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setFormData({ firstName: '', lastName: '', email: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="pt-16 min-h-screen bg-secondary-light">
      {/* Hero Section */}
      <div className="relative h-[40vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=2000"
          alt="Contact Us"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-serif mb-4 animate-[fade-in-up_1s_ease-out]">
              {t('contact.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 animate-[fade-in-up_1s_ease-out_0.3s]">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl p-8 shadow-soft animate-[fade-in-up_1s_ease-out]">
            <h2 className="text-2xl font-serif text-primary mb-6">
              {t('contact.form.title')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-primary/80 mb-2">
                    {t('contact.form.firstName')}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input"
                    placeholder={t('contact.form.firstNamePlaceholder')}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-primary/80 mb-2">
                    {t('contact.form.lastName')}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input"
                    placeholder={t('contact.form.lastNamePlaceholder')}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary/80 mb-2">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder={t('contact.form.emailPlaceholder')}
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-primary/80 mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="input resize-none"
                  placeholder={t('contact.form.messagePlaceholder')}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full group"
              >
                <Send className={`w-5 h-5 mr-2 transition-transform duration-300 ${
                  isSubmitting ? 'translate-x-2' : 'group-hover:translate-x-1'
                }`} />
                {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 lg:pl-8 animate-[fade-in-up_1s_ease-out_0.3s]">
            <div>
              <h2 className="text-2xl font-serif text-primary mb-6">
                {t('contact.info.title')}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">
                      {t('contact.info.address.title')}
                    </h3>
                    <p className="text-primary/80 mt-1">
                      77 Baker Street, Bondowoso
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">
                      {t('contact.info.phone.title')}
                    </h3>
                    <p className="text-primary/80 mt-1">
                      +62 81 334 61 00
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">
                      {t('contact.info.email.title')}
                    </h3>
                    <p className="text-primary/80 mt-1">
                      contact@diky.mx
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">
                      {t('contact.info.hours.title')}
                    </h3>
                    <p className="text-primary/80 mt-1">
                      {t('contact.info.hours.weekdays')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-serif text-primary mb-4">
                {t('contact.social.title')}
              </h3>
              <p className="text-primary/80 mb-6">
                {t('contact.social.subtitle')}
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors duration-300"
                >
                  <Instagram className="w-6 h-6 text-accent" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors duration-300"
                >
                  <Facebook className="w-6 h-6 text-accent" />
                </a>
              </div>
            </div>

            {/* Language Selector */}
            <div className="relative inline-block">
              <button
                onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')}
                className="flex items-center space-x-2 text-primary/80 hover:text-primary transition-colors duration-300"
              >
                <span>{i18n.language === 'en' ? 'English' : 'Español'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="h-[400px] bg-secondary/20 mt-16">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDI5JzI0LjAiUyAxMTHCsDQxJzI0LjAiRQ!5e0!3m2!1sen!2sid!4v1635134567890!5m2!1sen!2sid"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center hover:bg-accent-dark transition-colors duration-300 group"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
      </button>
    </div>
  );
}