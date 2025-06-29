import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const ContactForm = () => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    try {
      setSubmitError(null);
      
      // Updated URL with your new deployment
      const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxvOF5ch-QWihWh3K_Azd7fzuZhPCLROGTNXIdpXOXhne8MSiW7T__k7k-tp5qExjvF/exec';
      
      // Create URLSearchParams for proper form encoding
      const formData = new URLSearchParams();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone || '');
      formData.append('message', data.message);
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      // Check if the request was successful
      if (response.ok) {
        setIsSubmitted(true);
        reset();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('Failed to send message. Please try again or contact us directly.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-green-800 mb-2">
          {t('contact.form.success.title')}
        </h3>
        <p className="text-green-700 mb-4">
          {t('contact.form.success.message')}
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="btn btn-outline text-green-600 border-green-600 hover:bg-green-50"
        >
          {t('contact.form.success.sendAnother')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium">{t('contact.form.error.title')}</h4>
            <p className="text-red-700 text-sm mt-1">{submitError}</p>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="name" className="form-label">
          {t('contact.form.name')} <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          className={`form-input ${errors.name ? 'border-red-500' : ''}`}
          {...register('name', { required: t('contact.form.validation.nameRequired') })}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email" className="form-label">
          {t('contact.form.email')} <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          className={`form-input ${errors.email ? 'border-red-500' : ''}`}
          {...register('email', {
            required: t('contact.form.validation.emailRequired'),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('contact.form.validation.emailInvalid')
            }
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="phone" className="form-label">
          {t('contact.form.phone')}
        </label>
        <input
          id="phone"
          type="tel"
          className="form-input"
          {...register('phone')}
        />
      </div>
      
      <div>
        <label htmlFor="message" className="form-label">
          {t('contact.form.message')} <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          className={`form-input ${errors.message ? 'border-red-500' : ''}`}
          {...register('message', { required: t('contact.form.validation.messageRequired') })}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>
      
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
      </button>
    </form>
  );
};

export default ContactForm;