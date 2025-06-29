export const formatDate = (dateString: string, lang: 'az' | 'en' | 'tr'): string => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const locale = lang === 'en' ? 'en-US' : lang === 'tr' ? 'tr-TR' : 'az-AZ';
  
  return new Intl.DateTimeFormat(locale, options).format(date);
};