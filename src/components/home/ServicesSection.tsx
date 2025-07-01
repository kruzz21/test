import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Bone, Activity, Baby, Heart, Wrench, ArrowRight } from 'lucide-react';

const ServicesSection = () => {
  const { t, i18n } = useTranslation();
  
  const services = [
    {
      id: 1,
      title: "Joint Replacements",
      description: "Advanced knee, hip, and shoulder replacement surgeries using the latest surgical techniques.",
      icon: Bone,
      color: "from-blue-500 to-blue-600",
      procedures: ["Total Knee Replacement", "Hip Replacement", "Shoulder Replacement", "Revision Surgery"]
    },
    {
      id: 2,
      title: "Arthroscopic Surgeries",
      description: "Minimally invasive procedures for joint problems with faster recovery times.",
      icon: Activity,
      color: "from-green-500 to-green-600",
      procedures: ["ACL Reconstruction", "Meniscus Repair", "Rotator Cuff Repair", "Shoulder Arthroscopy"]
    },
    {
      id: 3,
      title: "Trauma Surgery",
      description: "Emergency fracture treatment and complex trauma reconstruction.",
      icon: Wrench,
      color: "from-red-500 to-red-600",
      procedures: ["Fracture Fixation", "Emergency Surgery", "Trauma Reconstruction", "Complex Repairs"]
    },
    {
      id: 4,
      title: "Pediatric Orthopedics",
      description: "Specialized care for children's bone and joint conditions.",
      icon: Baby,
      color: "from-purple-500 to-purple-600",
      procedures: ["Clubfoot Treatment", "Hip Dysplasia", "Growth Disorders", "Pediatric Trauma"]
    },
    {
      id: 5,
      title: "Nerve Entrapment",
      description: "Treatment for compressed nerves and related conditions.",
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      procedures: ["Carpal Tunnel", "Cubital Tunnel", "Nerve Decompression", "Nerve Repair"]
    },
    {
      id: 6,
      title: "Sports Injuries",
      description: "Comprehensive care for athletes and sports-related injuries.",
      icon: Activity,
      color: "from-orange-500 to-orange-600",
      procedures: ["Sports Medicine", "Injury Prevention", "Rehabilitation", "Performance Recovery"]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Medical Specializations
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive orthopedic care covering all aspects of musculoskeletal health, from emergency 
            trauma to elective joint replacement surgery.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Service Header */}
              <div className={`bg-gradient-to-br ${service.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative z-10">
                  <service.icon className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold">{service.title}</h3>
                </div>
              </div>

              {/* Service Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Procedures List */}
                <div className="space-y-2 mb-6">
                  {service.procedures.map((procedure, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      {procedure}
                    </div>
                  ))}
                </div>

                {/* Learn More Link */}
                <Link 
                  to="/services"
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:translate-x-1 transform duration-300"
                >
                  Learn More
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Link 
            to="/services" 
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            View All Services
            <ChevronRight size={20} className="ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;