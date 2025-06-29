import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <a
      href="https://wa.me/994553977874"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
};

export default WhatsAppButton;