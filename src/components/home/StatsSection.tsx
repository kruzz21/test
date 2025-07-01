import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import CounterAnimation from '../ui/CounterAnimation';
import { Trophy, Wrench, Users, Award } from 'lucide-react';

const StatsSection = () => {
  const { t } = useTranslation();
  
  const stats = [
    { 
      value: 10000, 
      label: "Knee Replacements", 
      icon: Trophy,
      color: "from-yellow-400 to-orange-500"
    },
    { 
      value: 5000, 
      label: "Fracture Surgeries", 
      icon: Wrench,
      color: "from-blue-400 to-blue-600"
    },
    { 
      value: 3500, 
      label: "Arthroscopic Procedures", 
      icon: Users,
      color: "from-green-400 to-green-600"
    },
    { 
      value: 25, 
      label: "Years Experience", 
      icon: Award,
      color: "from-purple-400 to-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
      </div>
      
      <div className="container relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Proven Track Record of Excellence
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Numbers that reflect our commitment to patient care and surgical excellence
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative mb-6">
                {/* Icon Background */}
                <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-blue-600 font-bold text-sm">+</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl md:text-5xl font-bold">
                  <CounterAnimation end={stat.value} duration={2} />
                  <span className="text-2xl">+</span>
                </h3>
                <p className="text-lg text-blue-100 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Experience Excellence?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of patients who have trusted Dr. Eryanılmaz with their orthopedic care.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Schedule Consultation
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;